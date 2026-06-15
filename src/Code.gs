/**
 * F1 FANTASY 2026 — Web App (HTML Service)
 * ------------------------------------------------------------------
 * Visualizador premium mobile-first del fantasy privado de F1.
 *
 * IMPORTANTE / ALCANCE:
 *  - Esta app es SOLO LECTURA sobre la hoja "COMISIONADO F1 FANTASY AI 2026".
 *  - NO escribe en ninguna pestaña (ni TABLA_F1_FANTASY, ni Picks, ni GlidePicks).
 *  - Los picks se realizan a través del Google Form existente (deep-link
 *    pre-rellenado con el nombre del participante).
 *  - La rotación de "round actual" la controla el dueño en la pestaña Config.
 *
 * Archivos:
 *  - Code.gs            -> doGet(), include(), getInitialAppData(), getAvailableDrivers()
 *  - ConfigService.gs   -> lectura de Config + cálculo de deadline
 *  - DataService.gs     -> lectura de Standings, Calendar, Drivers, STATUS_PICKS, Picks, Participants
 *  - FormService.gs     -> construcción del deep-link al Google Form
 *  - index.html / styles.html / app.html -> frontend
 */

// ===== CONSTANTES GLOBALES =====
var APP = {
  TITLE: 'F1 Fantasy 2026',
  // ID de la hoja "COMISIONADO F1 FANTASY AI 2026".
  // Déjalo así para usar un SCRIPT INDEPENDIENTE (standalone) en la cuenta dueña,
  // sin tocar el script de automatización existente.
  // Si algún día usas un script VINCULADO a la hoja, ponlo en '' para usar getActiveSpreadsheet().
  SPREADSHEET_ID: '1r_TtlZMSQ-m9dZ6aL-8VBS3y0uc9KykIigzqO8GWMvk',
  // Form de picks (proporcionado por el dueño). entry del campo "Participante".
  FORM_BASE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSceZpmVUJpVCszvmB8uPXxuQzIGUslRYYpxeFBDKkHigfr3Uw/viewform',
  FORM_PARTICIPANT_ENTRY: 'entry.1246221868',
  // Offset fijo de zona horaria (CDMX no usa horario de verano desde 2022).
  TZ_OFFSET: '-06:00',
  CACHE_TTL_SECONDS: 90,
  // Clave simple para proteger el endpoint JSON (úsala en Make: &key=...).
  // Cámbiala por la que quieras.
  API_KEY: 'mzt2026'
};

// Nombres de pestañas tal como existen en la hoja.
var TABS = {
  CONFIG: 'Config',
  STANDINGS: 'Standings',
  CALENDAR: 'Calendar',
  DRIVERS: 'Drivers',
  STATUS: 'STATUS_PICKS',
  PICKS: 'Picks',
  PARTICIPANTS: 'Participants'
};

/**
 * Punto de entrada de la Web App.
 */
function doGet(e) {
  e = e || {};
  var params = e.parameter || {};
  // Endpoint JSON para integraciones (Make/WhatsApp): /exec?api=reminders&key=...
  if (params.api) return handleApi_(params);

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP.TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * API JSON de solo lectura para Make (recordatorios por WhatsApp).
 *   /exec?api=reminders&key=<API_KEY>
 * Devuelve la ronda actual, deadline y la lista de participantes que faltan.
 */
function handleApi_(params) {
  if (APP.API_KEY && params.key !== APP.API_KEY) {
    return jsonOut_({ ok: false, error: 'unauthorized' });
  }
  try {
    if (params.api === 'reminders' || params.api === 'pendientes') {
      var config = ConfigService.get();
      var round = config.currentRound;
      var calendar = DataService.getCalendar(round, config.tzName);
      var nextRace = ConfigService.resolveNextRace(calendar, round, config.tzName);
      var deadlineISO = nextRace
        ? ConfigService.computeDeadlineISO(nextRace.date, config.deadlineDay, config.deadlineHour) : null;

      var status = DataService.getPickStatus(round);
      var submitted = {};
      status.items.forEach(function (i) {
        if (isSubmittedStatus_(i.status)) submitted[i.name] = true;
      });
      var pending = DataService.getParticipantsNames().filter(function (n) { return !submitted[n]; });

      return jsonOut_({
        ok: true,
        round: round,
        race: nextRace ? nextRace.name : '',
        deadlineISO: deadlineISO,
        total: status.total,
        submitted: status.submitted,
        pendingCount: pending.length,
        pending: pending
      });
    }
    return jsonOut_({ ok: false, error: 'unknown api' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Permite incluir archivos HTML (styles/app) dentro de index.html.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Carga inicial: devuelve todo lo necesario para pintar la app en un solo viaje.
 * Estructura defensiva: si algo falla, devuelve { ok:false, error }.
 */
function getInitialAppData() {
  try {
    var config = ConfigService.get();
    var currentRound = config.currentRound;

    var standings = DataService.getStandings();
    var calendar = DataService.getCalendar(currentRound, config.tzName);
    var drivers = DataService.getDrivers();
    var participants = DataService.getParticipantsNames();
    var pickStatus = DataService.getPickStatus(currentRound);
    var nextRace = ConfigService.resolveNextRace(calendar, currentRound, config.tzName);
    var deadlineISO = nextRace
      ? ConfigService.computeDeadlineISO(nextRace.date, config.deadlineDay, config.deadlineHour)
      : null;

    var top3 = standings.slice(0, 3);

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      config: {
        season: config.season,
        currentRound: currentRound,
        totalRounds: config.totalRounds,
        tz: config.tzName
      },
      dashboard: {
        currentRound: currentRound,
        nextRace: nextRace,
        deadlineISO: deadlineISO,
        standingsTop3: top3,
        leader: top3.length ? top3[0] : null,
        totalParticipants: pickStatus.total,
        picksSubmitted: pickStatus.submitted,
        picksPending: pickStatus.pending,
        lastUpdated: pickStatus.lastUpdated
      },
      standings: standings,
      calendar: calendar,
      drivers: drivers,
      participants: participants,
      pickStatus: pickStatus,
      resultRounds: DataService.getResultRounds(),
      form: {
        baseUrl: APP.FORM_BASE_URL,
        participantEntry: APP.FORM_PARTICIPANT_ENTRY
      }
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

/**
 * Pilotos disponibles / usados (como TITULAR) para un participante.
 * Soft-warning: no bloquea, solo informa qué pilotos ya usó de titular.
 */
function getAvailableDrivers(participantName) {
  try {
    return { ok: true, data: DataService.getAvailableDrivers(participantName) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

/**
 * Detalle de un GP (al tocar una fecha en Calendario): resultado oficial 1–22,
 * pole, Driver of the Day y los puntos de cada participante en esa ronda.
 */
function getGpDetail(round) {
  try {
    return { ok: true, data: DataService.getGpDetail(round) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}
