import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, priorityMeta, categories, repeatOptions, alertOptions } from '../theme';
import { useStore } from '../store';
import { parseQuickInput } from '../nlp';
import { formatDue } from '../dates';
import { Chip, SectionLabel } from './ui';
import * as H from '../haptics';

const blank = () => ({
  text: '',
  notes: '',
  due: undefined,
  repeat: undefined,
  priority: undefined,
  category: 'personal',
  alerts: null,
});

export default function TaskSheet({ visible, task, onClose }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { addTask, updateTask, deleteTask, settings } = useStore();
  const editing = !!task;
  const [f, setF] = useState(blank());

  useEffect(() => {
    if (!visible) return;
    if (task) {
      setF({
        text: task.title,
        notes: task.notes || '',
        due: task.due || null,
        repeat: task.repeat,
        priority: task.priority,
        category: task.category || 'personal',
        alerts: task.alerts || [0],
      });
    } else {
      setF(blank());
    }
  }, [visible, task]);

  const parsed = useMemo(
    () => (editing ? null : parseQuickInput(f.text)),
    [f.text, editing]
  );

  const title = editing ? f.text.trim() : (parsed && parsed.title) || f.text.trim();
  const dueIso =
    f.due !== undefined ? f.due : parsed && parsed.due ? parsed.due.toISOString() : null;
  const repeat = f.repeat !== undefined ? f.repeat : parsed ? parsed.repeat : 'none';
  const priority = f.priority !== undefined ? f.priority : (parsed && parsed.priority) || 'med';
  const alerts = f.alerts || settings.defaultAlerts;

  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const pickDateTime = () => {
    const base = dueIso ? new Date(dueIso) : new Date(Date.now() + 3600000);
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      onChange: (e, d) => {
        if (e.type !== 'set' || !d) return;
        DateTimePickerAndroid.open({
          value: base,
          mode: 'time',
          is24Hour: true,
          onChange: (e2, t) => {
            if (e2.type !== 'set' || !t) return;
            const out = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes());
            set({ due: out.toISOString() });
            H.success();
          },
        });
      },
    });
  };

  const toggleAlert = (m) => {
    const cur = alerts.includes(m) ? alerts.filter((x) => x !== m) : [...alerts, m];
    set({ alerts: cur.length ? cur.sort((a, b) => a - b) : [0] });
  };

  const save = () => {
    if (!title) {
      H.warning();
      return;
    }
    const data = {
      title,
      notes: f.notes.trim(),
      due: dueIso,
      repeat: dueIso ? repeat : 'none',
      priority,
      category: f.category,
      alerts,
    };
    if (editing) updateTask(task.id, data);
    else addTask(data);
    H.success();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: c.overlay }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: insets.bottom + 12 }]}>
            <View style={[styles.grabber, { backgroundColor: c.border }]} />
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 560 }}>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: '800', marginBottom: 12 }}>
                {editing ? 'Editar tarea' : 'Nueva tarea'}
              </Text>

              <TextInput
                value={f.text}
                onChangeText={(t) => set({ text: t })}
                placeholder={editing ? 'Título' : 'Ej: Llamar al banco mañana a las 3pm'}
                placeholderTextColor={c.sub}
                autoFocus={!editing}
                multiline
                style={[styles.input, { backgroundColor: c.surface2, color: c.text }]}
              />
              {!editing ? (
                <Text style={{ color: c.sub, fontSize: 12, marginTop: 6 }}>
                  Escribe natural: "hoy a las 5", "el viernes", "cada lunes", "en 2 horas", "urgente". Para
                  dictar, usa el micrófono de tu teclado 🎙️
                </Text>
              ) : null}

              <View style={[styles.preview, { backgroundColor: c.surface2 }]}>
                <Ionicons name="sparkles" size={16} color={c.primary} />
                <Text style={{ color: c.text, marginLeft: 8, flex: 1, fontWeight: '600' }} numberOfLines={2}>
                  {title || 'Sin título todavía'}
                  {dueIso ? `  ·  ${formatDue(dueIso)}` : ''}
                </Text>
              </View>

              <SectionLabel>Cuándo</SectionLabel>
              <View style={styles.row}>
                <Chip icon="calendar-outline" label={dueIso ? formatDue(dueIso) : 'Elegir fecha y hora'} active={!!dueIso} onPress={pickDateTime} />
                {dueIso ? <Chip icon="close" label="Quitar" onPress={() => set({ due: null })} color={c.danger} /> : null}
              </View>

              {dueIso ? (
                <>
                  <SectionLabel>Repetir</SectionLabel>
                  <View style={styles.row}>
                    {repeatOptions.map((o) => (
                      <Chip key={o.id} label={o.label} active={repeat === o.id} onPress={() => set({ repeat: o.id })} />
                    ))}
                  </View>
                  <SectionLabel>Avisarme</SectionLabel>
                  <View style={styles.row}>
                    {alertOptions.map((o) => (
                      <Chip key={o.m} label={o.label} active={alerts.includes(o.m)} onPress={() => toggleAlert(o.m)} icon="notifications-outline" />
                    ))}
                  </View>
                </>
              ) : null}

              <SectionLabel>Prioridad</SectionLabel>
              <View style={styles.row}>
                {Object.entries(priorityMeta).map(([id, m]) => (
                  <Chip key={id} label={m.label} color={m.color} active={priority === id} onPress={() => set({ priority: id })} icon="flag-outline" />
                ))}
              </View>

              <SectionLabel>Categoría</SectionLabel>
              <View style={styles.row}>
                {categories.map((o) => (
                  <Chip key={o.id} label={o.label} emoji={o.emoji} active={f.category === o.id} onPress={() => set({ category: o.id })} />
                ))}
              </View>

              <SectionLabel>Notas</SectionLabel>
              <TextInput
                value={f.notes}
                onChangeText={(t) => set({ notes: t })}
                placeholder="Detalles opcionales"
                placeholderTextColor={c.sub}
                multiline
                style={[styles.input, { backgroundColor: c.surface2, color: c.text, minHeight: 64 }]}
              />
            </ScrollView>

            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              {editing ? (
                <Pressable
                  onPress={() => {
                    H.warning();
                    deleteTask(task.id);
                    onClose();
                  }}
                  style={[styles.delete, { backgroundColor: c.danger + '22' }]}
                >
                  <Ionicons name="trash-outline" size={22} color={c.danger} />
                </Pressable>
              ) : null}
              <Pressable onPress={save} style={{ flex: 1 }}>
                <LinearGradient colors={[c.primary, c.primary2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.save}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                    {editing ? 'Guardar cambios' : 'Crear tarea'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 14 },
  input: { borderRadius: 16, padding: 14, fontSize: 16, minHeight: 52, textAlignVertical: 'top' },
  preview: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginTop: 12, marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  save: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  delete: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
});
