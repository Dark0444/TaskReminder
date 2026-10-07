import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  endOfDay,
  isSameDay,
  addDays,
  startOfMonth,
  getDaysInMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

export { startOfDay, endOfDay, isSameDay, addDays, startOfMonth, getDaysInMonth, isToday };

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function dayLabel(d) {
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  if (isYesterday(d)) return 'Ayer';
  return cap(format(d, 'EEE d MMM', { locale: es }));
}

export function formatDue(iso) {
  if (!iso) return 'Sin fecha';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Sin fecha';
  return `${dayLabel(d)} · ${format(d, 'HH:mm')}`;
}

export function formatLongDate(d) {
  return cap(format(d, "EEEE d 'de' MMMM", { locale: es }));
}

export function monthTitle(d) {
  return cap(format(d, 'MMMM yyyy', { locale: es }));
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function formatClock(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
