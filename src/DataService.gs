/**
 * SheetUtils — helpers genéricos de lectura de pestañas (solo lectura).
 */
var SheetUtils = (function () {
  function ss() {
    // Script independiente: abre por ID. Script vinculado: usa la hoja activa.
    if (APP.SPREADSHEET_ID) return SpreadsheetApp.openById(APP.SPREADSHEET_ID);
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  function getSheet(name) {
    var sheet = ss().getSheetByName(name);
    if (!sheet) throw new Error('No se encontró la pestaña "' + name + '".');
    return sheet;
  }

  /**
   * Lee una pestaña con encabezados en la primera fila.
   * Devuelve { headers:[...], rows:[ {header: value, ...}, ... ] }.
   */
  function readTable(name) {
    var sheet = getSheet(name);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) return { headers: [], rows: [] };

    var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = values[0].map(function (h) { return String(h || '').trim(); });

    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var obj = {};
      var hasData = false;
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        obj[headers[c]] = values[i][c];
        if (values[i][c] !== '' && values[i][c] !== null) hasData = true;
      }
      if (hasData) rows.push(obj);
    }
    return { headers: headers, rows: rows };
  }

  /** Encuentra el valor de un campo cuyo encabezado contiene alguno de los textos dados. */
  function pick(obj, candidates) {
    var keys = Object.keys(obj);
    for (var i = 0; i < candidates.length; i++) {
      var needle = candidates[i].toLowerCase();
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].toLowerCase().indexOf(needle) !== -1) return obj[keys[k]];
      }
    }
    return '';
  }

  /**
   * Encuentra el NOMBRE de la pestaña cuya fila de encabezados contiene TODOS
   * los textos requeridos. Permite leer pestañas sin conocer su nombre exacto
   * (resultados, pole/DoD, scoring), tolerando variaciones de nombre.
   */
  function findSheetName(required) {
    var sheets = ss().getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var sh = sheets[i];
      var lc = sh.getLastColumn();
      if (lc < 1) continue;
      var hdr = sh.getRange(1, 1, 1, lc).getValues()[0].map(function (h) {
        return String(h || '').trim().toLowerCase();
      });
      var ok = required.every(function (req) {
        var n = req.toLowerCase();
        return hdr.some(function (h) { return h === n || h.indexOf(n) !== -1; });
      });
      if (ok) return sh.getName();
    }
    return null;
  }

  return { getSheet: getSheet, readTable: readTable, pick: pick, findSheetName: findSheetName };
})();


/**
 * ¿El estado de la hoja indica que el participante YA hizo su pick?
 * La hoja usa "Aceptado" / "Pendiente". Tratamos como "hecho" todo lo que
 * no sea Pendiente ni vacío (también cubre OK / Autopick / Duplicado).
 */
function isSubmittedStatus_(status) {
  var s = String(status || '').toLowerCase().trim();
  return !!s && s.indexOf('pend') === -1;
}

/**
 * ¿La fila de Picks ya está bloqueada (cerró su ronda)?
 * La automatización pone Locked=TRUE en el corte (1pm). Antes de eso, el
 * pick de la ronda en curso NO debe revelarse como "usado".
 */
function isLocked_(v) {
  if (v === true) return true;
  return String(v || '').trim().toUpperCase() === 'TRUE';
}

/**
 * DataService — lecturas de dominio (Standings, Calendar, Drivers,
 * STATUS_PICKS, Picks, Participants) + cálculo de pilotos disponibles.
 * Usa CacheService para evitar lecturas repetitivas.
 */
