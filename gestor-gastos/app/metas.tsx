import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useMetas } from './src/context/MetasContext';
import { useBalance } from './src/context/BalanceContext';
import { formatearTiempoRestante, formatearAhorroRequerido } from './src/utils/date';
import { useMonedas } from './src/context/MonedasContext';

const ICONOS_DISPONIBLES = ['🎯', '🏖️', '🚗', '🏠', '💍', '🎓', '💻', '🎮', '📱', '✈️'];
const COLORES_DISPONIBLES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function MetasScreen() {
  const { tema } = useTema();
  const { showToast } = useToast();
  const { metas, agregarMeta, eliminarMeta, aportarAMeta, retirarDeMeta, obtenerEstadisticasMeta } = useMetas();
  const { balance } = useBalance();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [duracionMeta, setDuracionMeta] = useState('1');
  const [unidadTiempo, setUnidadTiempo] = useState<'dias' | 'meses' | 'años'>('meses');
  const [iconoSeleccionado, setIconoSeleccionado] = useState(ICONOS_DISPONIBLES[0]);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);

  // Estados para aportar/retirar
  const [modalAportarVisible, setModalAportarVisible] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState<string | null>(null);
  const [montoAportar, setMontoAportar] = useState('');
  const [esRetiro, setEsRetiro] = useState(false);

  // Monedas
  const { monedas, monedaBase } = useMonedas();
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>('');

  // Función para obtener símbolo de moneda por código
  const obtenerSimboloMoneda = (monedaCodigo: string): string => {
    const moneda = monedas.find(m => m.codigo === monedaCodigo);
    return moneda?.simbolo || monedaBase?.simbolo || '$';
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setMontoObjetivo('');
    setDuracionMeta('1');
    setUnidadTiempo('meses');
    setIconoSeleccionado(ICONOS_DISPONIBLES[0]);
    setColorSeleccionado(COLORES_DISPONIBLES[0]);
    setMonedaSeleccionada(monedaBase?.codigo || '');
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

    const ahora = new Date();
    const fechaLimite = new Date();

    switch (unidadTiempo) {
      case 'dias':
        fechaLimite.setDate(ahora.getDate() + duracion);
        break;
      case 'meses':
        fechaLimite.setMonth(ahora.getMonth() + duracion);
        break;
      case 'años':
        fechaLimite.setFullYear(ahora.getFullYear() + duracion);
        break;
    }

    agregarMeta({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      montoObjetivo: monto,
      monedaId: monedaSeleccionada || monedaBase?.codigo || '',
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

    // Nota: La validación de balance solo aplica si la meta está en moneda base
    const metaActual = metas.find(m => m.id === metaSeleccionada);
    const esMonedaBase = metaActual?.monedaId === monedaBase?.codigo;

    if (!esRetiro && esMonedaBase && monto > balance.balanceDisponible) {
      Alert.alert(
        'Balance insuficiente',
        `No tienes suficiente balance disponible.\n\nDisponible: ${monedaBase?.simbolo}${balance.balanceDisponible.toFixed(2)}\nRequerido: ${monedaBase?.simbolo}${monto.toFixed(2)}`
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
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      {!mostrarFormulario && (
        <BotonAnimado
          style={[styles.botonNuevo, { backgroundColor: tema.colores.primario }]}
          onPress={() => setMostrarFormulario(true)}
        >
          <Text style={styles.textoBotonNuevo}>+ Nueva Meta</Text>
        </BotonAnimado>
      )}

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!mostrarFormulario ? (
          <>
            {/* Lista de metas */}
            {metas.length > 0 ? (
              <View style={styles.lista}>
                {metas.map(meta => {
                  const porcentaje = (meta.montoActual / meta.montoObjetivo) * 100;
                  const estadisticas = obtenerEstadisticasMeta(meta.id);

                  return (
                    <View
                      key={meta.id}
                      style={[
                        styles.metaCard,
                        {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: meta.color,
                        },
                      ]}
                    >
                      {/* Header de la meta */}
                      <View style={styles.metaHeader}>
                        <View style={styles.metaTitulo}>
                          <Text style={styles.metaIcono}>{meta.icono}</Text>
                          <View style={styles.metaInfo}>
                            <Text style={[styles.metaNombre, { color: tema.colores.texto }]}>
                              {meta.nombre}
                            </Text>
                            {meta.descripcion && (
                              <Text style={[styles.metaDescripcion, { color: tema.colores.textoSecundario }]}>
                                {meta.descripcion}
                              </Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEliminar(meta.id, meta.nombre)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={[styles.botonEliminar, { color: tema.colores.textoSecundario }]}>×</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Monto y progreso */}
                      <View style={styles.montoContainer}>
                        <Text style={[styles.montoActual, { color: meta.color }]}>
                          {obtenerSimboloMoneda(meta.monedaId)}{meta.montoActual.toFixed(2)}
                        </Text>
                        <Text style={[styles.montoObjetivo, { color: tema.colores.textoSecundario }]}>
                          de {obtenerSimboloMoneda(meta.monedaId)}{meta.montoObjetivo.toFixed(2)}
                        </Text>
                      </View>

                      {/* Barra de progreso */}
                      <View style={[styles.barraProgreso, { backgroundColor: tema.colores.bordes }]}>
                        <View
                          style={[
                            styles.barraProgresoFill,
                            {
                              backgroundColor: meta.color,
                              width: `${Math.min(porcentaje, 100)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.porcentajeTexto, { color: tema.colores.texto }]}>
                        {porcentaje.toFixed(1)}% completado
                      </Text>

                      {/* Estadísticas */}
                      <View style={styles.estadisticas}>
                        <View style={styles.estadistica}>
                          <Text style={[styles.estadisticaLabel, { color: tema.colores.textoSecundario }]}>
                            Tiempo restante
                          </Text>
                          <Text style={[styles.estadisticaValor, { color: tema.colores.texto }]}>
                            {formatearTiempoRestante(estadisticas.diasRestantes)}
                          </Text>
                        </View>
                        <View style={styles.estadistica}>
                          <Text style={[styles.estadisticaLabel, { color: tema.colores.textoSecundario }]}>
                            Ahorro requerido
                          </Text>
                          <Text style={[styles.estadisticaValor, { color: tema.colores.texto }]}>
                            {obtenerSimboloMoneda(meta.monedaId)}{formatearAhorroRequerido(
                              estadisticas.diasRestantes,
                              estadisticas.ahorroRequeridoDiario,
                              estadisticas.ahorroRequeridoMensual
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* Botones */}
                      <View style={styles.botonesMeta}>
                        <TouchableOpacity
                          style={[styles.botonAportar, { backgroundColor: meta.color }]}
                          onPress={() => handleAportar(meta.id)}
                        >
                          <Text style={styles.textoBotonAportar}>💰 Aportar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.botonRetirar, {
                            backgroundColor: tema.colores.fondoSecundario,
                            borderColor: tema.colores.bordes,
                          }]}
                          onPress={() => handleRetirar(meta.id)}
                          disabled={meta.montoActual === 0}
                        >
                          <Text style={[styles.textoBotonRetirar, { color: tema.colores.texto }]}>
                            ↩️ Retirar
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Estado */}
                      {meta.estado === 'completada' && (
                        <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
                          <Text style={styles.badgeTexto}>✓ Completada</Text>
                        </View>
                      )}
                      {meta.estado === 'vencida' && (
                        <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                          <Text style={styles.badgeTexto}>⚠ Vencida</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <EstadoVacio
                emoji="🎯"
                titulo="No tienes metas de ahorro aún"
                subtitulo="Crea tu primera meta y empieza a ahorrar"
              />
            )}
          </>
        ) : (
          <>
            {/* Formulario crear meta */}
            <View style={[styles.formulario, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>Nueva Meta de Ahorro</Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Nombre de la meta</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondo,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Vacaciones"
                placeholderTextColor={tema.colores.textoSecundario}
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondo,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Viaje a la playa"
                placeholderTextColor={tema.colores.textoSecundario}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Monto objetivo</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondo,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                value={montoObjetivo}
                onChangeText={setMontoObjetivo}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monedasScroll}>
                {monedas.map(moneda => (
                  <TouchableOpacity
                    key={moneda.codigo}
                    style={[
                      styles.monedaBoton,
                      {
                        backgroundColor: (monedaSeleccionada || monedaBase?.codigo) === moneda.codigo
                          ? tema.colores.primario
                          : tema.colores.fondo,
                        borderColor: tema.colores.bordes,
                      },
                    ]}
                    onPress={() => setMonedaSeleccionada(moneda.codigo)}
                  >
                    <Text style={[
                      styles.monedaSimbolo,
                      {
                        color: (monedaSeleccionada || monedaBase?.codigo) === moneda.codigo
                          ? '#fff'
                          : tema.colores.texto,
                      },
                    ]}>
                      {moneda.simbolo}
                    </Text>
                    <Text style={[
                      styles.monedaCodigo,
                      {
                        color: (monedaSeleccionada || monedaBase?.codigo) === moneda.codigo
                          ? '#fff'
                          : tema.colores.textoSecundario,
                      },
                    ]}>
                      {moneda.codigo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Duración</Text>
              <View style={styles.duracionContainer}>
                <TextInput
                  style={[styles.inputDuracion, {
                    backgroundColor: tema.colores.fondo,
                    borderColor: tema.colores.bordes,
                    color: tema.colores.texto,
                  }]}
                  placeholder="1"
                  placeholderTextColor={tema.colores.textoSecundario}
                  keyboardType="numeric"
                  value={duracionMeta}
                  onChangeText={setDuracionMeta}
                />
                <View style={styles.unidadesContainer}>
                  {(['dias', 'meses', 'años'] as const).map(unidad => (
                    <TouchableOpacity
                      key={unidad}
                      style={[
                        styles.unidadBoton,
                        {
                          backgroundColor: unidadTiempo === unidad ? tema.colores.primario : tema.colores.fondo,
                          borderColor: tema.colores.bordes,
                        },
                      ]}
                      onPress={() => setUnidadTiempo(unidad)}
                    >
                      <Text style={[
                        styles.unidadTexto,
                        {
                          color: unidadTiempo === unidad ? '#fff' : tema.colores.texto,
                        },
                      ]}>
                        {unidad.charAt(0).toUpperCase() + unidad.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Icono</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconosScroll}>
                {ICONOS_DISPONIBLES.map(icono => (
                  <TouchableOpacity
                    key={icono}
                    style={[
                      styles.iconoBoton,
                      {
                        backgroundColor: iconoSeleccionado === icono ? tema.colores.primario : tema.colores.fondo,
                        borderColor: tema.colores.bordes,
                      },
                    ]}
                    onPress={() => setIconoSeleccionado(icono)}
                  >
                    <Text style={styles.icono}>{icono}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coloresScroll}>
                {COLORES_DISPONIBLES.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorBoton,
                      {
                        backgroundColor: color,
                        borderColor: colorSeleccionado === color ? tema.colores.texto : 'transparent',
                        borderWidth: colorSeleccionado === color ? 3 : 0,
                      },
                    ]}
                    onPress={() => setColorSeleccionado(color)}
                  />
                ))}
              </ScrollView>

              <View style={styles.botonesFormulario}>
                <TouchableOpacity
                  style={[styles.botonCancelar, {
                    backgroundColor: tema.colores.fondo,
                    borderColor: tema.colores.bordes,
                  }]}
                  onPress={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  <Text style={[styles.textoBotonCancelar, { color: tema.colores.texto }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <BotonAnimado
                  style={[styles.botonGuardar, { backgroundColor: tema.colores.primario }]}
                  onPress={handleAgregar}
                >
                  <Text style={styles.textoBotonGuardar}>Crear Meta</Text>
                </BotonAnimado>
              </View>
            </View>
          </>
        )}
      </ScrollView>

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
              <Text style={[styles.tituloModal, { color: tema.colores.primario }]}>
                {esRetiro ? '↩️ Retirar de Meta' : '💰 Aportar a Meta'}
              </Text>

              {!esRetiro && metaSeleccionada && (
                <Text style={[styles.infoBalance, { color: tema.colores.textoSecundario }]}>
                  {metas.find(m => m.id === metaSeleccionada)?.monedaId === monedaBase?.codigo
                    ? `Balance disponible: ${monedaBase?.simbolo}${balance.balanceDisponible.toFixed(2)}`
                    : `Moneda: ${obtenerSimboloMoneda(metas.find(m => m.id === metaSeleccionada)?.monedaId || '')}`
                  }
                </Text>
              )}

              {esRetiro && metaSeleccionada && (
                <Text style={[styles.infoBalance, { color: tema.colores.textoSecundario }]}>
                  Aportado: {obtenerSimboloMoneda(metas.find(m => m.id === metaSeleccionada)?.monedaId || '')}{metas.find(m => m.id === metaSeleccionada)?.montoActual.toFixed(2)}
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

                <BotonAnimado
                  style={[styles.botonConfirmarAporte, {
                    backgroundColor: tema.colores.primario,
                  }]}
                  onPress={confirmarAporte}
                >
                  <Text style={styles.textoBotonConfirmar}>
                    {esRetiro ? 'Retirar' : 'Aportar'}
                  </Text>
                </BotonAnimado>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  botonNuevo: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotonNuevo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lista: {
    gap: 15,
  },
  metaCard: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcono: {
    fontSize: 32,
    marginRight: 10,
  },
  metaInfo: {
    flex: 1,
  },
  metaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metaDescripcion: {
    fontSize: 13,
  },
  botonEliminar: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  montoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  montoActual: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  montoObjetivo: {
    fontSize: 14,
    marginTop: 2,
  },
  barraProgreso: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  barraProgresoFill: {
    height: '100%',
    borderRadius: 4,
  },
  porcentajeTexto: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  estadistica: {
    alignItems: 'center',
  },
  estadisticaLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  estadisticaValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  botonesMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  botonAportar: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonAportar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonRetirar: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  textoBotonRetirar: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  formulario: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
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
  duracionContainer: {
    gap: 10,
  },
  inputDuracion: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    fontSize: 16,
  },
  unidadesContainer: {
    flexDirection: 'row',
    gap: 10,
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
  iconosScroll: {
    maxHeight: 60,
  },
  iconoBoton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icono: {
    fontSize: 24,
  },
  coloresScroll: {
    maxHeight: 50,
  },
  colorBoton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  monedasScroll: {
    maxHeight: 60,
  },
  monedaBoton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  monedaSimbolo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monedaCodigo: {
    fontSize: 11,
    marginTop: 2,
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 25,
  },
  botonCancelar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonGuardar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAportar: {
    width: '85%',
    padding: 20,
    borderRadius: 20,
  },
  tituloModal: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoBalance: {
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
  },
  botonesAportar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonCancelarAporte: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  botonConfirmarAporte: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonConfirmar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
