import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTema } from './src/context/TemaContext';
import { useCategorias } from './src/context/CategoriasContext';

const COLORES_DISPONIBLES = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#ffeaa7', '#dfe6e9', '#b2bec3', '#fd79a8',
  '#fdcb6e', '#6c5ce7', '#00b894', '#e17055',
];

const EMOJIS_COMUNES = [
  '🍔', '🚗', '🏠', '💊', '👕', '🎮', '📚', '✈️',
  '🎬', '☕', '💰', '🎁', '🏥', '🔧', '⚡', '📱',
  '🎨', '🏋️', '🎵', '🛒', '💻', '🎯', '🌟', '💳',
];

export default function CategoriasScreen() {
  const { tema } = useTema();
  const { categorias, agregarCategoria, eliminarCategoria } = useCategorias();

  const [nombre, setNombre] = useState('');
  const [emojiSeleccionado, setEmojiSeleccionado] = useState('🎯');
  const [colorSeleccionado, setColorSeleccionado] = useState('#ff6b6b');

  const handleAgregar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    agregarCategoria({
      nombre: nombre.trim(),
      emoji: emojiSeleccionado,
      color: colorSeleccionado,
    });

    setNombre('');
    setEmojiSeleccionado('🎯');
    setColorSeleccionado('#ff6b6b');

    Alert.alert('Éxito', 'Categoría agregada correctamente');
  };

  const handleEliminar = (id: string, nombreCat: string, esPersonalizada?: boolean) => {
    if (!esPersonalizada) {
      Alert.alert('No permitido', 'No puedes eliminar categorías predeterminadas');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar la categoría "${nombreCat}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarCategoria(id);
            Alert.alert('Eliminada', 'Categoría eliminada correctamente');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.botonVolver, { color: tema.colores.primario }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>📂 Categorías</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Formulario */}
        <View style={[styles.seccion, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>➕ Nueva Categoría</Text>

          <Text style={[styles.label, { color: tema.colores.texto }]}>Nombre:</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: tema.colores.fondo,
              borderColor: tema.colores.bordes,
              color: tema.colores.texto,
            }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Gimnasio"
            placeholderTextColor={tema.colores.textoSecundario}
            maxLength={20}
          />

          <Text style={[styles.label, { color: tema.colores.texto }]}>Emoji:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
            {EMOJIS_COMUNES.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiBoton,
                  {
                    backgroundColor: emojiSeleccionado === emoji ? tema.colores.primario : tema.colores.fondo,
                    borderColor: tema.colores.bordes,
                  },
                ]}
                onPress={() => setEmojiSeleccionado(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: tema.colores.texto }]}>Color:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
            {COLORES_DISPONIBLES.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBoton,
                  {
                    backgroundColor: color,
                    borderColor: colorSeleccionado === color ? tema.colores.texto : 'transparent',
                    borderWidth: colorSeleccionado === color ? 3 : 1,
                  },
                ]}
                onPress={() => setColorSeleccionado(color)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
            onPress={handleAgregar}
          >
            <Text style={styles.textoBotonAgregar}>Agregar Categoría</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de categorías */}
        <View style={[styles.seccion, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>Tus Categorías</Text>

          {categorias.map(cat => (
            <View
              key={cat.id}
              style={[
                styles.categoriaItem,
                {
                  backgroundColor: tema.colores.fondo,
                  borderColor: cat.color,
                },
              ]}
            >
              <View style={styles.categoriaInfo}>
                <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                  {cat.nombre}
                </Text>
                {!cat.esPersonalizada && (
                  <Text style={[styles.badgePredeterminada, { color: tema.colores.textoSecundario }]}>
                    (Predeterminada)
                  </Text>
                )}
              </View>
              {cat.esPersonalizada && (
                <TouchableOpacity
                  onPress={() => handleEliminar(cat.id, cat.nombre, cat.esPersonalizada)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.botonEliminar, { color: tema.colores.textoSecundario }]}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  botonVolver: {
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  seccion: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    fontSize: 16,
  },
  emojiScroll: {
    maxHeight: 60,
  },
  emojiBoton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emoji: {
    fontSize: 24,
  },
  colorScroll: {
    maxHeight: 50,
  },
  colorBoton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  botonAgregar: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBotonAgregar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoriaEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  categoriaNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  badgePredeterminada: {
    fontSize: 12,
    marginLeft: 8,
  },
  botonEliminar: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
