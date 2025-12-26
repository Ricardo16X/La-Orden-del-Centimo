import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from '../context/TemaContext';
import { useRecordatorios } from '../context/RecordatoriosContext';
import { useNotificaciones } from '../hooks/useNotificaciones'; // Import directo para build nativo
import { Recordatorio, FrecuenciaRecordatorio } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalRecordatorios = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { recordatorios, agregarRecordatorio, editarRecordatorio, eliminarRecordatorio, toggleRecordatorio } = useRecordatorios();
  const { programarNotificacion, cancelarNotificacion, permisoConcedido } = useNotificaciones();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [hora, setHora] = useState('09:00');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaRecordatorio>('diario');
  const [diaSemana, setDiaSemana] = useState(2); // Lunes por defecto
  const [diaMes, setDiaMes] = useState(1); // Día 1 por defecto

  const limpiarFormulario = () => {
    setTitulo('');
    setMensaje('');
    setHora('09:00');
    setFrecuencia('diario');
    setDiaSemana(2);
    setDiaMes(1);
  };

  const handleAgregar = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato de hora (HH:MM)
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(hora)) {
      Alert.alert('Error', 'Formato de hora inválido. Usa HH:MM (ej: 09:00)');
      return;
    }

    const nuevoRecordatorio = agregarRecordatorio({
      titulo,
      mensaje,
      hora,
      frecuencia,
      activo: true,
      ...(frecuencia === 'semanal' && { diaSemana }),
      ...(frecuencia === 'mensual' && { diaMes }),
    });

    // Programar la notificación
    const notificationId = await programarNotificacion(nuevoRecordatorio);
    if (notificationId) {
      editarRecordatorio(nuevoRecordatorio.id, { notificationId });
    }

    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleToggle = async (recordatorio: Recordatorio) => {
    if (recordatorio.activo) {
      // Desactivar: cancelar notificación
      if (recordatorio.notificationId) {
        await cancelarNotificacion(recordatorio.notificationId);
      }
      toggleRecordatorio(recordatorio.id);
    } else {
      // Activar: programar notificación
      const notificationId = await programarNotificacion({ ...recordatorio, activo: true });
      if (notificationId) {
        editarRecordatorio(recordatorio.id, { notificationId });
      }
      toggleRecordatorio(recordatorio.id);
    }
  };

  const handleEliminar = async (recordatorio: Recordatorio) => {
    Alert.alert(
      'Eliminar recordatorio',
      `¿Estás seguro de eliminar "${recordatorio.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (recordatorio.notificationId) {
              await cancelarNotificacion(recordatorio.notificationId);
            }
            eliminarRecordatorio(recordatorio.id);
          },
        },
      ]
    );
  };

  const obtenerEtiquetaFrecuencia = (freq: FrecuenciaRecordatorio): string => {
    switch (freq) {
      case 'diario':
        return 'Diario';
      case 'semanal':
        return 'Semanal';
      case 'mensual':
        return 'Mensual';
    }
  };

  const obtenerNombreDiaSemana = (dia: number): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia - 1] || 'Lunes';
  };

  const DIAS_SEMANA = [
    { valor: 1, nombre: 'Domingo' },
    { valor: 2, nombre: 'Lunes' },
    { valor: 3, nombre: 'Martes' },
    { valor: 4, nombre: 'Miércoles' },
    { valor: 5, nombre: 'Jueves' },
    { valor: 6, nombre: 'Viernes' },
    { valor: 7, nombre: 'Sábado' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              ⏰ Recordatorios
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {!permisoConcedido && (
            <View style={[styles.alerta, {
              backgroundColor: `${tema.colores.acento}20`,
              borderColor: tema.colores.acento,
            }]}>
              <Text style={[styles.alertaTexto, { color: tema.colores.acento }]}>
                ⚠️ Los permisos de notificación no están concedidos. Actívalos en configuración.
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {!mostrarFormulario ? (
              <>
                {/* Lista de recordatorios */}
                {recordatorios.length > 0 ? (
                  <View style={styles.lista}>
                    {recordatorios.map(recordatorio => (
                      <View
                        key={recordatorio.id}
                        style={[styles.recordatorioItem, {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                      >
                        <View style={styles.recordatorioInfo}>
                          <Text style={[styles.recordatorioTitulo, { color: tema.colores.texto }]}>
                            {recordatorio.titulo}
                          </Text>
                          <Text style={[styles.recordatorioDetalle, { color: tema.colores.textoSecundario }]}>
                            {`${recordatorio.hora} • ${obtenerEtiquetaFrecuencia(recordatorio.frecuencia)}`}
                            {recordatorio.frecuencia === 'semanal' && recordatorio.diaSemana && ` • ${obtenerNombreDiaSemana(recordatorio.diaSemana)}`}
                            {recordatorio.frecuencia === 'mensual' && recordatorio.diaMes && ` • Día ${recordatorio.diaMes}`}
                          </Text>
                          <Text style={[styles.recordatorioMensaje, { color: tema.colores.textoSecundario }]}>
                            {recordatorio.mensaje}
                          </Text>
                        </View>
                        <View style={styles.recordatorioAcciones}>
                          <Switch
                            value={recordatorio.activo}
                            onValueChange={() => handleToggle(recordatorio)}
                            trackColor={{ false: tema.colores.bordes, true: tema.colores.primarioClaro }}
                            thumbColor={recordatorio.activo ? tema.colores.primario : tema.colores.texto}
                          />
                          <TouchableOpacity
                            onPress={() => handleEliminar(recordatorio)}
                            style={styles.botonEliminar}
                          >
                            <Text style={{ fontSize: 20 }}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.vacio}>
                    <Text style={[styles.vacioTexto, { color: tema.colores.textoSecundario }]}>
                      No tienes recordatorios configurados
                    </Text>
                  </View>
                )}

                {/* Botón agregar */}
                <TouchableOpacity
                  style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
                  onPress={() => setMostrarFormulario(true)}
                >
                  <Text style={styles.botonAgregarTexto}>+ Nuevo Recordatorio</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Formulario */}
                <View style={styles.formulario}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Título</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="Ej: Registrar gastos"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={titulo}
                    onChangeText={setTitulo}
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Mensaje</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="Ej: ¡Recuerda anotar tus gastos del día!"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={mensaje}
                    onChangeText={setMensaje}
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    {`Hora (formato 24h: HH:MM)`}
                  </Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="09:00"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={hora}
                    onChangeText={setHora}
                    keyboardType="numbers-and-punctuation"
                  />

                  <Text style={[styles.label, { color: tema.colores.texto }]}>Frecuencia</Text>
                  <View style={styles.frecuenciaOpciones}>
                    {(['diario', 'semanal', 'mensual'] as FrecuenciaRecordatorio[]).map(freq => (
                      <TouchableOpacity
                        key={freq}
                        style={[styles.frecuenciaBoton, {
                          backgroundColor: frecuencia === freq ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setFrecuencia(freq)}
                      >
                        <Text style={[styles.frecuenciaTexto, {
                          color: frecuencia === freq ? '#fff' : tema.colores.texto,
                        }]}>
                          {obtenerEtiquetaFrecuencia(freq)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Selector de día de la semana para recordatorios semanales */}
                  {frecuencia === 'semanal' && (
                    <>
                      <Text style={[styles.label, { color: tema.colores.texto }]}>Día de la semana</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasScroll}>
                        <View style={styles.diasContainer}>
                          {DIAS_SEMANA.map(dia => (
                            <TouchableOpacity
                              key={dia.valor}
                              style={[styles.diaBoton, {
                                backgroundColor: diaSemana === dia.valor ? tema.colores.primario : tema.colores.fondoSecundario,
                                borderColor: tema.colores.bordes,
                              }]}
                              onPress={() => setDiaSemana(dia.valor)}
                            >
                              <Text style={[styles.diaTexto, {
                                color: diaSemana === dia.valor ? '#fff' : tema.colores.texto,
                              }]}>
                                {dia.nombre}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </>
                  )}

                  {/* Selector de día del mes para recordatorios mensuales */}
                  {frecuencia === 'mensual' && (
                    <>
                      <Text style={[styles.label, { color: tema.colores.texto }]}>Día del mes</Text>
                      <TextInput
                        style={[styles.input, {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                          color: tema.colores.texto,
                        }]}
                        placeholder="1-31"
                        placeholderTextColor={tema.colores.textoSecundario}
                        value={diaMes.toString()}
                        onChangeText={(text) => {
                          const dia = parseInt(text);
                          if (!isNaN(dia) && dia >= 1 && dia <= 31) {
                            setDiaMes(dia);
                          } else if (text === '') {
                            setDiaMes(1);
                          }
                        }}
                        keyboardType="numeric"
                      />
                      <Text style={[styles.ayuda, { color: tema.colores.textoSecundario }]}>
                        💡 Si el mes no tiene este día, se programará para el último día del mes
                      </Text>
                    </>
                  )}

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
                      <Text style={styles.botonGuardarTexto}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  alerta: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
  },
  alertaTexto: {
    fontSize: 13,
    textAlign: 'center',
  },
  lista: {
    marginBottom: 15,
  },
  recordatorioItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
  },
  recordatorioInfo: {
    flex: 1,
  },
  recordatorioTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordatorioDetalle: {
    fontSize: 13,
    marginBottom: 4,
  },
  recordatorioMensaje: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  recordatorioAcciones: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonEliminar: {
    marginTop: 8,
  },
  vacio: {
    padding: 40,
    alignItems: 'center',
  },
  vacioTexto: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
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
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  frecuenciaOpciones: {
    flexDirection: 'row',
    gap: 8,
  },
  frecuenciaBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  frecuenciaTexto: {
    fontSize: 14,
    fontWeight: '600',
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
  diasScroll: {
    maxHeight: 50,
  },
  diasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  diaBoton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 90,
    alignItems: 'center',
  },
  diaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  ayuda: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