var DataService = (function () {

  function cache() { return CacheService.getScriptCache(); }

  function cached(key, ttl, producer) {
    var c = cache();
    var hit = c.get(key);
    if (hit) {
      try { return JSON.parse(hit); } catch (e) { /* cae a recomputar */ }
    }
    var value = producer();
    try { c.put(key, JSON.stringify(value), ttl); } catch (e) { /* payload grande: ignora */ }
    return value;
  }

  // ---------- STANDINGS ----------
  function getStandings() {
    return cached('standings_v1', APP.CACHE_TTL_SECONDS, function () {
      var t = SheetUtils.readTable(TABS.STANDINGS);
      var list = t.rows.map(function (r) {
        return {
          name: String(SheetUtils.pick(r, ['Participante', 'Nombre']) || '').trim(),
          points: num(SheetUtils.pick(r, ['Total', 'Pts', 'Puntos'])),
          place: num(SheetUtils.pick(r, ['Place', 'Lugar', 'Pos']))
        };
      }).filter(function (r) { return r.name; });

      list.sort(function (a, b) {
        if (a.place && b.place) return a.place - b.place;
        return b.points - a.points;
      });
      // Re-numera lugar por si viene vacío.
      list.forEach(function (r, i) { if (!r.place) r.place = i + 1; });
      return list;
    });
  }

  // ---------- CALENDAR ----------
  function getCalendar(currentRound, tzName) {
    return cached('calendar_v1_' + currentRound, APP.CACHE_TTL_SECONDS, function () {
      var t = SheetUtils.readTable(TABS.CALENDAR);
      var today = ConfigService.todayStr(tzName);

      return t.rows.map(function (r) {
        var date = normalizeDate(SheetUtils.pick(r, ['Date', 'Fecha']), tzName);
        var round = num(SheetUtils.pick(r, ['Round', 'Ronda']));
        var state;
        if (date && date < today) state = 'past';
        else if (round === currentRound) state = 'current';
        else state = 'upcoming';

        return {
          round: round,
          name: String(SheetUtils.pick(r, ['RaceName', 'Race', 'Nombre', 'GP']) || '').trim(),
          date: date,
          circuit: String(SheetUtils.pick(r, ['Circuit', 'Circuito']) || '').trim(),
          location: String(SheetUtils.pick(r, ['Location', 'Ciudad']) || '').trim(),
          country: String(SheetUtils.pick(r, ['Country', 'Pais', 'País']) || '').trim(),
          state: state
        };
      }).filter(function (r) { return r.round; });
    });
  }

  // ---------- DRIVERS ----------
  function getDrivers() {
    return cached('drivers_v1', APP.CACHE_TTL_SECONDS, function () {
      var t = SheetUtils.readTable(TABS.DRIVERS);
      return t.rows.map(function (r) {
        return {
          driverId: String(SheetUtils.pick(r, ['DriverId', 'Id']) || '').trim(),
          code: String(SheetUtils.pick(r, ['Code', 'Codigo', 'Código']) || '').trim(),
          name: String(SheetUtils.pick(r, ['Driver', 'Nombre', 'Piloto']) || '').trim(),
          team: String(SheetUtils.pick(r, ['TeamDisplay', 'Team', 'Equipo']) || '').trim()
        };
      }).filter(function (r) { return r.driverId; });
    });
  }

  // ---------- PARTICIPANTS (solo nombres; nunca códigos) ----------
  function getParticipantsNames() {
    return cached('participants_v1', APP.CACHE_TTL_SECONDS, function () {
      var t = SheetUtils.readTable(TABS.PARTICIPANTS);
      return t.rows.map(function (r) {
        var active = SheetUtils.pick(r, ['Active', 'Activo']);
        return {
          name: String(SheetUtils.pick(r, ['Participante', 'Nombre']) || '').trim(),
          active: !(String(active).toUpperCase() === 'FALSE')
        };
      }).filter(function (r) { return r.name && r.active; })
        .map(function (r) { return r.name; })
        .sort();
    });
  }

  // ---------- STATUS DE PICKS (por round) ----------
  function getPickStatus(round) {
    // TTL más corto: cambia con frecuencia.
    return cached('status_v1_' + round, 30, function () {
      var t = SheetUtils.readTable(TABS.STATUS);
      var lastUpdated = '';
      var items = t.rows.filter(function (r) {
        return num(SheetUtils.pick(r, ['Round', 'Ronda'])) === round;
      }).map(function (r) {
        var titular = String(SheetUtils.pick(r, ['Titular']) || '').trim();
        var suplente = String(SheetUtils.pick(r, ['Suplente']) || '').trim();
        var lu = String(SheetUtils.pick(r, ['LastUpdate', 'Actualiza']) || '').trim();
        if (lu && lu > lastUpdated) lastUpdated = lu;
        var status = String(SheetUtils.pick(r, ['Status', 'Estatus', 'Estado']) || '').trim();
        return {
          name: String(SheetUtils.pick(r, ['Participante', 'Nombre']) || '').trim(),
          status: status || 'Pendiente',
          lastUpdate: lu,
          // El piloto solo se revela si la hoja ya lo expuso (tras deadline).
          revealed: !!(titular || suplente),
          titular: titular,
          suplente: suplente
        };
      }).filter(function (r) { return r.name; });

      // Cuenta como "pick hecho" cualquier estado que NO sea Pendiente (ni vacío).
      // La automatización de la hoja usa "Aceptado"; también soporta OK/Autopick/Duplicado.
      var submitted = items.filter(function (i) {
        return isSubmittedStatus_(i.status);
      }).length;

      return {
        round: round,
        items: items,
        total: items.length,
        submitted: submitted,
        pending: Math.max(0, items.length - submitted),
        lastUpdated: lastUpdated
      };
    });
  }

  // ---------- PILOTOS DISPONIBLES (titular) por participante ----------
  function getAvailableDrivers(participantName) {
    var name = String(participantName || '').trim();
    if (!name) throw new Error('Falta el nombre del participante.');

    var drivers = getDrivers();
    var t = SheetUtils.readTable(TABS.PICKS);

    // driverId -> [rounds] usados como TITULAR por este participante.
    var usedRounds = {};
    t.rows.forEach(function (r) {
      var p = String(SheetUtils.pick(r, ['Participante', 'Nombre']) || '').trim();
      if (p !== name) return;
      // Solo cuenta como "usado" si la ronda ya cerró (Locked=TRUE). Así el pick
      // de la ronda en curso no se revela hasta el corte de la 1pm; antes de eso
      // ese piloto sigue apareciendo disponible.
      if (!isLocked_(SheetUtils.pick(r, ['Locked']))) return;
      var did = String(SheetUtils.pick(r, ['TitularDriverId']) || '').trim();
      var rnd = num(SheetUtils.pick(r, ['Round', 'Ronda']));
      if (!did) return;
      if (!usedRounds[did]) usedRounds[did] = [];
      if (usedRounds[did].indexOf(rnd) === -1) usedRounds[did].push(rnd);
    });

    var available = [];
    var used = [];
    drivers.forEach(function (d) {
      var rounds = usedRounds[d.driverId];
      if (rounds && rounds.length) {
        rounds.sort(function (a, b) { return a - b; });
        used.push({ driverId: d.driverId, code: d.code, name: d.name, team: d.team, rounds: rounds });
      } else {
        available.push({ driverId: d.driverId, code: d.code, name: d.name, team: d.team });
      }
    });

    return { participant: name, available: available, used: used };
  }

  // Resuelve (y cachea) el nombre de una pestaña por firma de columnas.
  function sheetName(key, required) {
    return cached('sheetname_' + key, 600, function () {
      return SheetUtils.findSheetName(required) || '';
    });
  }

  // ---------- RONDAS CON RESULTADOS (para habilitar el detalle en Calendario) ----------
  function getResultRounds() {
    return cached('resultrounds_v1', APP.CACHE_TTL_SECONDS, function () {
      var name = sheetName('results', ['Round', 'Driver', 'Position', 'Points']);
      if (!name) return [];
      var t = SheetUtils.readTable(name);
      var set = {};
      t.rows.forEach(function (r) {
        var rnd = num(SheetUtils.pick(r, ['Round', 'Ronda']));
        var pos = num(SheetUtils.pick(r, ['Position', 'Pos']));
        if (rnd && pos) set[rnd] = true;
      });
      return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
    });
  }

  // ---------- DETALLE DE UN GP (resultado oficial + pole/DoD + puntos participantes) ----------
  function getGpDetail(round) {
    round = num(round);
    return cached('gpdetail_v1_' + round, 300, function () {
      var drivers = getDrivers();
      var byName = {}, byCode = {};
      drivers.forEach(function (d) {
        if (d.name) byName[d.name.toUpperCase()] = d;
        if (d.code) byCode[d.code.toUpperCase()] = d;
      });

      // 1) Resultado oficial 1–22
      var resName = sheetName('results', ['Round', 'Driver', 'Position', 'Points']);
      var results = [];
      if (resName) {
        SheetUtils.readTable(resName).rows.forEach(function (r) {
          if (num(SheetUtils.pick(r, ['Round', 'Ronda'])) !== round) return;
          var dname = String(SheetUtils.pick(r, ['Driver', 'Piloto']) || '').trim();
          var d = byName[dname.toUpperCase()];
          results.push({
            pos: num(SheetUtils.pick(r, ['Position', 'Pos'])),
            driver: dname,
            code: d ? d.code : '',
            team: d ? d.team : '',
            points: num(SheetUtils.pick(r, ['Points', 'Puntos'])),
            status: String(SheetUtils.pick(r, ['Status', 'Estado']) || '').trim()
          });
        });
        results.sort(function (a, b) { return a.pos - b.pos; });
      }

      // 2) Pole / Driver of the Day
      var pdName = sheetName('poledotd', ['PoleDriver']);
      var pole = '', dotd = '';
      if (pdName) {
        SheetUtils.readTable(pdName).rows.forEach(function (r) {
          if (num(SheetUtils.pick(r, ['Round', 'Ronda'])) !== round) return;
          pole = String(SheetUtils.pick(r, ['PoleDriver', 'Pole']) || '').trim();
          dotd = String(SheetUtils.pick(r, ['DOTDDriver', 'DOTD', 'DayDriver']) || '').trim();
        });
      }

      // 3) Puntos por participante (titular usado)
      var scName = sheetName('scoring', ['UsedDriver', 'FinalPoints']);
      var participants = [];
      if (scName) {
        SheetUtils.readTable(scName).rows.forEach(function (r) {
          if (num(SheetUtils.pick(r, ['Round', 'Ronda'])) !== round) return;
          var code = String(SheetUtils.pick(r, ['UsedDriver']) || '').trim();
          var d = byCode[code.toUpperCase()];
          participants.push({
            name: String(SheetUtils.pick(r, ['Participante', 'Nombre']) || '').trim(),
            code: code,
            team: d ? d.team : '',
            points: num(SheetUtils.pick(r, ['FinalPoints', 'Puntos', 'Points'])),
            source: String(SheetUtils.pick(r, ['Source']) || '').trim()
          });
        });
        participants.sort(function (a, b) { return b.points - a.points; });
      }

      return { round: round, results: results, pole: pole, dotd: dotd, participants: participants };
    });
  }

  // ---------- helpers ----------
  function num(v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  function normalizeDate(v, tzName) {
    if (!v && v !== 0) return '';
    if (Object.prototype.toString.call(v) === '[object Date]') {
      return Utilities.formatDate(v, tzName || 'America/Mexico_City', 'yyyy-MM-dd');
    }
    return String(v).slice(0, 10);
  }

  return {
    getStandings: getStandings,
    getCalendar: getCalendar,
    getDrivers: getDrivers,
    getParticipantsNames: getParticipantsNames,
    getPickStatus: getPickStatus,
    getAvailableDrivers: getAvailableDrivers,
    getResultRounds: getResultRounds,
    getGpDetail: getGpDetail
  };
})();
