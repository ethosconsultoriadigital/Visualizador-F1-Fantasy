/**
 * ConfigService — lectura de la pestaña Config (clave/valor) y utilidades
 * de round / deadline. Solo lectura.
 */
var ConfigService = (function () {

  /**
   * Lee Config como mapa clave->valor y devuelve los campos parseados.
   */
  function get() {
    var sheet = SheetUtils.getSheet(TABS.CONFIG);
    var values = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues();
    var map = {};
    values.forEach(function (row) {
      var key = String(row[0] || '').trim();
      if (key) map[key] = row[1];
    });

    return {
      raw: map,
      season: toInt(map.SEASON, new Date().getFullYear()),
      currentRound: toInt(map.LOCK_ROUND, 1),
      totalRounds: toInt(map.TOTAL_ROUNDS, 24),
      noRepeatUntilRound: toInt(map.NO_REPEAT_UNTIL_ROUND, 24),
      deadlineDay: toInt(map.DEADLINE_DAY, 4),   // 0=Dom ... 4=Jue (convención JS getDay)
      deadlineHour: toInt(map.DEADLINE_HOUR, 13),
      tzName: String(map.TZ || 'America/Mexico_City').trim()
    };
  }

  /**
   * Determina la "próxima carrera" a mostrar:
   *  1) la del round actual (LOCK_ROUND) si existe;
   *  2) si no, la primera del calendario con fecha >= hoy.
   */
  function resolveNextRace(calendar, currentRound, tzName) {
    if (!calendar || !calendar.length) return null;

    var byRound = calendar.filter(function (r) { return r.round === currentRound; });
    if (byRound.length) return byRound[0];

    var today = todayStr(tzName);
    var upcoming = calendar.filter(function (r) { return r.date >= today; });
    if (upcoming.length) return upcoming[0];

    return calendar[calendar.length - 1];
  }

  /**
   * Calcula el deadline (jueves 13:00 CDMX, por defecto) de una carrera.
   * Devuelve ISO con offset fijo (CDMX no usa DST).
   */
  function computeDeadlineISO(raceDateStr, deadlineDay, deadlineHour) {
    if (!raceDateStr) return null;
    var parts = String(raceDateStr).slice(0, 10).split('-');
    if (parts.length < 3) return null;

    // Mediodía UTC para evitar corrimientos por zona al obtener el día de la semana.
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 12, 0, 0));
    var dow = d.getUTCDay();
    var back = (dow - deadlineDay + 7) % 7; // días hacia atrás hasta el día objetivo
    d.setUTCDate(d.getUTCDate() - back);

    var y = d.getUTCFullYear();
    var m = pad(d.getUTCMonth() + 1);
    var day = pad(d.getUTCDate());
    var hh = pad(deadlineHour);
    return y + '-' + m + '-' + day + 'T' + hh + ':00:00' + APP.TZ_OFFSET;
  }

  // ---- helpers ----
  function toInt(v, def) {
    var n = parseInt(v, 10);
    return isNaN(n) ? def : n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr(tzName) {
    return Utilities.formatDate(new Date(), tzName || 'America/Mexico_City', 'yyyy-MM-dd');
  }

  return {
    get: get,
    resolveNextRace: resolveNextRace,
    computeDeadlineISO: computeDeadlineISO,
    todayStr: todayStr
  };
})();
