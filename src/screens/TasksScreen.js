import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TasksScreen({ tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('media');

  const priorities = [
    { id: 'baja', label: 'Baja', color: '#34C759' },
    { id: 'media', label: 'Media', color: '#FF9500' },
    { id: 'alta', label: 'Alta', color: '#FF3B30' },
  ];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const newDate = new Date(reminderDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setReminderDate(newDate);
    }
    setShowTimePicker(false);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la tarea');
      return;
    }

    onAddTask({
      title: taskTitle,
      description: taskDescription,
      reminderTime: reminderDate.toISOString(),
      priority: selectedPriority,
      completed: false,
    });

    setTaskTitle('');
    setTaskDescription('');
    setReminderDate(new Date());
    setSelectedPriority('media');
    setModalVisible(false);
  };

  const handleCompleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    onUpdateTask(taskId, { completed: !task.completed });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    const prio = priorities.find(p => p.id === priority);
    return prio ? prio.color : '#FF9500';
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>No hay tareas aún</Text>
          <Text style={styles.emptySubText}>Crea tu primera tarea para comenzar</Text>
        </View>
      ) : (
        <ScrollView style={styles.tasksList}>
          {incompleteTasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pendientes ({incompleteTasks.length})</Text>
              <FlatList
                scrollEnabled={false}
                data={incompleteTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.taskCard}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleCompleteTask(item.id)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="#007AFF"
                      />
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.taskDescription}>{item.description}</Text>
                      )}
                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityColor(item.priority) },
                          ]}
                        >
                          <Text style={styles.priorityText}>
                            {priorities.find(p => p.id === item.priority)?.label}
                          </Text>
                        </View>
                        <Text style={styles.reminderText}>
                          {formatDate(item.reminderTime)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => onDeleteTask(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}

          {completedTasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Completadas ({completedTasks.length})</Text>
              <FlatList
                scrollEnabled={false}
                data={completedTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.taskCard, styles.completedCard]}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleCompleteTask(item.id)}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, styles.completedText]}>
                        {item.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onDeleteTask(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="¿Qué necesitas hacer?"
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholderTextColor="#C7C7CC"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detalles adicionales"
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#C7C7CC"
              />

              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.prioritySelector}>
                {priorities.map(priority => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority.id && styles.priorityOptionSelected,
                    ]}
                    onPress={() => setSelectedPriority(priority.id)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                    <Text style={styles.priorityOptionText}>{priority.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Fecha de Recordatorio</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <Text style={styles.dateButtonText}>{formatDate(reminderDate)}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={reminderDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={reminderDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              )}

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#007AFF" />
                <Text style={styles.dateButtonText}>
                  {reminderDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddTask}
            >
              <Text style={styles.submitButtonText}>Crear Tarea</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  tasksList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedCard: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskMeta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reminderText: {
    fontSize: 12,
    color: '#666',
  },
  deleteBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  priorityOptionSelected: {
    backgroundColor: '#E5F0FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
