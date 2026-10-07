import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, priorityMeta, categories } from '../theme';
import { useStore } from '../store';
import { useSheet } from '../sheet';
import { formatDue } from '../dates';
import * as H from '../haptics';

const Transition = Reanimated.LinearTransition || Reanimated.Layout;
const REPEAT_LABEL = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' };

export default function TaskCard({ task, index = 0 }) {
  const { c } = useTheme();
  const { toggleTask, deleteTask } = useStore();
  const sheet = useSheet();
  const swipeRef = useRef(null);
  const scale = useSharedValue(1);
  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pr = priorityMeta[task.priority] || priorityMeta.med;
  const cat = categories.find((x) => x.id === task.category);
  const overdue = !task.done && task.due && new Date(task.due) < new Date();

  const toggle = () => {
    scale.value = withSequence(withTiming(0.75, { duration: 90 }), withSpring(1));
    task.done ? H.tap() : H.success();
    toggleTask(task.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}
      exiting={FadeOutLeft.duration(220)}
      layout={Transition}
      style={{ marginBottom: 10 }}
    >
      <Swipeable
        ref={swipeRef}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
        renderLeftActions={() => (
          <View style={[styles.action, { backgroundColor: c.accent, alignItems: 'flex-start', paddingLeft: 22 }]}>
            <Ionicons name={task.done ? 'arrow-undo' : 'checkmark'} size={26} color="#06281F" />
          </View>
        )}
        renderRightActions={() => (
          <View style={[styles.action, { backgroundColor: c.danger, alignItems: 'flex-end', paddingRight: 22 }]}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </View>
        )}
        onSwipeableOpen={(dir) => {
          if (dir === 'left') {
            toggleTask(task.id);
            task.done ? H.tap() : H.success();
          } else {
            H.warning();
            deleteTask(task.id);
          }
          swipeRef.current && swipeRef.current.close();
        }}
      >
        <Pressable
          onPress={() => sheet.open(task)}
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <View style={[styles.accent, { backgroundColor: pr.color }]} />
          <Pressable onPress={toggle} hitSlop={10}>
            <Animated.View
              style={[
                styles.check,
                boxStyle,
                {
                  borderColor: task.done ? c.accent : pr.color,
                  backgroundColor: task.done ? c.accent : 'transparent',
                },
              ]}
            >
              {task.done ? <Ionicons name="checkmark" size={16} color="#06281F" /> : null}
            </Animated.View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={2}
              style={{
                color: task.done ? c.sub : c.text,
                fontSize: 16,
                fontWeight: '700',
                textDecorationLine: task.done ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </Text>
            <View style={styles.meta}>
              {task.due ? (
                <View style={[styles.tag, { backgroundColor: (overdue ? c.danger : c.primary) + '1F' }]}>
                  <Ionicons name="alarm-outline" size={12} color={overdue ? c.danger : c.primary} />
                  <Text style={[styles.tagText, { color: overdue ? c.danger : c.primary }]}>
                    {formatDue(task.due)}
                  </Text>
                </View>
              ) : null}
              {task.repeat !== 'none' ? (
                <View style={[styles.tag, { backgroundColor: c.surface2 }]}>
                  <Ionicons name="repeat" size={12} color={c.sub} />
                  <Text style={[styles.tagText, { color: c.sub }]}>{REPEAT_LABEL[task.repeat]}</Text>
                </View>
              ) : null}
              {cat ? (
                <View style={[styles.tag, { backgroundColor: c.surface2 }]}>
                  <Text style={{ fontSize: 11 }}>{cat.emoji}</Text>
                  <Text style={[styles.tagText, { color: c.sub }]}>{cat.label}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 18,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  action: { flex: 1, justifyContent: 'center', borderRadius: 20, marginVertical: 0 },
});
