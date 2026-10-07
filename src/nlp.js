// Interpreta frases en español como "llamar al banco mañana a las 3pm".
// Funciones puras, sin dependencias, para poder probarlas con facilidad.

const MONTHS = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6,
  agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};
const WEEKDAYS = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};
const PERIOD_DEFAULT_HOUR = { manana: 9, tarde: 15, noche: 20, madrugada: 6 };
const WD = 'lunes|martes|miercoles|jueves|viernes|sabado|domingo';
const MON = Object.keys(MONTHS).join('|');
const AMPM = 'a\\.?m\\.?|p\\.?m\\.?';

function strip(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d, n) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
  return r;
}
function at(day, h, mi) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, mi, 0, 0);
}
function normAmpm(s) {
  if (!s) return null;
  return s.replace(/\./g, '').toLowerCase();
}
function isAmbiguous(h, ampm, period) {
  return !ampm && !period && h >= 7 && h <= 11;
}
function resolveHour(h, ampm, period) {
  if (ampm === 'pm' && h < 12) return h + 12;
  if (ampm === 'am' && h === 12) return 0;
  if (ampm) return h;
  if (period === 'tarde' || period === 'noche') {
    if (h === 12) return period === 'noche' ? 0 : 12;
    return h < 12 ? h + 12 : h;
  }
  if (period === 'manana' || period === 'madrugada') return h === 12 ? 0 : h;
  // Sin pista: de 1 a 6 se asume tarde, de 7 a 11 mañana.
  if (h >= 1 && h <= 6) return h + 12;
  return h;
}

