import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useMetas } from '../context/MetasContext';
import { useBalance } from '../context/BalanceContext';
import { formatearTiempoRestante, formatearAhorroRequerido } from '../utils/date';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ICONOS_DISPONIBLES = ['🎯', '🏖️', '🚗', '🏠', '💍', '🎓', '💻', '🎮', '📱', '✈️'];
const COLORES_DISPONIBLES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ModalGestionarMetas = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { metas, agregarMeta, eliminarMeta, aportarAMeta, retirarDeMeta, obtenerEstadisticasMeta } = useMetas();
  const { balance } = useBalance();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [duracionMeta, setDuracionMeta] = useState('1');
  const [unidadTiempo, setUnidadTiempo] = useState<'dias' | 'meses' | 'anos'>('meses');
  const [iconoSeleccionado, setIconoSeleccionado] = useState(ICONOS_DISPONIBLES[0]);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);

  // Estados para aportar/retirar
  const [modalAportarVisible, setModalAportarVisible] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState<string | null>(null);
  const [montoAportar, setMontoAportar] = useState('');
  const [esRetiro, setEsRetiro] = useState(false);

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setMontoObjetivo('');
    setDuracionMeta('1');
    setUnidadTiempo('meses');
    setIconoSeleccionado(ICONOS_DISPONIBLES[0]);
    setColorSeleccionado(COLORES_DISPONIBLES[0]);
  };

  const handleAgregar = () => {
    if (!nombre.trim() || !montoObjetivo) {
      Alert.alert('Error', 'Completa nombre y monto objetivo');
      return;
    }

    const monto = parseFloat(montoObjetivo);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Monto inválido');
      return;
    }

    const duracion = parseInt(duracionMeta);
    if (isNaN(duracion) || duracion <= 0) {
      Alert.alert('Error', 'Duración inválida');
      return;
    }

    // Calcular fecha límite según la unidad de tiempo
    const ahora = new Date();
    const fechaLimite = new Date();

    switch (unidadTiempo) {
      case 'dias':
        fechaLimite.setDate(ahora.getDate() + duracion);
        break;
      case 'meses':
        fechaLimite.setMonth(ahora.getMonth() + duracion);
        break;
      case 'anos':
        fechaLimite.setFullYear(ahora.getFullYear() + duracion);
        break;
    }

    agregarMeta({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      montoObjetivo: monto,
      fechaInicio: ahora.toISOString(),
      fechaLimite: fechaLimite.toISOString(),
      icono: iconoSeleccionado,
      color: colorSeleccionado,
    });

    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleAportar = (metaId: string) => {
    setMetaSeleccionada(metaId);
    setEsRetiro(false);
    setMontoAportar('');
    setModalAportarVisible(true);
  };

  const handleRetirar = (metaId: string) => {
    setMetaSeleccionada(metaId);
    setEsRetiro(true);
    setMontoAportar('');
    setModalAportarVisible(true);
  };

  const confirmarAporte = async () => {
    if (!metaSeleccionada) return;

    const monto = parseFloat(montoAportar);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Monto inválido');
      return;
    }

    if (!esRetiro && monto > balance.balanceDisponible) {
      Alert.alert(
        'Balance insuficiente',
        `No tienes suficiente balance disponible.\n\nDisponible: $${balance.balanceDisponible.toFixed(2)}\nRequerido: $${monto.toFixed(2)}`
      );
      return;
    }

    const resultado = esRetiro
      ? await retirarDeMeta(metaSeleccionada, monto)
      : await aportarAMeta(metaSeleccionada, monto);

    if (!resultado.exito && resultado.mensaje) {
      Alert.alert('Error', resultado.mensaje);
    } else {
      setModalAportarVisible(false);
      setMontoAportar('');
      setMetaSeleccionada(null);
    }
  };

  const handleEliminar = (metaId: string, nombre: string) => {
    Alert.alert(
      'Eliminar meta',
      `¿Seguro de eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarMeta(metaId),
        },
      ]
    );
  };

  return (
    <>
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
                🎯 Metas de Ahorro
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {!mostrarFormulario ? (
              <>
                {/* Lista de metas */}
                {metas.length > 0 ? (
                  <View style={styles.lista}>
                    {metas.map(meta => {
                      const stats = obtenerEstadisticasMeta(meta.id);
                      if (!stats) return null;

                      return (
                        <View
                          key={meta.id}
                          style={[styles.metaItem, {
                            backgroundColor: tema.colores.fondoSecundario,
                            borderColor: meta.color,
                          }]}
                        >
                          <View style={styles.metaHeader}>
                            <Text style={styles.metaIcono}>{meta.icono}</Text>
                            <View style={styles.metaInfo}>
                              <Text style={[styles.metaNombre, { color: tema.colores.texto }]}>
                                {meta.nombre}
                              </Text>
                              {meta.descripcion ? (
                                <Text style={[styles.metaDesc, { color: tema.colores.textoSecundario }]}>
                                  {meta.descripcion}
                                </Text>
                              ) : null}
                            </View>
                          </View>

                          {/* Barra de progreso */}
                          <View style={styles.barraContainer}>
                            <View
                              style={[styles.barraProgreso, {
                                width: `${Math.min(stats.porcentajeCompletado, 100)}%`,
                                backgroundColor: meta.color,
                              }]}
                            />
                          </View>

                          <View style={styles.metaStats}>
                            <Text style={[styles.statsTexto, { color: tema.colores.texto }]}>
                              ${meta.montoActual.toFixed(2)} / ${meta.montoObjetivo.toFixed(2)}
                            </Text>
                            <Text style={[styles.porcentaje, { color: meta.color }]}>
                              {Math.round(stats.porcentajeCompletado)}%
                            </Text>
                          </View>

                          {meta.estado === 'en_progreso' && (
                            <Text style={[styles.diasRestantes, { color: tema.colores.textoSecundario }]}>
                              {formatearTiempoRestante(stats.diasRestantes)} restantes • Ahorra {formatearAhorroRequerido(stats.diasRestantes, stats.ahorroRequeridoDiario, stats.ahorroRequeridoMensual)}
                            </Text>
                          )}

                          {meta.estado === 'completada' && (
                            <Text style={[styles.estadoBadge, { color: '#10b981' }]}>
                              ✓ Completada
                            </Text>
                          )}

                          {meta.estado === 'vencida' && (
                            <Text style={[styles.estadoBadge, { color: '#ef4444' }]}>
                              ⚠ Vencida
                            </Text>
                          )}

                          <View style={styles.metaAcciones}>
                            {meta.estado === 'en_progreso' && (
                              <>
                                <TouchableOpacity
                                  style={[styles.botonAportar, { backgroundColor: meta.color }]}
                                  onPress={() => handleAportar(meta.id)}
                                >
                                  <Text style={styles.botonTexto}>💰 Aportar</Text>
                                </TouchableOpacity>
                                {meta.montoActual > 0 && (
                                  <TouchableOpacity
                                    style={[styles.botonRetirar, {
                                      backgroundColor: tema.colores.fondoSecundario,
                                      borderColor: meta.color,
                                    }]}
                                    onPress={() => handleRetirar(meta.id)}
                                  >
                                    <Text style={[styles.botonTextoRetirar, { color: meta.color }]}>
                                      ↩️ Retirar
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            )}
                            <TouchableOpacity
                              style={[styles.botonEliminar, {
                                backgroundColor: tema.colores.fondoSecundario,
                                borderColor: tema.colores.bordes,
                              }]}
                              onPress={() => handleEliminar(meta.id, meta.nombre)}
                            >
                              <Text style={[styles.botonTextoEliminar, { color: tema.colores.texto }]}>
                                🗑️
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.vacio}>
                    <Text style={[styles.vacioTexto, { color: tema.colores.textoSecundario }]}>
                      No tienes metas de ahorro.{'\n'}¡Crea tu primera meta!
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
                  onPress={() => setMostrarFormulario(true)}
                >
                  <Text style={styles.botonAgregarTexto}>+ Nueva Meta</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Formulario */}
                <View style={styles.formulario}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Nombre de la meta</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="Ej: Vacaciones en la playa"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={nombre}
                    onChangeText={setNombre}
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="Detalles de tu meta..."
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={descripcion}
                    onChangeText={setDescripcion}
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Monto objetivo ($)</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="5000"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={montoObjetivo}
                    onChangeText={setMontoObjetivo}
                    keyboardType="numeric"
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Tiempo para lograrlo</Text>

                  <View style={styles.tiempoContainer}>
                    <TextInput
                      style={[styles.inputTiempo, {
                        backgroundColor: tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                        color: tema.colores.texto,
                      }]}
                      placeholder="1"
                      placeholderTextColor={tema.colores.textoSecundario}
                      value={duracionMeta}
                      onChangeText={setDuracionMeta}
                      keyboardType="numeric"
                    />

                    <View style={styles.unidadesContainer}>
                      <TouchableOpacity
                        style={[styles.unidadBoton, {
                          backgroundColor: unidadTiempo === 'dias' ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setUnidadTiempo('dias')}
                      >
                        <Text style={[styles.unidadTexto, {
                          color: unidadTiempo === 'dias' ? '#fff' : tema.colores.texto
                        }]}>
                          Días
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.unidadBoton, {
                          backgroundColor: unidadTiempo === 'meses' ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setUnidadTiempo('meses')}
                      >
                        <Text style={[styles.unidadTexto, {
                          color: unidadTiempo === 'meses' ? '#fff' : tema.colores.texto
                        }]}>
                          Meses
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.unidadBoton, {
                          backgroundColor: unidadTiempo === 'anos' ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setUnidadTiempo('anos')}
                      >
                        <Text style={[styles.unidadTexto, {
                          color: unidadTiempo === 'anos' ? '#fff' : tema.colores.texto
                        }]}>
                          Años
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Icono</Text>
                  <View style={styles.iconosContainer}>
                    {ICONOS_DISPONIBLES.map(icono => (
                      <TouchableOpacity
                        key={icono}
                        style={[styles.iconoBoton, {
                          backgroundColor: iconoSeleccionado === icono ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setIconoSeleccionado(icono)}
                      >
                        <Text style={styles.iconoTexto}>{icono}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Color</Text>
                  <View style={styles.coloresContainer}>
                    {COLORES_DISPONIBLES.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.colorBoton, {
                          backgroundColor: color,
                          borderWidth: colorSeleccionado === color ? 3 : 0,
                          borderColor: tema.colores.texto,
                        }]}
                        onPress={() => setColorSeleccionado(color)}
                      />
                    ))}
                  </View>

                  <View style={styles.botonesFormulario}>
                    <TouchableOpacity
                      style={[styles.botonCancelar, {
                        backgroundColor: tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }]}
                      onPress={() => {
                        limpiarFormulario();
                        setMostrarFormulario(false);
                      }}
                    >
                      <Text style={[styles.botonCancelarTexto, { color: tema.colores.texto }]}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botonGuardar, { backgroundColor: tema.colores.primario }]}
                      onPress={handleAgregar}
                    >
                      <Text style={styles.botonGuardarTexto}>Crear Meta</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>

    {/* Modal para Aportar/Retirar */}
    <Modal
      visible={modalAportarVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setModalAportarVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalAportar, { backgroundColor: tema.colores.fondo }]}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              {esRetiro ? '↩️ Retirar de Meta' : '💰 Aportar a Meta'}
            </Text>

          {!esRetiro && (
            <Text style={[styles.infoBalance, { color: tema.colores.textoSecundario }]}>
              Balance disponible: ${balance.balanceDisponible.toFixed(2)}
            </Text>
          )}

          {esRetiro && metaSeleccionada && (
            <Text style={[styles.infoBalance, { color: tema.colores.textoSecundario }]}>
              Aportado: ${metas.find(m => m.id === metaSeleccionada)?.montoActual.toFixed(2)}
            </Text>
          )}

          <TextInput
            style={[styles.input, {
              backgroundColor: tema.colores.fondoSecundario,
              color: tema.colores.texto,
              borderColor: tema.colores.bordes,
            }]}
            placeholder="Monto"
            placeholderTextColor={tema.colores.textoSecundario}
            keyboardType="numeric"
            value={montoAportar}
            onChangeText={setMontoAportar}
            autoFocus
          />

          <View style={styles.botonesAportar}>
            <TouchableOpacity
              style={[styles.botonCancelarAporte, {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: tema.colores.bordes,
              }]}
              onPress={() => setModalAportarVisible(false)}
            >
              <Text style={[styles.textoBotonCancelar, { color: tema.colores.texto }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonConfirmarAporte, {
                backgroundColor: tema.colores.primario,
              }]}
              onPress={confirmarAporte}
            >
              <Text style={styles.textoBotonConfirmar}>
                {esRetiro ? 'Retirar' : 'Aportar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  lista: {
    gap: 15,
    marginBottom: 15,
  },
  metaItem: {
    borderRadius: 15,
    borderWidth: 3,
    padding: 15,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaIcono: {
    fontSize: 32,
    marginRight: 12,
  },
  metaInfo: {
    flex: 1,
  },
  metaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metaDesc: {
    fontSize: 13,
  },
  barraContainer: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 6,
  },
  metaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  porcentaje: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  diasRestantes: {
    fontSize: 13,
    marginBottom: 12,
  },
  estadoBadge: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metaAcciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAportar: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  botonRetirar: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  botonTextoRetirar: {
    fontSize: 14,
    fontWeight: '600',
  },
  botonEliminar: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    width: 50,
    alignItems: 'center',
  },
  botonTextoEliminar: {
    fontSize: 18,
  },
  vacio: {
    padding: 60,
    alignItems: 'center',
  },
  vacioTexto: {
    fontSize: 16,
    textAlign: 'center',
  },
  botonAgregar: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formulario: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  tiempoContainer: {
    gap: 10,
  },
  inputTiempo: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  unidadesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unidadBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  unidadTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconoBoton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoTexto: {
    fontSize: 24,
  },
  coloresContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  colorBoton: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonCancelar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalAportar: {
    borderRadius: 20,
    padding: 25,
    margin: 20,
    gap: 15,
  },
  infoBalance: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  botonesAportar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  botonCancelarAporte: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonConfirmarAporte: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonConfirmar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
});
