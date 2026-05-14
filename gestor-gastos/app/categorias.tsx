import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useCategorias } from './src/context/CategoriasContext';
import { useToast } from './src/context/ToastContext';
import { BotonAnimado } from './src/components/BotonAnimado';
import { EstadoVacio } from './src/components/EstadoVacio';
import { MenuContextual } from './src/components/MenuContextual';
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
type TabCategoria = 'gastos' | 'ingresos';

export default function CategoriasScreen() {
  const { tema } = useTema();
  const { categorias, agregarCategoria, editarCategoria, eliminarCategoria } = useCategorias();
  const { showToast } = useToast();

  const [tabActivo, setTabActivo] = useState<TabCategoria>('gastos');
  const [modo, setModo] = useState<ModoFormulario>('cerrado');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('#ff6b6b');
  const [tipoEdicion, setTipoEdicion] = useState<'gasto' | 'ingreso'>('gasto');

  const tipoBuscado = tabActivo === 'gastos' ? 'gasto' : 'ingreso';
  const predeterminadas = categorias.filter(c => !c.esPersonalizada && (c.tipo === tipoBuscado || c.tipo === 'ambos'));
  const personalizadas = categorias.filter(c => c.esPersonalizada && (c.tipo === tipoBuscado || c.tipo === 'ambos'));

  const resetFormulario = () => {
    setNombre('');
    setEmoji('🎯');
    setColor('#ff6b6b');
    setTipoEdicion(tipoBuscado as 'gasto' | 'ingreso');
    setEditandoId(null);
  };

  const abrirCrear = () => {
    resetFormulario();
    setModo('crear');
  };

  const abrirEditar = (cat: Categoria) => {
    setNombre(cat.nombre);
    setEmoji(cat.emoji);
    setColor(cat.color);
    setTipoEdicion(cat.tipo === 'ambos' ? 'gasto' : cat.tipo);
    setEditandoId(cat.id);
    setModo('editar');
  };

  const cerrar = () => {
    resetFormulario();
    setModo('cerrado');
  };

  const cambiarTab = (tab: TabCategoria) => {
    setTabActivo(tab);
    cerrar();
  };

  const handleGuardar = () => {
    if (!nombre.trim()) {
      showToast('Ingresa un nombre para la categoría', 'error');
      return;
    }
    if (modo === 'editar' && editandoId) {
      editarCategoria(editandoId, { nombre: nombre.trim(), emoji, color, tipo: tipoEdicion });
      showToast('Categoría actualizada');
    } else {
      agregarCategoria({ nombre: nombre.trim(), emoji, color, tipo: tipoEdicion });
      showToast('Categoría creada');
    }
    cerrar();
  };

  const handleEliminar = (cat: Categoria) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${cat.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => { eliminarCategoria(cat.id); showToast('Categoría eliminada'); } },
      ]
    );
  };

  const c = tema.colores;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Tabs Gastos / Ingresos */}
        <View style={[styles.tabsRow, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
          {(['gastos', 'ingresos'] as TabCategoria[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, tabActivo === tab && { backgroundColor: c.primario }]}
              onPress={() => cambiarTab(tab)}
            >
              <Text style={[styles.tabTexto, { color: tabActivo === tab ? '#fff' : c.textoSecundario }]}>
                {tab === 'gastos' ? '📤 Gastos' : '📥 Ingresos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Formulario crear / editar */}
        {modo !== 'cerrado' && (
          <View style={[styles.formulario, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.formularioHeader}>
              <Text style={[styles.formularioTitulo, { color: c.primario }]}>
                {modo === 'editar' ? '✏️ Editar categoría' : `✨ Nueva categoría de ${tabActivo}`}
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

            <Text style={[styles.label, { color: c.texto }]}>Tipo</Text>
            <View style={[styles.tipoRow, { backgroundColor: c.fondo, borderColor: c.bordes }]}>
              {(['gasto', 'ingreso'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoBoton, tipoEdicion === t && { backgroundColor: c.primario }]}
                  onPress={() => setTipoEdicion(t)}
                >
                  <Text style={[styles.tipoTexto, { color: tipoEdicion === t ? '#fff' : c.textoSecundario }]}>
                    {t === 'gasto' ? '📤 Gasto' : '📥 Ingreso'}
                  </Text>
                </TouchableOpacity>
              ))}
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
              {cat.tipo === 'ambos' && (
                <View style={[styles.badge, { backgroundColor: c.primario + '22' }]}>
                  <Text style={[styles.badgeTexto, { color: c.primario }]}>Ambos</Text>
                </View>
              )}
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
            subtitulo={`Toca "+" para crear una categoría de ${tabActivo}`}
          />
        ) : (
          <View style={[styles.lista, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            {personalizadas.map((cat, i) => {
              const esUltimo = i === personalizadas.length - 1;
              return (
                <View key={cat.id}>
                  <View
                    style={[
                      styles.item,
                      { borderBottomColor: c.bordes },
                      esUltimo && styles.itemUltimo,
                    ]}
                  >
                    <View style={[styles.itemAccent, { backgroundColor: cat.color }]} />
                    <Text style={styles.itemEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.itemNombre, { color: c.texto }]}>{cat.nombre}</Text>
                    <MenuContextual
                      opciones={[
                        { emoji: '✏️', label: 'Editar', onPress: () => abrirEditar(cat) },
                        { emoji: '🗑️', label: 'Eliminar', destructivo: true, onPress: () => handleEliminar(cat) },
                      ]}
                    />
                  </View>

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

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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
  tipoRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  tipoBoton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tipoTexto: {
    fontSize: 13,
    fontWeight: '700',
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
