/**
 * Layout de navegación por tabs
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useTema } from '../src/context/TemaContext';

export default function TabLayout() {
  const { tema } = useTema();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tema.colores.primario,
        tabBarInactiveTintColor: tema.colores.textoSecundario,
        tabBarStyle: {
          backgroundColor: tema.colores.fondoSecundario,
          borderTopColor: tema.colores.bordes,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: 'Estadísticas',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: 'Gestión',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
