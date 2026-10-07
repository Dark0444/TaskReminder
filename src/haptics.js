import * as Haptics from 'expo-haptics';

let enabled = true;
export const setHapticsEnabled = (v) => {
  enabled = !!v;
};

const safe = (fn) => {
  if (!enabled) return;
  try {
    const p = fn();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {
    // sin vibración disponible: no pasa nada
  }
};

export const tap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const select = () => safe(() => Haptics.selectionAsync());
export const success = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warning = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
