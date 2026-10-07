import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      ...task,
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);

    if (task.reminderTime) {
      scheduleNotification(newTask);
    }
  };

  const updateTask = (id, updatedTask) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, ...updatedTask } : t
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    saveTasks(updatedTasks);
  };

  const scheduleNotification = async (task) => {
    try {
      const reminderDate = new Date(task.reminderTime);
      const trigger = new Date(reminderDate).getTime() - new Date().getTime();

      if (trigger > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📝 Recordatorio de Tarea',
            body: task.title,
            data: { taskId: task.id },
            sound: 'default',
            badge: 1,
          },
          trigger: {
            seconds: Math.ceil(trigger / 1000),
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Tasks') {
              iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: true,
        })}
      >
        <Tab.Screen
          name="Tasks"
          options={{ title: 'Mis Tareas' }}
          children={() => (
            <TasksScreen
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}
        />
        <Tab.Screen
          name="Calendar"
          options={{ title: 'Calendario' }}
          children={() => (
            <CalendarScreen tasks={tasks} />
          )}
        />
        <Tab.Screen
          name="Settings"
          options={{ title: 'Configuración' }}
          children={() => (
            <SettingsScreen />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
