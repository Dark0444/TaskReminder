import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const CHANNEL = 'tareas';
export const SUMMARY_CHANNEL = 'resumen';
export const CATEGORY = 'tarea';

let ready = false;

export async function setupNotifications() {
  if (ready) return;
  ready = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Recordatorios de tareas',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#7C5CFF',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      await Notifications.setNotificationChannelAsync(SUMMARY_CHANNEL, {
        name: 'Resumen diario',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
    await Notifications.setNotificationCategoryAsync(CATEGORY, [
      { identifier: 'done', buttonTitle: '✅ Completar', options: { opensAppToForeground: true } },
      { identifier: 'snooze10', buttonTitle: '⏰ +10 min', options: { opensAppToForeground: true } },
      { identifier: 'snooze60', buttonTitle: '🕐 +1 h', options: { opensAppToForeground: true } },
    ]);
  } catch (e) {
    // si algo falla aquí la app sigue funcionando sin alertas avanzadas
  }
}

export async function ensurePermission() {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) {
    return false;
  }
}

export async function cancelIds(ids) {
  if (!ids || !ids.length) return;
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
  );
}

export async function cancelAll() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // nada
  }
}

function offsetText(m) {
  if (m >= 1440) return 'Mañana';
  if (m >= 60) return `En ${Math.round(m / 60)} h`;
  return `En ${m} min`;
}

// Programa los avisos de una tarea y devuelve los ids. Cancela los anteriores.
export async function scheduleForTask(task) {
  await cancelIds(task.notifIds);
  if (task.done || !task.due) return [];
  const due = new Date(task.due).getTime();
  if (Number.isNaN(due)) return [];
  const alerts = task.alerts && task.alerts.length ? task.alerts : [0];
  const ids = [];
  for (const m of alerts) {
    const when = due - m * 60000;
    if (when <= Date.now() + 3000) continue;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: m === 0 ? `⏰ ${task.title}` : `${offsetText(m)}: ${task.title}`,
          body: task.notes ? task.notes : m === 0 ? 'Es la hora. ¿La completaste?' : 'Prepárate, se acerca.',
          data: { taskId: task.id },
          categoryIdentifier: CATEGORY,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: { date: new Date(when), channelId: CHANNEL },
      });
      ids.push(id);
    } catch (e) {
      // seguimos con los demás avisos
    }
  }
  return ids;
}

export async function snooze(task, minutes) {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `💤 ${task.title}`,
        body: `Pospuesta ${minutes >= 60 ? minutes / 60 + ' h' : minutes + ' min'}. Aquí vuelvo a avisarte.`,
        data: { taskId: task.id },
        categoryIdentifier: CATEGORY,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: { date: new Date(Date.now() + minutes * 60000), channelId: CHANNEL },
    });
  } catch (e) {
    return null;
  }
}

export async function scheduleSummary(settings) {
  if (settings.summaryId) {
    await Notifications.cancelScheduledNotificationAsync(settings.summaryId).catch(() => {});
  }
  if (!settings.summaryEnabled) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Tu día',
        body: 'Abre la app para ver lo que tienes hoy y lo que quedó pendiente.',
        data: { type: 'summary' },
        sound: 'default',
      },
      trigger: {
        hour: settings.summaryHour,
        minute: settings.summaryMinute,
        repeats: true,
        channelId: SUMMARY_CHANNEL,
      },
    });
  } catch (e) {
    return null;
  }
}

export async function scheduleTest() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Prueba de alerta',
        body: 'Si ves los botones debajo, todo funciona.',
        data: { type: 'test' },
        categoryIdentifier: CATEGORY,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: { date: new Date(Date.now() + 6000), channelId: CHANNEL },
    });
    return true;
  } catch (e) {
    return false;
  }
}
