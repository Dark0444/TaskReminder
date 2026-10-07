import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import * as H from '../haptics';

const ICONS = {
  Hoy: ['today', 'today-outline'],
  Calendario: ['calendar', 'calendar-outline'],
  Ajustes: ['settings', 'settings-outline'],
};

export const TAB_BAR_HEIGHT = 68;

export default function TabBar({ state, navigation }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          bottom: insets.bottom + 12,
          backgroundColor: c.surface,
          borderColor: c.border,
          height: TAB_BAR_HEIGHT,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const [on, off] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
        return (
          <Pressable
            key={route.key}
            style={styles.item}
            onPress={() => {
              H.select();
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <View
              style={[
                styles.pill,
                { backgroundColor: focused ? c.primary + '22' : 'transparent' },
              ]}
            >
              <Ionicons name={focused ? on : off} size={22} color={focused ? c.primary : c.sub} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? c.primary : c.sub }}>
              {route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 18, paddingVertical: 4, borderRadius: 16, marginBottom: 2 },
});
