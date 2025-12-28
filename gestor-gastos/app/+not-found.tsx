import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTema } from './src/context/TemaContext';

export default function NotFoundScreen() {
  const { tema } = useTema();

  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
        <Text style={[styles.emoji]}>🔍</Text>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          Página no encontrada
        </Text>
        <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
          La página que buscas no existe
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity style={[styles.boton, { backgroundColor: tema.colores.primario }]}>
            <Text style={styles.botonTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  boton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
