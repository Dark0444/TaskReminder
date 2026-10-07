import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Habilitar notificaciones</Text>
            <Text style={styles.settingDescription}>Recibe alertas de tus recordatorios</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Sonido</Text>
            <Text style={styles.settingDescription}>Emite sonido en las alertas</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={soundEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Vibración</Text>
            <Text style={styles.settingDescription}>Vibra cuando recibes recordatorios</Text>
          </View>
          <Switch
            value={vibrateEnabled}
            onValueChange={setVibrateEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={vibrateEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Tema</Text>
            <Text style={styles.settingDescription}>Sistema (Light/Dark)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Tamaño de fuente</Text>
            <Text style={styles.settingDescription}>Por defecto</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Versión de la app</Text>
            <Text style={styles.settingDescription}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Privacidad</Text>
            <Text style={styles.settingDescription}>Lee nuestra política de privacidad</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Términos de servicio</Text>
            <Text style={styles.settingDescription}>Lee nuestros términos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Sobre la app</Text>
            <Text style={styles.settingDescription}>Task Reminder v1.0.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Limpiar datos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        © 2024 Task Reminder. Todos los derechos reservados.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 12,
    marginHorizontal: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  dangerButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginVertical: 32,
  },
});
