import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import ErrorBoundary from './src/components/ErrorBoundary';
import TabBar from './src/components/TabBar';
import { ThemeProvider, useTheme } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import { SheetProvider, Fab } from './src/sheet';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function Inner() {
  const { c, isDark } = useTheme();
  const { ready } = useStore();

  const navTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme : DefaultTheme).colors,
        background: c.bg,
        card: c.surface,
        text: c.text,
        border: c.border,
        primary: c.primary,
      },
    }),
    [isDark, c]
  );

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  return (
    <SheetProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={{ headerShown: false }}
            sceneContainerStyle={{ backgroundColor: c.bg }}
            tabBar={(props) => <TabBar {...props} />}
          >
            <Tab.Screen name="Hoy" component={HomeScreen} />
            <Tab.Screen name="Calendario" component={CalendarScreen} />
            <Tab.Screen name="Ajustes" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <Fab />
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SheetProvider>
  );
}

function Themed() {
  const { settings } = useStore();
  return (
    <ThemeProvider mode={settings.theme}>
      <Inner />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StoreProvider>
            <Themed />
          </StoreProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
