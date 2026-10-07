import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  Share,
  Alert,
  Linking,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, alertOptions } from '../theme';
import { useStore } from '../store';
import * as N from '../notifications';
import { formatClock } from '../dates';
import { Card, Chip, Segmented, SectionLabel } from '../components/ui';
import * as H from '../haptics';

function Row({ icon, title, sub, onPress, right, danger }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        H.select();
        onPress();
      }}
      style={styles.row}
    >
      <View style={[styles.icon, { backgroundColor: (danger ? c.danger : c.primary) + '1F' }]}>
        <Ionicons name={icon} size={20} color={danger ? c.danger : c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? c.danger : c.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        {sub ? <Text style={{ color: c.sub, fontSize: 12, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, exportData, importData, clearDone, tasks } = useStore();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const pickSummaryTime = () => {
    const base = new Date();
    base.setHours(settings.summaryHour, settings.summaryMinute, 0, 0);
    DateTimePickerAndroid.open({
      value: base,
      mode: 'time',
      is24Hour: true,
      onChange: (e, d) => {
        if (e.type !== 'set' || !d) return;
        updateSettings({ summaryHour: d.getHours(), summaryMinute: d.getMinutes(), summaryEnabled: true });
      },
    });
  };

  const toggleAlert = (m) => {
    const cur = settings.defaultAlerts.includes(m)
      ? settings.defaultAlerts.filter((x) => x !== m)
      : [...settings.defaultAlerts, m];
    updateSettings({ defaultAlerts: cur.length ? cur : [0] });
  };

  const askPermission = async () => {
    const ok = await N.ensurePermission();
    Alert.alert(
      ok ? 'Permiso concedido' : 'Permiso denegado',
      ok
        ? 'Las alertas están activas.'
        : 'Actívalas en Ajustes del teléfono > Aplicaciones > Task Reminder > Notificaciones.'
    );
  };

  const test = async () => {
    const ok = await N.ensurePermission();
    if (!ok) return askPermission();
    const sent = await N.scheduleTest();
    Alert.alert(
      sent ? 'Prueba enviada' : 'No se pudo programar',
      sent ? 'En unos 6 segundos llegará una notificación con botones. Puedes bloquear la pantalla para probar.' : 'Revisa los permisos.'
    );
  };

  const doExport = async () => {
    try {
      await Share.share({ message: exportData(), title: 'Respaldo de Task Reminder' });
    } catch (e) {
      // cancelado
    }
  };

  const doImport = async () => {
    try {
      const n = await importData(importText.trim());
      setImportOpen(false);
      setImportText('');
      H.success();
      Alert.alert('Restauración lista', `Se cargaron ${n} tareas.`);
    } catch (e) {
      H.warning();
      Alert.alert('No se pudo restaurar', String(e.message || e));
    }
  };

  const doClear = () => {
    const n = tasks.filter((t) => t.done).length;
    if (!n) return Alert.alert('Nada que borrar', 'No hay tareas completadas.');
    Alert.alert('Borrar completadas', `Se eliminarán ${n} tareas completadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearDone },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 16, paddingBottom: 190 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: c.text, fontSize: 30, fontWeight: '900', marginBottom: 18 }}>Ajustes</Text>

      <SectionLabel>Apariencia</SectionLabel>
      <Card style={{ marginBottom: 20 }}>
        <Segmented
          options={[
            { id: 'auto', label: 'Automático' },
            { id: 'light', label: 'Claro' },
            { id: 'dark', label: 'Oscuro' },
          ]}
          value={settings.theme}
          onChange={(v) => updateSettings({ theme: v })}
        />
        <Row
          icon="phone-portrait-outline"
          title="Vibración al tocar"
          right={<Switch value={settings.haptics} onValueChange={(v) => updateSettings({ haptics: v })} trackColor={{ true: c.primary }} />}
        />
      </Card>

      <SectionLabel>Alertas</SectionLabel>
      <Card style={{ marginBottom: 20 }}>
        <Row
          icon="sunny-outline"
          title="Resumen diario"
          sub={settings.summaryEnabled ? `Todos los días a las ${formatClock(settings.summaryHour, settings.summaryMinute)}` : 'Un aviso cada mañana con tu día'}
          right={<Switch value={settings.summaryEnabled} onValueChange={(v) => updateSettings({ summaryEnabled: v })} trackColor={{ true: c.primary }} />}
        />
        {settings.summaryEnabled ? (
          <Row icon="time-outline" title="Hora del resumen" sub={formatClock(settings.summaryHour, settings.summaryMinute)} onPress={pickSummaryTime} />
        ) : null}
        <Text style={{ color: c.sub, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 8 }}>
          AVISOS POR DEFECTO EN TAREAS NUEVAS
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {alertOptions.map((o) => (
            <Chip key={o.m} label={o.label} active={settings.defaultAlerts.includes(o.m)} onPress={() => toggleAlert(o.m)} />
          ))}
        </View>
        <Row icon="notifications-outline" title="Probar una alerta" sub="Llega en 6 segundos con botones" onPress={test} />
        <Row icon="shield-checkmark-outline" title="Permiso de notificaciones" onPress={askPermission} />
      </Card>

      <Card style={{ marginBottom: 20, backgroundColor: c.warn + '14', borderColor: c.warn + '55' }}>
        <Text style={{ color: c.text, fontWeight: '800', marginBottom: 6 }}>⚡ Para que las alertas lleguen siempre</Text>
        <Text style={{ color: c.sub, fontSize: 13, lineHeight: 19 }}>
          En Samsung, ve a Ajustes del teléfono &gt; Aplicaciones &gt; Task Reminder y: 1) Batería &gt; "Sin
          restricciones", 2) activa "Alarmas y recordatorios" si aparece. Así el sistema no retrasa los avisos.
        </Text>
        <Pressable onPress={() => Linking.openSettings()} style={[styles.linkBtn, { backgroundColor: c.warn }]}>
          <Text style={{ color: '#2B1B00', fontWeight: '800' }}>Abrir ajustes de la app</Text>
        </Pressable>
      </Card>

      <SectionLabel>Datos</SectionLabel>
      <Card style={{ marginBottom: 20 }}>
        <Row icon="share-outline" title="Crear respaldo" sub="Compártelo contigo mismo (WhatsApp, notas, correo)" onPress={doExport} />
        <Row icon="download-outline" title="Restaurar respaldo" sub="Pega el texto del respaldo" onPress={() => setImportOpen(true)} />
        <Row icon="trash-outline" title="Borrar completadas" onPress={doClear} danger />
      </Card>

      <Text style={{ color: c.sub, textAlign: 'center', fontSize: 12 }}>
        Task Reminder 2.0 · {tasks.length} tareas guardadas en este teléfono
      </Text>

      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={() => setImportOpen(false)}>
        <View style={[styles.modalBack, { backgroundColor: c.overlay }]}>
          <View style={[styles.modal, { backgroundColor: c.surface }]}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Restaurar respaldo</Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder="Pega aquí el texto del respaldo"
              placeholderTextColor={c.sub}
              style={[styles.importInput, { backgroundColor: c.surface2, color: c.text }]}
            />
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <Pressable onPress={() => setImportOpen(false)} style={[styles.mBtn, { backgroundColor: c.surface2 }]}>
                <Text style={{ color: c.text, fontWeight: '700' }}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={doImport} style={[styles.mBtn, { backgroundColor: c.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Restaurar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  modalBack: { flex: 1, justifyContent: 'center', padding: 20 },
  modal: { borderRadius: 24, padding: 20 },
  importInput: { borderRadius: 14, padding: 12, minHeight: 160, maxHeight: 280, textAlignVertical: 'top' },
  mBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginHorizontal: 4 },
});
