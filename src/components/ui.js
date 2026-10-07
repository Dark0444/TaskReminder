import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import * as H from '../haptics';

export function Chip({ label, active, onPress, color, icon, emoji }) {
  const { c } = useTheme();
  const tint = color || c.primary;
  return (
    <Pressable
      onPress={() => {
        H.select();
        onPress && onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? tint + '26' : c.surface2,
          borderColor: active ? tint : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {emoji ? <Text style={{ marginRight: 6 }}>{emoji}</Text> : null}
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? tint : c.sub} style={{ marginRight: 6 }} />
      ) : null}
      <Text style={{ color: active ? tint : c.sub, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  const { c } = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: c.surface2 }]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              H.select();
              onChange(o.id);
            }}
            style={[styles.segItem, active && { backgroundColor: c.surface }]}
          >
            <Text style={{ color: active ? c.text : c.sub, fontWeight: active ? '700' : '500', fontSize: 13 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

export function SectionLabel({ children, color }) {
  const { c } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: color || c.sub }]}>{String(children).toUpperCase()}</Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  seg: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 11 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
});
