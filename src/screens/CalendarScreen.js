import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, priorityMeta } from '../theme';
import { useStore } from '../store';
import { tasksOnDay } from '../selectors';
import { isSameDay, isToday, getDaysInMonth, startOfMonth, monthTitle, formatLongDate } from '../dates';
import TaskCard from '../components/TaskCard';
import * as H from '../haptics';

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
  const { c } = useTheme();
  const { tasks } = useStore();
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(new Date());

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const lead = (first.getDay() + 6) % 7; // semana empieza en lunes
    const days = getDaysInMonth(first);
    const out = [];
    for (let i = 0; i < lead; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push(new Date(first.getFullYear(), first.getMonth(), d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.due) return;
      const d = new Date(t.due);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[k] = map[k] || []).push(t);
    });
    return map;
  }, [tasks]);

  const list = useMemo(() => tasksOnDay(tasks, selected), [tasks, selected]);

  const shift = (n) => {
    H.select();
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 16, paddingBottom: 190 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Pressable onPress={() => shift(-1)} hitSlop={12} style={[styles.nav, { backgroundColor: c.surface2 }]}>
          <Ionicons name="chevron-back" size={20} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: '900' }}>{monthTitle(cursor)}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={12} style={[styles.nav, { backgroundColor: c.surface2 }]}>
          <Ionicons name="chevron-forward" size={20} color={c.text} />
        </Pressable>
      </View>

      <View style={[styles.grid, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.weekRow}>
          {WEEK.map((w) => (
            <Text key={w} style={[styles.weekDay, { color: c.sub }]}>
              {w}
            </Text>
          ))}
        </View>
        <View style={styles.cells}>
          {cells.map((d, i) => {
            if (!d) return <View key={'e' + i} style={styles.cell} />;
            const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const items = byDay[k] || [];
            const sel = isSameDay(d, selected);
            const today = isToday(d);
            return (
              <Pressable
                key={k}
                style={styles.cell}
                onPress={() => {
                  H.select();
                  setSelected(d);
                }}
              >
                <View
                  style={[
                    styles.day,
                    sel && { backgroundColor: c.primary },
                    !sel && today && { borderWidth: 1.5, borderColor: c.primary },
                  ]}
                >
                  <Text style={{ color: sel ? '#fff' : c.text, fontWeight: sel || today ? '800' : '600' }}>
                    {d.getDate()}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {items.slice(0, 3).map((t) => (
                    <View
                      key={t.id}
                      style={[
                        styles.dot,
                        { backgroundColor: t.done ? c.sub : (priorityMeta[t.priority] || priorityMeta.med).color },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 12 }}>
        {formatLongDate(selected)}
      </Text>
      {list.length ? (
        list.map((t, i) => <TaskCard key={t.id} task={t} index={i} />)
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Text style={{ fontSize: 40 }}>🌤️</Text>
          <Text style={{ color: c.sub, marginTop: 8 }}>Nada para este día</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  nav: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  grid: { borderRadius: 24, borderWidth: 1, padding: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  cells: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 5 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, marginHorizontal: 1 },
});
