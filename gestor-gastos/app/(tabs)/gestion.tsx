import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTema } from '../src/context/TemaContext';

export default function GestionScreen() {
  const { tema } = useTema();

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>⚙️ Gestión</Text>
      <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
        Configura tus categorías, presupuestos y más
      </Text>

      {/* Menú de opciones */}
      <View style={styles.menu}>
        {/* Categorías */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => router.push('/categorias')}
        >
          <View style={[styles.menuIcono, { backgroundColor: tema.colores.primario }]}>
            <Text style={styles.menuIconoTexto}>📂</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Categorías
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Gestiona tus categorías personalizadas
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Presupuestos */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => router.push('/presupuestos')}
        >
          <View style={[styles.menuIcono, { backgroundColor: tema.colores.acento }]}>
            <Text style={styles.menuIconoTexto}>💰</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Presupuestos
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Define límites por categoría
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Tarjetas de Crédito */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => router.push('/tarjetas')}
        >
          <View style={[styles.menuIcono, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.menuIconoTexto}>💳</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Tarjetas de Crédito
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Gestiona tus tarjetas y fechas
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Recordatorios */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => router.push('/recordatorios')}
        >
          <View style={[styles.menuIcono, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.menuIconoTexto}>⏰</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Recordatorios
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Configura alertas para registrar gastos
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Metas de Ahorro */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => router.push('/metas')}
        >
          <View style={[styles.menuIcono, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.menuIconoTexto}>🎯</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Metas de Ahorro
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Define y sigue tus objetivos financieros
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  menu: {
    gap: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
  },
  menuIcono: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconoTexto: {
    fontSize: 24,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescripcion: {
    fontSize: 13,
  },
  menuFlecha: {
    fontSize: 32,
    fontWeight: '300',
  },
});
