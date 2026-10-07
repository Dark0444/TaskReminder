import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarScreen({ tasks }) {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const markedDates = useMemo(() => {
    const marked = {};
    tasks.forEach(task => {
      const taskDate = format(parseISO(task.reminderTime), 'yyyy-MM-dd');
      if (!marked[taskDate]) {
        marked[taskDate] = {
          marked: true,
          dotColor: task.completed ? '#34C759' : '#007AFF',
        };
      }
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };
    return marked;
  }, [tasks, selectedDate]);

  const tasksForDate = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = format(parseISO(task.reminderTime), 'yyyy-MM-dd');
      return taskDate === selectedDate;
    }).sort((a, b) => {
      const timeA = new Date(a.reminderTime).getTime();
      const timeB = new Date(b.reminderTime).getTime();
      return timeA - timeB;
    });
  }, [tasks, selectedDate]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'baja':
        return '#34C759';
      case 'media':
        return '#FF9500';
      case 'alta':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'baja':
        return 'Baja';
      case 'media':
        return 'Media';
      case 'alta':
        return 'Alta';
      default:
        return 'Media';
    }
  };

  const selectedDateFormatted = format(
    parseISO(selectedDate),
    "EEEE, d 'de' MMMM",
    { locale: es }
  );

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#666',
          textSectionTitleDisabledColor: '#999',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: '#333',
          textDisabledColor: '#999',
          dotColor: '#007AFF',
          selectedDotColor: '#ffffff',
          monthTextColor: '#333',
          indicatorColor: '#007AFF',
          arrowColor: '#007AFF',
          disabledArrowColor: '#999',
        }}
      />

      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>{selectedDateFormatted}</Text>
        <Text style={styles.taskCount}>
          {tasksForDate.length} {tasksForDate.length === 1 ? 'tarea' : 'tareas'}
        </Text>
      </View>

      {tasksForDate.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>Sin tareas este día</Text>
        </View>
      ) : (
        <FlatList
          data={tasksForDate}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.tasksList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskItem,
                item.completed && styles.completedTask,
              ]}
            >
              <View style={styles.taskTime}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={item.completed ? '#999' : '#007AFF'}
                />
                <Text style={[styles.timeText, item.completed && styles.completedText]}>
                  {new Date(item.reminderTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.completed && styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>
                {item.description && (
                  <Text
                    style={[
                      styles.taskDescription,
                      item.completed && styles.completedText,
                    ]}
                  >
                    {item.description}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>
                  {getPriorityLabel(item.priority)}
                </Text>
              </View>

              {item.completed && (
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  dateHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tasksList: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
