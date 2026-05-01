import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useRecordatorios } from './src/context/RecordatoriosContext';
import { useNotificaciones } from './src/hooks/useNotificaciones';
import { Recordatorio, FrecuenciaRecordatorio } from './src/types';

const FRECUENCIAS: { id: FrecuenciaRecordatorio; label: string; emoji: string }[] = [
  { id: 'diario',   label: 'Diario',   emoji: '📅' },
  { id: 'semanal',  label: 'Semanal',  emoji: '🗓️' },
  { id: 'mensual',  label: 'Mensual',  emoji: '📆' },
];

const DIAS_SEMANA = [
  { valor: 1, corto: 'Dom', largo: 'Domingo' },
  { valor: 2, corto: 'Lun', largo: 'Lunes' },
  { valor: 3, corto: 'Mar', largo: 'Martes' },
  { valor: 4, corto: 'Mié', largo: 'Miércoles' },
  { valor: 5, corto: 'Jue', largo: 'Jueves' },
  { valor: 6, corto: 'Vie', largo: 'Viernes' },
  { valor: 7, corto: 'Sáb', largo: 'Sábado' },
];

export default function RecordatoriosScreen() {
  const { tema } = useTema();
  const c = tema.colores;
  const { showToast } = useToast();
  const { recordatorios, agregarRecordatorio, editarRecordatorio, eliminarRecordatorio, toggleRecordatorio } = useRecordatorios();
  const { programarNotificacion, cancelarNotificacion, permisoConcedido } = useNotificaciones();

  const [formVisible, setFormVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [horaHH, setHoraHH] = useState('09');
  const [horaMM, setHoraMM] = useState('00');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaRecordatorio>('diario');
  const [diaSemana, setDiaSemana] = useState(2);
  const [diaMes, setDiaMes] = useState('1');

  const resetForm = () => {
    setTitulo(''); setMensaje('');
    setHoraHH('09'); setHoraMM('00');
    setFrecuencia('diario'); setDiaSemana(2); setDiaMes('1');
  };

  const handleAgregar = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Error', 'Completa el título y el mensaje');
      return;
    }
    const hh = parseInt(horaHH);
    const mm = parseInt(horaMM);
    if (isNaN(hh) || hh < 0 || hh > 23 || isNaN(mm) || mm < 0 || mm > 59) {
      Alert.alert('Error', 'Hora inválida');
      return;
    }
    const hora = `${horaHH.padStart(2, '0')}:${horaMM.padStart(2, '0')}`;

    const nuevo = agregarRecordatorio({
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      hora,
      frecuencia,
      activo: true,
      ...(frecuencia === 'semanal' && { diaSemana }),
      ...(frecuencia === 'mensual' && { diaMes: parseInt(diaMes) || 1 }),
    });

    const notificationId = await programarNotificacion(nuevo);
    if (notificationId) editarRecordatorio(nuevo.id, { notificationId });

    resetForm();
    setFormVisible(false);
    showToast('Recordatorio creado');
  };

  const handleToggle = async (r: Recordatorio) => {
    if (r.activo) {
      if (r.notificationId) await cancelarNotificacion(r.notificationId);
      toggleRecordatorio(r.id);
    } else {
      const notificationId = await programarNotificacion({ ...r, activo: true });
      if (notificationId) editarRecordatorio(r.id, { notificationId });
      toggleRecordatorio(r.id);
    }
  };

  const handleEliminar = async (r: Recordatorio) => {
    Alert.alert(
      'Eliminar recordatorio',
      `¿Eliminar "${r.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            if (r.notificationId) await cancelarNotificacion(r.notificationId);
            eliminarRecordatorio(r.id);
            showToast('Recordatorio eliminado');
          },
        },
      ]
    );
  };

  const etiquetaFrecuencia = (r: Recordatorio): string => {
    let base = FRECUENCIAS.find(f => f.id === r.frecuencia)?.label ?? '';
    if (r.frecuencia === 'semanal' && r.diaSemana)
      base += ` · ${DIAS_SEMANA.find(d => d.valor === r.diaSemana)?.largo ?? ''}`;
    if (r.frecuencia === 'mensual' && r.diaMes)
      base += ` · Día ${r.diaMes}`;
    return base;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.fondo }]}>
      {/* Banner de permisos */}
      {!permisoConcedido && (
        <View style={[styles.permisoBanner, { backgroundColor: `${c.acento}20`, borderColor: c.acento }]}>
          <Text style={[styles.permisoTexto, { color: c.acento }]}>
            ⚠️ Activa los permisos de notificación para que los recordatorios funcionen
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {recordatorios.length === 0 ? (
          <EstadoVacio
            emoji="🔔"
            titulo="Sin recordatorios"
            subtitulo='Toca "+" para crear tu primer recordatorio'
          />
        ) : (
          <View style={styles.lista}>
            {recordatorios.map(r => (
              <View
                key={r.id}
                style={[styles.card, {
                  backgroundColor: c.fondoSecundario,
                  borderColor: c.bordes,
                  opacity: r.activo ? 1 : 0.55,
                }]}
              >
                {/* Acento lateral según estado */}
                <View style={[styles.cardAccent, { backgroundColor: r.activo ? c.primario : c.bordes }]} />

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTextos}>
                      {/* Hora grande */}
                      <Text style={[styles.cardHora, { color: r.activo ? c.primario : c.textoSecundario }]}>
                        🕐 {r.hora}
                      </Text>
                      <Text style={[styles.cardTitulo, { color: c.texto }]} numberOfLines={1}>
                        {r.titulo}
                      </Text>
                      <Text style={[styles.cardFrecuencia, { color: c.textoSecundario }]}>
                        {etiquetaFrecuencia(r)}
                      </Text>
                      {r.mensaje ? (
                        <Text style={[styles.cardMensaje, { color: c.textoSecundario }]} numberOfLines={2}>
                          {r.mensaje}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.cardAcciones}>
                      <Switch
                        value={r.activo}
                        onValueChange={() => handleToggle(r)}
                        trackColor={{ false: c.bordes, true: `${c.primario}80` }}
                        thumbColor={r.activo ? c.primario : c.texto}
                      />
                      <TouchableOpacity
                        onPress={() => handleEliminar(r)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.btnEliminar}
                      >
                        <Text style={styles.btnEliminarTexto}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <BotonAnimado
        style={[styles.fab, { backgroundColor: c.primario }]}
        onPress={() => { resetForm(); setFormVisible(true); }}
      >
        <Text style={styles.fabTexto}>+</Text>
      </BotonAnimado>

      {/* ── Bottom sheet: formulario ── */}
      <Modal visible={formVisible} transparent animationType="slide" onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContainer, { backgroundColor: c.fondo }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.bordes }]}>
              <Text style={[styles.modalTitulo, { color: c.primario }]}>🔔 Nuevo Recordatorio</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalCerrar, { color: c.textoSecundario }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}
            >
              {/* Título */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Título</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: Registrar gastos del día"
                placeholderTextColor={c.textoSecundario}
                value={titulo}
                onChangeText={setTitulo}
              />

              {/* Mensaje */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Mensaje de la notificación</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMulti, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: ¡No olvides anotar tus gastos!"
                placeholderTextColor={c.textoSecundario}
                value={mensaje}
                onChangeText={setMensaje}
                multiline
                numberOfLines={2}
              />

              {/* Hora — picker HH : MM */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Hora</Text>
              <View style={styles.horaRow}>
                <TextInput
                  style={[styles.horaInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                  placeholder="09"
                  placeholderTextColor={c.textoSecundario}
                  value={horaHH}
                  onChangeText={v => setHoraHH(v.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                <Text style={[styles.horaSep, { color: c.texto }]}>:</Text>
                <TextInput
                  style={[styles.horaInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                  placeholder="00"
                  placeholderTextColor={c.textoSecundario}
                  value={horaMM}
                  onChangeText={v => setHoraMM(v.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                <Text style={[styles.horaHint, { color: c.textoSecundario }]}>formato 24h</Text>
              </View>

              {/* Frecuencia */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Frecuencia</Text>
              <View style={styles.frecuenciasRow}>
                {FRECUENCIAS.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFrecuencia(f.id)}
                    style={[styles.frecuenciaBtn, {
                      backgroundColor: frecuencia === f.id ? c.primario : c.fondoSecundario,
                      borderColor: c.bordes,
                    }]}
                  >
                    <Text style={styles.frecuenciaBtnEmoji}>{f.emoji}</Text>
                    <Text style={[styles.frecuenciaBtnTexto, { color: frecuencia === f.id ? '#fff' : c.texto }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Día semana */}
              {frecuencia === 'semanal' && (
                <>
                  <Text style={[styles.formLabel, { color: c.texto }]}>Día de la semana</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.diasRow}>
                      {DIAS_SEMANA.map(d => (
                        <TouchableOpacity
                          key={d.valor}
                          onPress={() => setDiaSemana(d.valor)}
                          style={[styles.diaBtn, {
                            backgroundColor: diaSemana === d.valor ? c.primario : c.fondoSecundario,
                            borderColor: c.bordes,
                          }]}
                        >
                          <Text style={[styles.diaBtnTexto, { color: diaSemana === d.valor ? '#fff' : c.texto }]}>
                            {d.corto}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Día mes */}
              {frecuencia === 'mensual' && (
                <>
                  <Text style={[styles.formLabel, { color: c.texto }]}>Día del mes</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto, width: 100 }]}
                    placeholder="1"
                    placeholderTextColor={c.textoSecundario}
                    value={diaMes}
                    onChangeText={v => setDiaMes(v.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={[styles.formHint, { color: c.textoSecundario }]}>
                    Si el mes no tiene ese día, se usará el último día del mes
                  </Text>
                </>
              )}

              <BotonAnimado
                onPress={handleAgregar}
                style={[styles.formBoton, { backgroundColor: c.primario }]}
              >
                <Text style={styles.formBotonTexto}>➕ Crear recordatorio</Text>
              </BotonAnimado>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 },

  permisoBanner: {
    marginHorizontal: 16, marginTop: 12,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  permisoTexto: { fontSize: 13, textAlign: 'center' },

  lista: { gap: 10 },

  // ── Card ──
  card: {
    borderRadius: 14, borderWidth: 2,
    flexDirection: 'row', overflow: 'hidden',
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTextos: { flex: 1 },
  cardHora: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  cardTitulo: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardFrecuencia: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  cardMensaje: { fontSize: 12, fontStyle: 'italic' },
  cardAcciones: { alignItems: 'center', gap: 8, marginLeft: 8 },
  btnEliminar: { marginTop: 4 },
  btnEliminarTexto: { fontSize: 18 },

  // ── FAB ──
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 5,
  },
  fabTexto: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%', paddingBottom: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 2,
  },
  modalTitulo: { fontSize: 20, fontWeight: 'bold' },
  modalCerrar: { fontSize: 24, fontWeight: 'bold' },
  modalScroll: { padding: 20, paddingBottom: 10 },

  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  formInput: { borderWidth: 2, borderRadius: 12, padding: 13, fontSize: 16 },
  formInputMulti: { height: 80, textAlignVertical: 'top' },
  formHint: { fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  formBoton: { marginTop: 20, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  formBotonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  horaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  horaInput: {
    borderWidth: 2, borderRadius: 12,
    width: 64, paddingVertical: 13,
    fontSize: 24, fontWeight: 'bold',
  },
  horaSep: { fontSize: 28, fontWeight: 'bold' },
  horaHint: { fontSize: 12, flex: 1, marginLeft: 4 },

  frecuenciasRow: { flexDirection: 'row', gap: 8 },
  frecuenciaBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 2,
  },
  frecuenciaBtnEmoji: { fontSize: 20, marginBottom: 4 },
  frecuenciaBtnTexto: { fontSize: 12, fontWeight: '600' },

  diasRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  diaBtn: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 2, minWidth: 52, alignItems: 'center',
  },
  diaBtnTexto: { fontSize: 13, fontWeight: '600' },
});
