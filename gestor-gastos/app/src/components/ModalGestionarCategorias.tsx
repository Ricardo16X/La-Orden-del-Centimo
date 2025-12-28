import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

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

export const ModalGestionarCategorias = ({ visible, onClose }: Props) => {
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

    // Reset form
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              📂 Gestionar Categorías
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulario para agregar nueva categoría */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                ➕ Nueva Categoría
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Nombre:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
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
                {EMOJIS_COMUNES.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiBoton,
                      {
                        backgroundColor: emojiSeleccionado === emoji
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      },
                    ]}
                    onPress={() => setEmojiSeleccionado(emoji)}
                  >
                    <Text style={styles.emojiTexto}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Color:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {COLORES_DISPONIBLES.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorBoton,
                      { backgroundColor: color },
                      colorSeleccionado === color && styles.colorSeleccionado,
                    ]}
                    onPress={() => setColorSeleccionado(color)}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
                onPress={handleAgregar}
              >
                <Text style={styles.textoBoton}>➕ Agregar Categoría</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de categorías existentes */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📋 Mis Categorías
              </Text>

              {categorias.map(cat => (
                <View
                  key={cat.id}
                  style={[styles.categoriaItem, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: cat.color,
                  }]}
                >
                  <View style={styles.categoriaInfo}>
                    <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                    <View>
                      <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                        {cat.nombre}
                      </Text>
                      <Text style={[styles.categoriaTipo, { color: tema.colores.textoSecundario }]}>
                        {cat.esPersonalizada ? 'Personalizada' : 'Predeterminada'}
                      </Text>
                    </View>
                  </View>
                  {cat.esPersonalizada && (
                    <TouchableOpacity
                      onPress={() => handleEliminar(cat.id, cat.nombre, cat.esPersonalizada)}
                      style={styles.botonEliminar}
                    >
                      <Text style={styles.textoEliminar}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  seccion: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
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
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  emojiScroll: {
    marginBottom: 10,
  },
  emojiBoton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emojiTexto: {
    fontSize: 28,
  },
  colorScroll: {
    marginBottom: 15,
  },
  colorBoton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSeleccionado: {
    borderColor: '#000',
  },
  botonAgregar: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoriaEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  categoriaNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriaTipo: {
    fontSize: 12,
    marginTop: 2,
  },
  botonEliminar: {
    padding: 8,
  },
  textoEliminar: {
    fontSize: 24,
  },
});
