import React from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';

// Si algo falla al ejecutarse, muestra el error en pantalla en lugar de cerrarse.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    const e = this.state.error;
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0C14', padding: 24, paddingTop: 64 }}>
        <Text style={{ color: '#FF5D73', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>
          Algo falló
        </Text>
        <Text style={{ color: '#98A2BA', marginBottom: 16 }}>
          Toma una captura de esta pantalla y envíasela a Claude para arreglarlo.
        </Text>
        <ScrollView style={{ flex: 1, backgroundColor: '#141826', borderRadius: 14, padding: 14 }}>
          <Text selectable style={{ color: '#F3F5FB', fontSize: 12 }}>
            {String((e && e.message) || e)}
            {'\n\n'}
            {String((e && e.stack) || '').slice(0, 1500)}
          </Text>
        </ScrollView>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={{ backgroundColor: '#7C5CFF', padding: 16, borderRadius: 14, marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}
