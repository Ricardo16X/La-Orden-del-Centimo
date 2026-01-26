import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTema } from '../src/context/TemaContext';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

function CustomDrawerContent(props: any) {
  const { tema } = useTema();

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: tema.colores.fondo }}>
      {/* Header del Drawer */}
      <View style={[styles.drawerHeader, { backgroundColor: tema.colores.primario }]}>
        <Text style={styles.appTitle}>La Orden del Céntimo</Text>
      </View>

      {/* Items del Drawer */}
      <DrawerItemList {...props} />

      {/* Sección de Gestión */}
      <View style={[styles.seccion, { borderTopColor: tema.colores.bordes }]}>
        <Text style={[styles.seccionTitulo, { color: tema.colores.textoSecundario }]}>
          Gestión
        </Text>
        <DrawerItem
          label="Categorías"
          icon={() => <Text style={styles.iconoTexto}>📂</Text>}
          onPress={() => router.push('/categorias')}
          labelStyle={{ color: tema.colores.texto }}
          style={{ backgroundColor: tema.colores.fondo }}
        />
        <DrawerItem
          label="Presupuestos"
          icon={() => <Text style={styles.iconoTexto}>💰</Text>}
          onPress={() => router.push('/presupuestos')}
          labelStyle={{ color: tema.colores.texto }}
          style={{ backgroundColor: tema.colores.fondo }}
        />
        <DrawerItem
          label="Tarjetas de Crédito"
          icon={() => <Text style={styles.iconoTexto}>💳</Text>}
          onPress={() => router.push('/tarjetas')}
          labelStyle={{ color: tema.colores.texto }}
          style={{ backgroundColor: tema.colores.fondo }}
        />
        <DrawerItem
          label="Recordatorios"
          icon={() => <Text style={styles.iconoTexto}>⏰</Text>}
          onPress={() => router.push('/recordatorios')}
          labelStyle={{ color: tema.colores.texto }}
          style={{ backgroundColor: tema.colores.fondo }}
        />
        <DrawerItem
          label="Metas de Ahorro"
          icon={() => <Text style={styles.iconoTexto}>🎯</Text>}
          onPress={() => router.push('/metas')}
          labelStyle={{ color: tema.colores.texto }}
          style={{ backgroundColor: tema.colores.fondo }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { tema } = useTema();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: tema.colores.fondo }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: tema.colores.primario,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          drawerStyle: {
            backgroundColor: tema.colores.fondo,
          },
          drawerActiveTintColor: tema.colores.primario,
          drawerInactiveTintColor: tema.colores.texto,
          sceneContainerStyle: {
            backgroundColor: tema.colores.fondo,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Inicio',
            title: 'Mis Gastos',
            drawerIcon: () => <Text style={styles.iconoTexto}>🏠</Text>,
          }}
        />
        <Drawer.Screen
          name="resumen"
          options={{
            drawerLabel: 'Resumen',
            title: 'Resumen Financiero',
            drawerIcon: () => <Text style={styles.iconoTexto}>📊</Text>,
          }}
        />
        <Drawer.Screen
          name="estadisticas"
          options={{
            drawerLabel: 'Estadísticas',
            title: 'Estadísticas',
            drawerIcon: () => <Text style={styles.iconoTexto}>📈</Text>,
          }}
        />
        <Drawer.Screen
          name="perfil"
          options={{
            drawerLabel: 'Perfil',
            title: 'Mi Perfil',
            drawerIcon: () => <Text style={styles.iconoTexto}>👤</Text>,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  seccion: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  iconoTexto: {
    fontSize: 20,
  },
});
