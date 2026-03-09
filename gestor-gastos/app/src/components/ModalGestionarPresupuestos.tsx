import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useMonedas } from '../context/MonedasContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PERIODOS = [
  { id: 'semanal', nombre: 'Semanal', emoji: '📅' },
  { id: 'mensual', nombre: 'Mensual', emoji: '🗓️' },
  { id: 'anual', nombre: 'Anual', emoji: '📆' },
] as const;

export const ModalGestionarPresupuestos = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { presupuestos, agregarPresupuesto, editarPresupuesto, eliminarPresupuesto, obtenerEstadisticasPresupuesto } = usePresupuestos();
  const { monedas, monedaBase } = useMonedas();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [monto, setMonto] = useState('');
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');
  const [alertaEn, setAlertaEn] = useState('80');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(monedaBase?.codigo || '');

  const obtenerSimboloMoneda = (monedaCodigo: string): string => {
    const moneda = monedas.find(m => m.codigo === monedaCodigo);
    return moneda?.simbolo || monedaBase?.simbolo || '$';
  };

  const resetFormulario = () => {
    setCategoriaSeleccionada('');
    setMonto('');
    setPeriodo('mensual');
    setAlertaEn('80');
    setEditandoId(null);
    setMonedaSeleccionada(monedaBase?.codigo || '');
  };

  const handleEditar = (presupuesto: typeof presupuestos[0]) => {
    setEditandoId(presupuesto.id);
    setCategoriaSeleccionada(presupuesto.categoriaId);
    setMonto(presupuesto.monto.toString());
    setPeriodo(presupuesto.periodo);
    setAlertaEn(presupuesto.alertaEn.toString());
    setMonedaSeleccionada(presupuesto.monedaId || monedaBase?.codigo || '');
  };

  const handleAgregar = () => {
    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const alertaNum = parseFloat(alertaEn);
    if (isNaN(alertaNum) || alertaNum < 0 || alertaNum > 100) {
      Alert.alert('Error', 'El porcentaje de alerta debe estar entre 0 y 100');
      return;
    }

    // Si estamos editando, actualizar directamente
    if (editandoId) {
      editarPresupuesto(editandoId, {
        categoriaId: categoriaSeleccionada,
        monto: montoNum,
        periodo,
        alertaEn: alertaNum,
        monedaId: monedaSeleccionada,
      });
      resetFormulario();
      Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
      return;
    }

    // Verificar si ya existe un presupuesto para esta categoría
    const existente = presupuestos.find(
      p => p.categoriaId === categoriaSeleccionada && p.periodo === periodo
    );

    if (existente) {
      Alert.alert(
        'Actualizar presupuesto',
        '¿Deseas actualizar el presupuesto existente para esta categoría?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Actualizar',
            onPress: () => {
              editarPresupuesto(existente.id, {
                monto: montoNum,
                alertaEn: alertaNum,
              });
              resetFormulario();
              Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
            },
          },
        ]
      );
      return;
    }

    agregarPresupuesto({
      categoriaId: categoriaSeleccionada,
      monto: montoNum,
      periodo,
      alertaEn: alertaNum,
      monedaId: monedaSeleccionada,
    });

    resetFormulario();
    Alert.alert('Éxito', 'Presupuesto agregado correctamente');
  };

  const handleEliminar = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarPresupuesto(id);
            Alert.alert('Eliminado', 'Presupuesto eliminado correctamente');
          },
        },
      ]
    );
  };

  const obtenerNombreCategoria = (id: string) => {
    const categoria = categorias.find(c => c.id === id);
    return categoria ? `${categoria.emoji} ${categoria.nombre}` : 'Categoría';
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
              💰 Gestionar Presupuestos
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Resumen de estado de presupuestos */}
          {presupuestos.length > 0 && (() => {
            const stats = presupuestos.map(p => obtenerEstadisticasPresupuesto(p.categoriaId, p.periodo));
            const excedidos = stats.filter(s => s?.excedido).length;
            const enAlerta = stats.filter(s => s?.debeAlertar).length;
            const ok = presupuestos.length - excedidos - enAlerta;

            return (
              <View style={styles.resumenEstado}>
                <View style={[styles.estadoItem, { backgroundColor: '#10b98120' }]}>
                  <Text style={[styles.estadoNumero, { color: '#10b981' }]}>{ok}</Text>
                  <Text style={[styles.estadoLabel, { color: '#10b981' }]}>OK</Text>
                </View>
                <View style={[styles.estadoItem, { backgroundColor: '#f59e0b20' }]}>
                  <Text style={[styles.estadoNumero, { color: '#f59e0b' }]}>{enAlerta}</Text>
                  <Text style={[styles.estadoLabel, { color: '#f59e0b' }]}>Alerta</Text>
                </View>
                <View style={[styles.estadoItem, { backgroundColor: '#ef444420' }]}>
                  <Text style={[styles.estadoNumero, { color: '#ef4444' }]}>{excedidos}</Text>
                  <Text style={[styles.estadoLabel, { color: '#ef4444' }]}>Excedido</Text>
                </View>
              </View>
            );
          })()}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulario para agregar/editar presupuesto */}
            <View style={[styles.seccion, { borderColor: editandoId ? tema.colores.primario : tema.colores.bordes }]}>
              <View style={styles.subtituloContainer}>
                <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                  {editandoId ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'}
                </Text>
                {editandoId && (
                  <TouchableOpacity onPress={resetFormulario}>
                    <Text style={[styles.cancelarEdicion, { color: tema.colores.textoSecundario }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Selector de categoría */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Categoría:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoriaSeleccionada(cat.id)}
                    style={[
                      styles.categoriaChip,
                      {
                        backgroundColor: categoriaSeleccionada === cat.id
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: cat.color,
                      }
                    ]}
                  >
                    <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                    <Text style={[
                      styles.categoriaNombre,
                      { color: categoriaSeleccionada === cat.id ? '#fff' : tema.colores.texto }
                    ]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selector de período */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Período:</Text>
              <View style={styles.periodosContainer}>
                {PERIODOS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPeriodo(p.id)}
                    style={[
                      styles.periodoBoton,
                      {
                        backgroundColor: periodo === p.id
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }
                    ]}
                  >
                    <Text style={styles.periodoEmoji}>{p.emoji}</Text>
                    <Text style={[
                      styles.periodoTexto,
                      { color: periodo === p.id ? '#fff' : tema.colores.texto }
                    ]}>
                      {p.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector de moneda */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monedasScroll}>
                {monedas.map(moneda => (
                  <TouchableOpacity
                    key={moneda.codigo}
                    onPress={() => setMonedaSeleccionada(moneda.codigo)}
                    style={[
                      styles.monedaChip,
                      {
                        backgroundColor: monedaSeleccionada === moneda.codigo
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.monedaTexto,
                      { color: monedaSeleccionada === moneda.codigo ? '#fff' : tema.colores.texto }
                    ]}>
                      {moneda.simbolo} {moneda.codigo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Monto */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Monto del presupuesto:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
              />

              {/* Porcentaje de alerta */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>
                Alertar al alcanzar (%):</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="80"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                value={alertaEn}
                onChangeText={setAlertaEn}
              />
              <Text style={[styles.hint, { color: tema.colores.textoSecundario }]}>
                Te avisaremos cuando alcances este porcentaje del presupuesto
              </Text>

              {/* Botón agregar/actualizar */}
              <TouchableOpacity
                onPress={handleAgregar}
                style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
              >
                <Text style={styles.botonTexto}>
                  {editandoId ? '✓ Guardar Cambios' : '➕ Agregar Presupuesto'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de presupuestos existentes */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📋 Presupuestos Actuales
              </Text>

              {presupuestos.length === 0 ? (
                <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
                  No tienes presupuestos configurados
                </Text>
              ) : (
                // Ordenar por criticidad: excedidos > en alerta > OK
                [...presupuestos]
                  .map(p => ({
                    ...p,
                    stats: obtenerEstadisticasPresupuesto(p.categoriaId, p.periodo),
                  }))
                  .sort((a, b) => {
                    const prioridadA = a.stats?.excedido ? 2 : a.stats?.debeAlertar ? 1 : 0;
                    const prioridadB = b.stats?.excedido ? 2 : b.stats?.debeAlertar ? 1 : 0;
                    return prioridadB - prioridadA;
                  })
                  .map(p => {
                    const stats = p.stats;
                    const porcentaje = stats ? Math.min(stats.porcentaje, 100) : 0;
                    const colorEstado = stats?.excedido ? '#ef4444' : stats?.debeAlertar ? '#f59e0b' : '#10b981';

                    return (
                      <View
                        key={p.id}
                        style={[styles.presupuestoItem, {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: colorEstado,
                          borderLeftWidth: 4,
                        }]}
                      >
                        <View style={styles.presupuestoInfo}>
                          <View style={styles.presupuestoHeader}>
                            <Text style={[styles.presupuestoCategoria, { color: tema.colores.texto }]}>
                              {obtenerNombreCategoria(p.categoriaId)}
                            </Text>
                            {stats && (
                              <Text style={[styles.porcentajeBadge, { color: colorEstado }]}>
                                {Math.round(porcentaje)}%
                              </Text>
                            )}
                          </View>

                          {/* Barra de progreso mini */}
                          {stats && (
                            <View style={styles.miniBarraContainer}>
                              <View
                                style={[styles.miniBarraProgreso, {
                                  width: `${porcentaje}%`,
                                  backgroundColor: colorEstado,
                                }]}
                              />
                            </View>
                          )}

                          <View style={styles.presupuestoDetalles}>
                            <Text style={[styles.presupuestoDetalle, { color: tema.colores.textoSecundario }]}>
                              {PERIODOS.find(per => per.id === p.periodo)?.nombre}
                            </Text>
                            <Text style={[styles.presupuestoMonto, { color: tema.colores.texto }]}>
                              {stats ? `${obtenerSimboloMoneda(p.monedaId)}${stats.gastado.toFixed(0)}` : '—'} / {obtenerSimboloMoneda(p.monedaId)}{p.monto.toFixed(0)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.botonesAccion}>
                          <TouchableOpacity
                            onPress={() => handleEditar(p)}
                            style={styles.botonAccion}
                          >
                            <Text style={styles.botonAccionTexto}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleEliminar(p.id)}
                            style={styles.botonAccion}
                          >
                            <Text style={styles.botonAccionTexto}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
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
  resumenEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  estadoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  estadoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  estadoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  seccion: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  subtituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelarEdicion: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  categoriasScroll: {
    marginBottom: 10,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  monedasScroll: {
    marginBottom: 10,
  },
  monedaChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  monedaTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriaEmoji: {
    fontSize: 20,
    marginRight: 5,
  },
  categoriaNombre: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  periodoBoton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  periodoEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  periodoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  botonAgregar: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  presupuestoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
  },
  presupuestoInfo: {
    flex: 1,
  },
  presupuestoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  presupuestoCategoria: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  porcentajeBadge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniBarraContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  miniBarraProgreso: {
    height: '100%',
    borderRadius: 2,
  },
  presupuestoDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presupuestoMonto: {
    fontSize: 13,
    fontWeight: '600',
  },
  presupuestoDetalle: {
    fontSize: 12,
  },
  botonesAccion: {
    flexDirection: 'row',
    gap: 5,
  },
  botonAccion: {
    padding: 8,
  },
  botonAccionTexto: {
    fontSize: 22,
  },
  botonEliminar: {
    padding: 10,
  },
  botonEliminarTexto: {
    fontSize: 24,
  },
});
