import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const palettes = {
  dark: {
    bg: '#0A0C14',
    surface: '#141826',
    surface2: '#1C2133',
    text: '#F3F5FB',
    sub: '#98A2BA',
    border: '#252B3F',
    primary: '#7C5CFF',
    primary2: '#4F8BFF',
    accent: '#2DE2B1',
    danger: '#FF5D73',
    warn: '#FFB547',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    bg: '#F3F4FB',
    surface: '#FFFFFF',
    surface2: '#EBEDF8',
    text: '#12142A',
    sub: '#6A7290',
    border: '#E0E3F1',
    primary: '#6D4AFF',
    primary2: '#3F7BFF',
    accent: '#12B98C',
    danger: '#F0405A',
    warn: '#F59E0B',
    overlay: 'rgba(15,18,40,0.45)',
  },
};

export const priorityMeta = {
  high: { label: 'Alta', color: '#FF5D73' },
  med: { label: 'Media', color: '#FFB547' },
  low: { label: 'Baja', color: '#2DE2B1' },
};

export const categories = [
  { id: 'personal', label: 'Personal', emoji: '🙂' },
  { id: 'work', label: 'Trabajo', emoji: '💼' },
  { id: 'study', label: 'Estudio', emoji: '📚' },
  { id: 'health', label: 'Salud', emoji: '💪' },
  { id: 'home', label: 'Casa', emoji: '🏠' },
  { id: 'other', label: 'Otro', emoji: '✨' },
];

export const repeatOptions = [
  { id: 'none', label: 'Una vez' },
  { id: 'daily', label: 'Cada día' },
  { id: 'weekly', label: 'Cada semana' },
  { id: 'monthly', label: 'Cada mes' },
];

export const alertOptions = [
  { m: 0, label: 'A la hora' },
  { m: 10, label: '10 min antes' },
  { m: 60, label: '1 h antes' },
  { m: 1440, label: '1 día antes' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ mode, children }) {
  const system = useColorScheme();
  const scheme = !mode || mode === 'auto' ? system || 'dark' : mode;
  const value = useMemo(
    () => ({ scheme, isDark: scheme === 'dark', c: palettes[scheme] }),
    [scheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeContext);
  return v || { scheme: 'dark', isDark: true, c: palettes.dark };
}
