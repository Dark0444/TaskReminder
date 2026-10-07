import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useStore } from '../store';
import { buildSections, todayStats } from '../selectors';
import { greeting, formatLongDate } from '../dates';
import { Segmented } from '../components/ui';
import TaskCard from '../components/TaskCard';

const SEGMENTS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'prox', label: 'Próximas' },
  { id: 'sin', label: 'Sin fecha' },
  { id: 'hechas', label: 'Hechas' },
];

const EMPTY = {
  hoy: ['🎉', 'Todo al día', 'No tienes nada pendiente para hoy. Toca + para añadir algo.'],
  prox: ['🗓️', 'Nada programado', 'Las tareas con fecha futura aparecerán aquí.'],
  sin: ['📝', 'Sin pendientes sueltos', 'Las ideas sin fecha viven aquí hasta que las agendes.'],
  hechas: ['✅', 'Aún no hay completadas', 'Desliza una tarea a la derecha para completarla.'],
};

export default function HomeScreen() {
  const { c, isDark } = useTheme();
  const { tasks } = useStore();
  const insets = useSafeAreaInsets();
  const [seg, setSeg] = useState('hoy');

  const stats = useMemo(() => todayStats(tasks), [tasks]);
  const sections = useMemo(() => buildSections(tasks, seg), [tasks, seg]);

  const rows = useMemo(() => {
    const out = [];
    let i = 0;
    sections.forEach((s) => {
      out.push({ type: 'header', key: 'h' + s.key, title: s.title, count: s.items.length, danger: s.danger });
      s.items.forEach((t) => out.push({ type: 'task', key: t.id, task: t, index: i++ }));
    });
    return out;
  }, [sections]);

  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(stats.pct, { duration: 700 });
  }, [stats.pct, w]);
  const barStyle = useAnimatedStyle(() => ({ width: `${Math.max(w.value, 0.02) * 100}%` }));

  const head = (
    <View>
      <LinearGradient
        colors={isDark ? ['#2A1B6E', '#143A8C'] : ['#6D4AFF', '#3F7BFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 22 }]}
      >
        <Text style={styles.date}>{formatLongDate(new Date())}</Text>
        <Text style={styles.hello}>{greeting()} 👋</Text>

        <View style={styles.progressCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={styles.big}>
                {stats.total ? `${stats.doneToday} de ${stats.total}` : 'Libre'}
              </Text>
              <Text style={styles.small}>
                {stats.total ? 'completadas hoy' : 'sin pendientes para hoy'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pct}>{Math.round(stats.pct * 100)}%</Text>
              {stats.overdue ? (
                <Text style={[styles.small, { color: '#FFD3D9' }]}>{stats.overdue} vencida(s)</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, barStyle]} />
          </View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: 18, marginBottom: 6 }}>
        <Segmented options={SEGMENTS} value={seg} onChange={setSeg} />
      </View>
    </View>
  );

  const empty = EMPTY[seg];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        ListHeaderComponent={head}
        contentContainerStyle={{ paddingBottom: 190 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <Text
              style={[
                styles.sectionTitle,
                { color: item.danger ? c.danger : c.sub },
              ]}
            >
              {item.title.toUpperCase()} · {item.count}
            </Text>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              <TaskCard task={item.task} index={item.index} />
            </View>
          )
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
            <Text style={{ fontSize: 54 }}>{empty[0]}</Text>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', marginTop: 12 }}>{empty[1]}</Text>
            <Text style={{ color: c.sub, textAlign: 'center', marginTop: 6, paddingHorizontal: 40 }}>
              {empty[2]}
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  date: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' },
  hello: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4, marginBottom: 18 },
  progressCard: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 22, padding: 16 },
  big: { color: '#fff', fontSize: 26, fontWeight: '900' },
  small: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  pct: { color: '#fff', fontSize: 22, fontWeight: '900' },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 14, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: '#2DE2B1' },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginHorizontal: 20, marginTop: 18, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 50 },
});
