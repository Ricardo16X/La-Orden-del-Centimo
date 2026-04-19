import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useCategorias } from './src/context/CategoriasContext';
import { useToast } from './src/context/ToastContext';
import { BotonAnimado } from './src/components/BotonAnimado';
import { EstadoVacio } from './src/components/EstadoVacio';
import { Categoria } from './src/types';

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

type ModoFormulario = 'cerrado' | 'crear' | 'editar';

export default function CategoriasScreen() {
  const { tema } = useTema();
  const { categorias, agregarCategoria, editarCategoria, eliminarCategoria } = useCategorias();
  const { showToast } = useToast();

  const [modo, setModo] = useState<ModoFormulario>('cerrado');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('#ff6b6b');

  const predeterminadas = categorias.filter(c => !c.esPersonalizada);
  const personalizadas = categorias.filter(c => c.esPersonalizada);

  const resetFormulario = () => {
    setNombre('');
    setEmoji('🎯');
    setColor('#ff6b6b');
    setEditandoId(null);
  };

  const abrirCrear = () => {
    resetFormulario();
    setConfirmandoId(null);
    setModo('crear');
  };

  const abrirEditar = (cat: Categoria) => {
    setNombre(cat.nombre);
    setEmoji(cat.emoji);
    setColor(cat.color);
    setEditandoId(cat.id);
    setConfirmandoId(null);
    setModo('editar');
  };

  const cerrar = () => {
    resetFormulario();
    setModo('cerrado');
  };

  const handleGuardar = () => {
    if (!nombre.trim()) {
      showToast('Ingresa un nombre para la categoría', 'error');
      return;
    }
    if (modo === 'editar' && editandoId) {
      editarCategoria(editandoId, { nombre: nombre.trim(), emoji, color });
      showToast('Categoría actualizada');
    } else {
      agregarCategoria({ nombre: nombre.trim(), emoji, color });
      showToast('Categoría creada');
    }
    cerrar();
  };

  const handleEliminar = (id: string) => {
    eliminarCategoria(id);
    setConfirmandoId(null);
    showToast('Categoría eliminada');
  };

  const c = tema.colores;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Formulario crear / editar */}
        {modo !== 'cerrado' && (
          <View style={[styles.formulario, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.formularioHeader}>
              <Text style={[styles.formularioTitulo, { color: c.primario }]}>
                {modo === 'editar' ? '✏️ Editar categoría' : '✨ Nueva categoría'}
              </Text>
              <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.cerrar, { color: c.textoSecundario }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview en tiempo real */}
            <View style={[styles.preview, { backgroundColor: c.fondo, borderLeftColor: color }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <Text style={[styles.previewNombre, { color: nombre.trim() ? c.texto : c.textoSecundario }]}>
                {nombre.trim() || 'Nombre de la categoría'}
              </Text>
              <View style={[styles.previewDot, { backgroundColor: color }]} />
            </View>

            <Text style={[styles.label, { color: c.texto }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.fondo, borderColor: c.bordes, color: c.texto }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Gimnasio"
              placeholderTextColor={c.textoSecundario}
              maxLength={20}
              autoFocus={modo === 'crear'}
            />

            <Text style={[styles.label, { color: c.texto }]}>Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
              {EMOJIS_COMUNES.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiBoton,
                    {
                      backgroundColor: emoji === e ? c.primario : c.fondo,
                      borderColor: emoji === e ? c.primario : c.bordes,
                    },
                  ]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiTexto}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: c.texto }]}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
              {COLORES_DISPONIBLES.map(col => (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.colorBoton,
                    {
                      backgroundColor: col,
                      borderColor: color === col ? c.texto : 'transparent',
                      borderWidth: color === col ? 3 : 2,
                    },
                  ]}
                  onPress={() => setColor(col)}
                >
                  {color === col && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.botonesFormulario}>
              <TouchableOpacity
                style={[styles.botonSecundario, { borderColor: c.bordes }]}
                onPress={cerrar}
              >
                <Text style={[styles.botonSecundarioTexto, { color: c.textoSecundario }]}>Cancelar</Text>
              </TouchableOpacity>
              <BotonAnimado
                style={[styles.botonPrimario, { backgroundColor: c.primario }]}
                onPress={handleGuardar}
              >
                <Text style={styles.botonPrimarioTexto}>
                  {modo === 'editar' ? '✓ Guardar' : '✓ Crear'}
                </Text>
              </BotonAnimado>
            </View>
          </View>
        )}

        {/* Sección predeterminadas */}
        <View style={styles.seccionHeader}>
          <Text style={[styles.seccionLabel, { color: c.textoSecundario }]}>PREDETERMINADAS</Text>
          <Text style={[styles.seccionConteo, { color: c.textoSecundario }]}>{predeterminadas.length}</Text>
        </View>
        <View style={[styles.lista, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
          {predeterminadas.map((cat, i) => (
            <View
              key={cat.id}
              style={[
                styles.item,
                { borderBottomColor: c.bordes },
                i === predeterminadas.length - 1 && styles.itemUltimo,
              ]}
            >
              <View style={[styles.itemAccent, { backgroundColor: cat.color }]} />
              <Text style={styles.itemEmoji}>{cat.emoji}</Text>
              <Text style={[styles.itemNombre, { color: c.texto }]}>{cat.nombre}</Text>
              <View style={[styles.badge, { backgroundColor: c.fondo }]}>
                <Text style={[styles.badgeTexto, { color: c.textoSecundario }]}>Sistema</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sección personalizadas */}
        <View style={[styles.seccionHeader, { marginTop: 24 }]}>
          <Text style={[styles.seccionLabel, { color: c.textoSecundario }]}>MIS CATEGORÍAS</Text>
          <Text style={[styles.seccionConteo, { color: c.textoSecundario }]}>{personalizadas.length}</Text>
        </View>

        {personalizadas.length === 0 ? (
          <EstadoVacio
            emoji="🏷️"
            titulo="Sin categorías personalizadas"
            subtitulo='Toca el botón "+" para crear tu primera categoría'
          />
        ) : (
          <View style={[styles.lista, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            {personalizadas.map((cat, i) => {
              const esUltimo = i === personalizadas.length - 1;
              const confirmando = confirmandoId === cat.id;
              return (
                <View key={cat.id}>
                  <View
                    style={[
                      styles.item,
                      { borderBottomColor: c.bordes },
                      (esUltimo && !confirmando) && styles.itemUltimo,
                    ]}
                  >
                    <View style={[styles.itemAccent, { backgroundColor: cat.color }]} />
                    <Text style={styles.itemEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.itemNombre, { color: c.texto }]}>{cat.nombre}</Text>
                    <View style={styles.acciones}>
                      <TouchableOpacity
                        onPress={() => abrirEditar(cat)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.accionBoton}
                      >
                        <Text style={[styles.accionIcono, { color: c.primario }]}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setConfirmandoId(confirmando ? null : cat.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.accionBoton}
                      >
                        <Text style={styles.accionIcono}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirmación inline de eliminación */}
                  {confirmando && (
                    <View
                      style={[
                        styles.confirmacion,
                        { borderTopColor: c.bordes },
                        esUltimo && styles.itemUltimo,
                      ]}
                    >
                      <Text style={[styles.confirmacionTexto, { color: c.texto }]}>
                        ¿Eliminar "{cat.nombre}"?
                      </Text>
                      <View style={styles.confirmacionBotones}>
                        <TouchableOpacity
                          onPress={() => setConfirmandoId(null)}
                          style={[styles.confirmacionBoton, { borderColor: c.bordes }]}
                        >
                          <Text style={[styles.confirmacionCancelarTexto, { color: c.textoSecundario }]}>
                            Cancelar
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEliminar(cat.id)}
                          style={styles.confirmacionBotonEliminar}
                        >
                          <Text style={styles.confirmacionEliminarTexto}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.espacioInferior} />
      </ScrollView>

      {/* FAB */}
      {modo === 'cerrado' && (
        <BotonAnimado
          style={[styles.fab, { backgroundColor: c.primario }]}
          onPress={abrirCrear}
        >
          <Text style={styles.fabTexto}>+</Text>
        </BotonAnimado>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // Formulario
  formulario: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 24,
  },
  formularioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formularioTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 5,
    marginBottom: 4,
    gap: 12,
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewNombre: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    fontSize: 16,
  },
  picker: {
    maxHeight: 56,
  },
  emojiBoton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emojiTexto: {
    fontSize: 26,
  },
  colorBoton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheck: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonSecundario: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  botonSecundarioTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonPrimario: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Secciones
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  seccionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  seccionConteo: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Lista
  lista: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  itemUltimo: {
    borderBottomWidth: 0,
  },
  itemAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '600',
  },
  acciones: {
    flexDirection: 'row',
    gap: 4,
  },
  accionBoton: {
    padding: 6,
  },
  accionIcono: {
    fontSize: 18,
  },

  // Confirmación inline
  confirmacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    backgroundColor: '#ef444412',
  },
  confirmacionTexto: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  confirmacionBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmacionBoton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmacionCancelarTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmacionBotonEliminar: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  confirmacionEliminarTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabTexto: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
  espacioInferior: {
    height: 100,
  },
});
