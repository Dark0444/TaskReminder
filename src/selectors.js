import { startOfDay, endOfDay, isSameDay, isToday, dayLabel } from './dates';

const prioRank = { high: 0, med: 1, low: 2 };

function byDue(a, b) {
  const da = a.due ? new Date(a.due).getTime() : Infinity;
  const db = b.due ? new Date(b.due).getTime() : Infinity;
  if (da !== db) return da - db;
  return (prioRank[a.priority] ?? 1) - (prioRank[b.priority] ?? 1);
}

// Devuelve las secciones que se muestran en cada pestaña de la pantalla principal.
export function buildSections(tasks, seg, now = new Date()) {
  const pending = tasks.filter((t) => !t.done).sort(byDue);
  const eod = endOfDay(now).getTime();

  if (seg === 'hoy') {
    const overdue = pending.filter((t) => t.due && new Date(t.due) < now);
    const today = pending.filter(
      (t) => t.due && new Date(t.due) >= now && new Date(t.due).getTime() <= eod
    );
    return [
      { key: 'overdue', title: 'Vencidas', danger: true, items: overdue },
      { key: 'today', title: 'Hoy', items: today },
    ].filter((s) => s.items.length);
  }

  if (seg === 'prox') {
    const future = pending.filter((t) => t.due && new Date(t.due).getTime() > eod);
    const groups = [];
    future.forEach((t) => {
      const d = new Date(t.due);
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, d)) last.items.push(t);
      else groups.push({ key: String(startOfDay(d).getTime()), title: dayLabel(d), date: d, items: [t] });
    });
    return groups;
  }

  if (seg === 'sin') {
    const items = pending.filter((t) => !t.due);
    return items.length ? [{ key: 'none', title: 'Sin fecha', items }] : [];
  }

  const done = tasks
    .filter((t) => t.done)
    .sort((a, b) => new Date(b.doneAt || 0) - new Date(a.doneAt || 0))
    .slice(0, 100);
  return done.length ? [{ key: 'done', title: 'Completadas', items: done }] : [];
}

export function todayStats(tasks, now = new Date()) {
  const doneToday = tasks.filter((t) => t.doneAt && isToday(new Date(t.doneAt))).length;
  const eod = endOfDay(now).getTime();
  const remaining = tasks.filter(
    (t) => !t.done && t.due && new Date(t.due).getTime() <= eod
  ).length;
  const overdue = tasks.filter((t) => !t.done && t.due && new Date(t.due) < now).length;
  const total = doneToday + remaining;
  return { doneToday, remaining, overdue, total, pct: total ? doneToday / total : 0 };
}

export function tasksOnDay(tasks, day) {
  return tasks
    .filter((t) => t.due && isSameDay(new Date(t.due), day))
    .sort((a, b) => Number(a.done) - Number(b.done) || byDue(a, b));
}
