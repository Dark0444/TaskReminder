import React, { createContext, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { ZoomIn } from 'react-native-reanimated';
import TaskSheet from './components/TaskSheet';
import { TAB_BAR_HEIGHT } from './components/TabBar';
import { useTheme } from './theme';
import * as H from './haptics';

const SheetContext = createContext({ open: () => {}, close: () => {} });

export function SheetProvider({ children }) {
  const [st, setSt] = useState({ visible: false, task: null });
  const api = useMemo(
    () => ({
      open: (task = null) => setSt({ visible: true, task }),
      close: () => setSt((s) => ({ ...s, visible: false })),
    }),
    []
  );
  return (
    <SheetContext.Provider value={api}>
      {children}
      <TaskSheet visible={st.visible} task={st.task} onClose={api.close} />
    </SheetContext.Provider>
  );
}

export const useSheet = () => useContext(SheetContext);

export function Fab() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const sheet = useSheet();
  return (
    <Animated.View
      entering={ZoomIn.delay(300).springify()}
      style={[styles.wrap, { bottom: insets.bottom + 12 + TAB_BAR_HEIGHT + 14 }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          H.tap();
          sheet.open(null);
        }}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
      >
        <LinearGradient
          colors={[c.primary, c.primary2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 20 },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#7C5CFF',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