export function parseQuickInput(input, now = new Date()) {
  let orig = String(input || '');
  let m = strip(orig);
  if (m.length !== orig.length) orig = m; // texto raro: pierde acentos pero no se desalinea
  const mask = new Array(orig.length).fill(false);

  const take = (re) => {
    const r = re.exec(m);
    if (!r) return null;
    for (let i = r.index; i < r.index + r[0].length; i++) mask[i] = true;
    m = m.slice(0, r.index) + ' '.repeat(r[0].length) + m.slice(r.index + r[0].length);
    return r;
  };

  // ---- prioridad
  let priority = null;
  if (take(/\b(urgente|urgentisimo|muy importante|prioridad alta|importante)\b/) || take(/(?:^|\s)(?:!alta|!{2,})(?=\s|$)/)) {
    priority = 'high';
  } else if (take(/\b(prioridad baja|sin prisa)\b/) || take(/(?:^|\s)!baja(?=\s|$)/)) {
    priority = 'low';
  } else if (take(/\bprioridad media\b/) || take(/(?:^|\s)!media(?=\s|$)/)) {
    priority = 'med';
  }

  // ---- repeticion
  let repeat = 'none';
  let repWeekday = null;
  let r;
  if ((r = take(new RegExp('\\bcada\\s+(' + WD + ')\\b')))) {
    repeat = 'weekly';
    repWeekday = WEEKDAYS[r[1]];
  } else if (take(/\b(todos\s+los\s+dias|cada\s+dia|diariamente|diario|diaria)\b/)) {
    repeat = 'daily';
  } else if (take(/\b(todas\s+las\s+semanas|cada\s+semana|semanalmente|semanal)\b/)) {
    repeat = 'weekly';
  } else if (take(/\b(todos\s+los\s+meses|cada\s+mes|mensualmente|mensual)\b/)) {
    repeat = 'monthly';
  }

  const today = startOfDay(now);

  // ---- relativo: "en 2 horas", "en media hora"
  let relDue = null;
  let date = null;
  let weekdayMatch = false;
  let dayOfMonthMatch = false;
  if (take(/\ben\s+media\s+hora\b/)) {
    relDue = new Date(now.getTime() + 30 * 60000);
  } else if ((r = take(/\ben\s+(\d+|una|un)\s*(minutos?|mins?|horas?|hrs?|h|dias?|semanas?|meses?)\b/))) {
    const n = r[1] === 'una' || r[1] === 'un' ? 1 : parseInt(r[1], 10);
    const u = r[2];
    if (u.startsWith('min')) relDue = new Date(now.getTime() + n * 60000);
    else if (u.startsWith('h')) relDue = new Date(now.getTime() + n * 3600000);
    else if (u.startsWith('d')) date = addDays(today, n);
    else if (u.startsWith('s')) date = addDays(today, n * 7);
    else date = new Date(today.getFullYear(), today.getMonth() + n, today.getDate());
  }

  // ---- franja del dia ("por la tarde", "esta noche")
  let period = null;
  if ((r = take(/\b(?:por|en|de)\s+la\s+(manana|tarde|noche|madrugada)\b/))) {
    period = r[1];
  } else if ((r = take(/\besta\s+(manana|tarde|noche)\b/))) {
    period = r[1];
    date = today;
  }

  // ---- hora
  let time = null;
  if ((r = take(new RegExp('\\ba\\s+las?\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(' + AMPM + ')?(?![\\d:])')))) {
    time = { h: resolveHour(parseInt(r[1], 10), normAmpm(r[3]), period), mi: r[2] ? parseInt(r[2], 10) : 0, amb: isAmbiguous(parseInt(r[1], 10), normAmpm(r[3]), period) };
  } else if ((r = take(new RegExp('\\b(\\d{1,2}):(\\d{2})\\s*(' + AMPM + ')?')))) {
    time = { h: resolveHour(parseInt(r[1], 10), normAmpm(r[3]), period), mi: parseInt(r[2], 10), amb: false };
  } else if ((r = take(new RegExp('\\b(\\d{1,2})\\s*(' + AMPM + ')(?![a-z])')))) {
    time = { h: resolveHour(parseInt(r[1], 10), normAmpm(r[2]), period), mi: 0 };
  } else if (take(/\b(?:al\s+)?mediodia\b/)) {
    time = { h: 12, mi: 0 };
  } else if (take(/\b(?:a\s+)?medianoche\b/)) {
    time = { h: 0, mi: 0 };
  }
  if (time && (time.h > 23 || time.mi > 59)) time = null;

  // ---- fecha
  if (!relDue && !date) {
    if (take(/\bpasado\s+manana\b/)) date = addDays(today, 2);
    else if (take(/\bmanana\b/)) date = addDays(today, 1);
    else if (take(/\bhoy\b/)) date = today;
    else if ((r = take(new RegExp('\\b(?:el\\s+)?(?:proximo\\s+|este\\s+)?(' + WD + ')\\b')))) {
      const wd = WEEKDAYS[r[1]];
      date = addDays(today, (wd - today.getDay() + 7) % 7);
      weekdayMatch = true;
    } else if ((r = take(new RegExp('\\b(\\d{1,2})\\s+de\\s+(' + MON + ')(?:\\s+(?:de\\s+)?(\\d{4}))?\\b')))) {
      const y = r[3] ? parseInt(r[3], 10) : today.getFullYear();
      date = new Date(y, MONTHS[r[2]], parseInt(r[1], 10));
      if (!r[3] && date < today) date = new Date(y + 1, MONTHS[r[2]], parseInt(r[1], 10));
    } else if ((r = take(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/))) {
      let y = today.getFullYear();
      if (r[3]) y = r[3].length === 2 ? 2000 + parseInt(r[3], 10) : parseInt(r[3], 10);
      date = new Date(y, parseInt(r[2], 10) - 1, parseInt(r[1], 10));
      if (!r[3] && date < today) date = new Date(y + 1, parseInt(r[2], 10) - 1, parseInt(r[1], 10));
    } else if ((r = take(/\bel\s+(\d{1,2})\b/))) {
      date = new Date(today.getFullYear(), today.getMonth(), parseInt(r[1], 10));
      dayOfMonthMatch = true;
    }
  }
  if (!date && !relDue && repWeekday !== null) {
    date = addDays(today, (repWeekday - today.getDay() + 7) % 7);
    weekdayMatch = true;
  }

  // ---- fecha final
  const defaultTime = time || { h: period ? PERIOD_DEFAULT_HOUR[period] : 9, mi: 0 };
  // Hora ambigua ("a las 7"): si la de la mañana ya pasó hoy, toma la de la noche.
  const fix = (d) => {
    if (!(time && time.amb) || d > now) return d;
    const alt = new Date(d.getTime() + 12 * 3600000);
    return alt.getDate() === d.getDate() && alt > now ? alt : d;
  };
  let due = null;
  if (relDue) {
    due = relDue;
  } else if (date) {
    due = fix(at(date, defaultTime.h, defaultTime.mi));
    if (weekdayMatch && due <= now) due = addDays(due, 7);
    if (dayOfMonthMatch && due <= now) {
      due = new Date(due.getFullYear(), due.getMonth() + 1, due.getDate(), due.getHours(), due.getMinutes());
    }
  } else if (time || period || repeat !== 'none') {
    due = fix(at(today, defaultTime.h, defaultTime.mi));
    if (due <= now) due = addDays(due, 1);
  }

  // ---- titulo
  let title = '';
  for (let i = 0; i < orig.length; i++) if (!mask[i]) title += orig[i];
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^(?:recu[eé]rdame|recordarme|acu[eé]rdame|recordatorio)(?:\s+(?:de|que|para))?\s+/i, '');
  for (let k = 0; k < 4; k++) {
    title = title
      .replace(/^(?:el|la|a|de|para|que|en|por|y|al)\s+/i, '')
      .replace(/\s+(?:el|la|a|de|para|que|en|por|y|al)$/i, '')
      .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '');
  }
  if (title) title = title.charAt(0).toUpperCase() + title.slice(1);

  return { title, due, repeat, priority, hasDate: !!due };
}

export function nextOccurrence(dueIso, repeat, now = new Date()) {
  const d = new Date(dueIso);
  if (repeat === 'none' || Number.isNaN(d.getTime())) return null;
  let n = d;
  for (let i = 0; i < 800; i++) {
    if (repeat === 'daily') n = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, n.getHours(), n.getMinutes());
    else if (repeat === 'weekly') n = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 7, n.getHours(), n.getMinutes());
    else n = new Date(n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes());
    if (n > now) break;
  }
  return n;
}
