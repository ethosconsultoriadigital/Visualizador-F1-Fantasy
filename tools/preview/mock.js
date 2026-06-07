// Datos mock basados en la auditoría real de la hoja (Round 8 / Mónaco).
window.__MOCK__ = {
  initial: {
    ok: true,
    generatedAt: new Date().toISOString(),
    config: { season: 2026, currentRound: 8, totalRounds: 24, tz: 'America/Mexico_City' },
    dashboard: {
      currentRound: 8,
      nextRace: { round: 8, name: 'Monaco Grand Prix', date: '2026-06-07', circuit: 'Circuit de Monaco', location: 'Monte Carlo', country: 'Monaco', state: 'current' },
      deadlineISO: new Date(Date.now() + (2 * 86400 + 4 * 3600 + 37 * 60) * 1000).toISOString(),
      standingsTop3: [
        { place: 1, name: 'OSCAR KELLY', points: 98 },
        { place: 2, name: 'ROBERTO STIVALET', points: 57 },
        { place: 3, name: 'ALEJANDRO GONZALEZ', points: 55 }
      ],
      leader: { place: 1, name: 'OSCAR KELLY', points: 98 },
      totalParticipants: 15, picksSubmitted: 15, picksPending: 0, lastUpdated: '06/03/2026 11:38'
    },
    standings: [
      { place: 1, name: 'OSCAR KELLY', points: 98 },
      { place: 2, name: 'ROBERTO STIVALET', points: 57 },
      { place: 3, name: 'ALEJANDRO GONZALEZ', points: 55 },
      { place: 4, name: 'GORDO ZAMUDIO', points: 54 },
      { place: 5, name: 'LEO TIRADO', points: 54 },
      { place: 6, name: 'CHINO KURODA', points: 45 },
      { place: 7, name: 'FERNANDO ALFREDO', points: 44 },
      { place: 8, name: 'JUAN JOSE CORREA', points: 43 },
      { place: 9, name: 'JORGE RICO', points: 36 },
      { place: 10, name: 'JORGE HERRERA', points: 29 },
      { place: 11, name: 'JORGE LIZARRAGA', points: 23 },
      { place: 12, name: 'KIKI MAGANA', points: 23 },
      { place: 13, name: 'FER CARRILLO', points: 20 },
      { place: 14, name: 'JAVIER LIZARRAGA', points: 20 },
      { place: 15, name: 'JAVIER NARES', points: 8 }
    ],
    calendar: [
      { round: 1, name: 'Australian Grand Prix', date: '2026-03-08', circuit: 'Albert Park', location: 'Melbourne', country: 'Australia', state: 'past' },
      { round: 2, name: 'Chinese Grand Prix', date: '2026-03-15', circuit: 'Shanghai', location: 'Shanghai', country: 'China', state: 'past' },
      { round: 3, name: 'Japanese Grand Prix', date: '2026-03-29', circuit: 'Suzuka', location: 'Suzuka', country: 'Japan', state: 'past' },
      { round: 4, name: 'Bahrain Grand Prix', date: '2026-04-12', circuit: 'Bahrain Intl', location: 'Sakhir', country: 'Bahrain', state: 'past' },
      { round: 5, name: 'Saudi Arabian Grand Prix', date: '2026-04-19', circuit: 'Jeddah Corniche', location: 'Jeddah', country: 'Saudi Arabia', state: 'past' },
      { round: 6, name: 'Miami Grand Prix', date: '2026-05-03', circuit: 'Miami Autodrome', location: 'Miami', country: 'USA', state: 'past' },
      { round: 7, name: 'Canadian Grand Prix', date: '2026-05-24', circuit: 'Gilles Villeneuve', location: 'Montreal', country: 'Canada', state: 'past' },
      { round: 8, name: 'Monaco Grand Prix', date: '2026-06-07', circuit: 'Circuit de Monaco', location: 'Monte Carlo', country: 'Monaco', state: 'current' },
      { round: 9, name: 'Barcelona Grand Prix', date: '2026-06-14', circuit: 'Barcelona-Catalunya', location: 'Barcelona', country: 'Spain', state: 'upcoming' },
      { round: 10, name: 'Austrian Grand Prix', date: '2026-06-28', circuit: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', state: 'upcoming' },
      { round: 11, name: 'British Grand Prix', date: '2026-07-05', circuit: 'Silverstone', location: 'Silverstone', country: 'UK', state: 'upcoming' }
    ],
    drivers: [
      { driverId: 'albon', code: 'ALBON', name: 'Alexander Albon', team: 'WILLIAMS' },
      { driverId: 'alonso', code: 'ALO', name: 'Fernando Alonso', team: 'A. MARTIN' },
      { driverId: 'bearman', code: 'BEAR', name: 'Oliver Bearman', team: 'HAAS' },
      { driverId: 'bortoleto', code: 'BORTO', name: 'Gabriel Bortoleto', team: 'AUDI' },
      { driverId: 'bottas', code: 'BOT', name: 'Valtteri Bottas', team: 'CADILLAC' },
      { driverId: 'colapinto', code: 'COLA', name: 'Franco Colapinto', team: 'ALPINE' },
      { driverId: 'gasly', code: 'GASLY', name: 'Pierre Gasly', team: 'ALPINE' },
      { driverId: 'hadjar', code: 'HADJAR', name: 'Isack Hadjar', team: 'RED BULL' },
      { driverId: 'hulkenberg', code: 'HULK', name: 'Nico Hulkenberg', team: 'AUDI' },
      { driverId: 'lawson', code: 'LAW', name: 'Liam Lawson', team: 'RACING BULLS' },
      { driverId: 'lindblad', code: 'ARVID', name: 'Arvid Lindblad', team: 'RACING BULLS' },
      { driverId: 'ocon', code: 'OCON', name: 'Esteban Ocon', team: 'HAAS' },
      { driverId: 'perez', code: 'PER', name: 'Sergio Perez', team: 'CADILLAC' },
      { driverId: 'sainz', code: 'SAINZ', name: 'Carlos Sainz', team: 'WILLIAMS' },
      { driverId: 'stroll', code: 'STROLL', name: 'Lance Stroll', team: 'A. MARTIN' },
      { driverId: 'max_verstappen', code: 'MAX', name: 'Max Verstappen', team: 'RED BULL' }
    ],
    participants: ['ALEJANDRO GONZALEZ', 'CHINO KURODA', 'FER CARRILLO', 'OSCAR KELLY', 'ROBERTO STIVALET'],
    pickStatus: {
      round: 8, total: 15, submitted: 15, pending: 0, lastUpdated: '06/03/2026 11:38',
      items: [
        { name: 'OSCAR KELLY', status: 'OK', revealed: false, titular: '', suplente: '' },
        { name: 'ROBERTO STIVALET', status: 'OK', revealed: false, titular: '', suplente: '' },
        { name: 'JAVIER LIZARRAGA', status: 'Autopick', revealed: false, titular: '', suplente: '' },
        { name: 'JORGE HERRERA', status: 'OK', revealed: false, titular: '', suplente: '' },
        { name: 'FERNANDO ALFREDO', status: 'Autopick', revealed: false, titular: '', suplente: '' },
        { name: 'GORDO ZAMUDIO', status: 'OK', revealed: false, titular: '', suplente: '' },
        { name: 'CHINO KURODA', status: 'OK', revealed: false, titular: '', suplente: '' },
        { name: 'JAVIER NARES', status: 'Pendiente', revealed: false, titular: '', suplente: '' }
      ]
    },
    form: { baseUrl: 'https://docs.google.com/forms/d/e/FORM/viewform', participantEntry: 'entry.1246221868' }
  },
  available: {
    ok: true,
    data: {
      participant: 'OSCAR KELLY',
      available: [
        { driverId: 'albon', code: 'ALBON', name: 'Alexander Albon', team: 'WILLIAMS' },
        { driverId: 'alonso', code: 'ALO', name: 'Fernando Alonso', team: 'A. MARTIN' },
        { driverId: 'bearman', code: 'BEAR', name: 'Oliver Bearman', team: 'HAAS' },
        { driverId: 'bortoleto', code: 'BORTO', name: 'Gabriel Bortoleto', team: 'AUDI' },
        { driverId: 'bottas', code: 'BOT', name: 'Valtteri Bottas', team: 'CADILLAC' },
        { driverId: 'colapinto', code: 'COLA', name: 'Franco Colapinto', team: 'ALPINE' },
        { driverId: 'gasly', code: 'GASLY', name: 'Pierre Gasly', team: 'ALPINE' },
        { driverId: 'hadjar', code: 'HADJAR', name: 'Isack Hadjar', team: 'RED BULL' },
        { driverId: 'hulkenberg', code: 'HULK', name: 'Nico Hulkenberg', team: 'AUDI' },
        { driverId: 'lawson', code: 'LAW', name: 'Liam Lawson', team: 'RACING BULLS' },
        { driverId: 'lindblad', code: 'ARVID', name: 'Arvid Lindblad', team: 'RACING BULLS' },
        { driverId: 'ocon', code: 'OCON', name: 'Esteban Ocon', team: 'HAAS' },
        { driverId: 'perez', code: 'PER', name: 'Sergio Perez', team: 'CADILLAC' },
        { driverId: 'sainz', code: 'SAINZ', name: 'Carlos Sainz', team: 'WILLIAMS' },
        { driverId: 'stroll', code: 'STROLL', name: 'Lance Stroll', team: 'A. MARTIN' }
      ],
      used: [
        { driverId: 'russell', code: 'RUSSEL', name: 'George Russell', team: 'MERCEDES', rounds: [1] },
        { driverId: 'antonelli', code: 'KIMI', name: 'Andrea Kimi Antonelli', team: 'MERCEDES', rounds: [2] },
        { driverId: 'norris', code: 'NORRIS', name: 'Lando Norris', team: 'MCLAREN', rounds: [3] },
        { driverId: 'piastri', code: 'PIAS', name: 'Oscar Piastri', team: 'MCLAREN', rounds: [6] },
        { driverId: 'hamilton', code: 'HAM', name: 'Lewis Hamilton', team: 'FERRARI', rounds: [7] },
        { driverId: 'leclerc', code: 'LEC', name: 'Charles Leclerc', team: 'FERRARI', rounds: [8] }
      ]
    }
  }
};

// Mock de google.script.run (chainable) que sirve los datos anteriores.
window.google = {
  script: {
    run: (function () {
      function make() {
        var succ = function () {};
        var api = {
          withSuccessHandler: function (f) { succ = f; return api; },
          withFailureHandler: function () { return api; },
          getInitialAppData: function () { setTimeout(function () { succ(window.__MOCK__.initial); }, 350); },
          getAvailableDrivers: function () { setTimeout(function () { succ(window.__MOCK__.available); }, 300); }
        };
        return api;
      }
      return make();
    })()
  }
};
