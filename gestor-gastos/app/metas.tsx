import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useMetas } from './src/context/MetasContext';
import { useBalance } from './src/context/BalanceContext';
import { useMonedas } from './src/context/MonedasContext';
import { Meta } from './src/types';

const ICONOS = ['🎯', '🏖️', '🚗', '🏠', '💍', '🎓', '💻', '🎮', '📱', '✈️', '🏋️', '🎸'];
const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function MetasScreen() {
  const { tema } = useTema();
  const c = tema.colores;
  const { showToast } = useToast();
  const { metas, agregarMeta, eliminarMeta, aportarAMeta, retirarDeMeta, obtenerEstadisticasMeta } = useMetas();
  const { balance } = useBalance();
  const { monedas, monedaBase } = useMonedas();

  // ─── Form state ───────────────────────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [duracion, setDuracion] = useState('6');
  const [unidad, setUnidad] = useState<'dias' | 'meses' | 'años'>('meses');
  const [icono, setIcono] = useState(ICONOS[0]);
  const [color, setColor] = useState(COLORES[0]);
  const [monedaSel, setMonedaSel] = useState(monedaBase?.codigo || '');

  // ─── Modal aportar/retirar ────────────────────────────────────────────────────
  const [modalAporte, setModalAporte] = useState(false);
  const [metaAporteId, setMetaAporteId] = useState<string | null>(null);
  const [montoAporte, setMontoAporte] = useState('');
  const [esRetiro, setEsRetiro] = useState(false);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const simboloMoneda = (cod: string) =>
    monedas.find(m => m.codigo === cod)?.simbolo || monedaBase?.simbolo || '$';

  const resetForm = () => {
    setNombre(''); setDescripcion(''); setMontoObjetivo('');
    setDuracion('6'); setUnidad('meses');
    setIcono(ICONOS[0]); setColor(COLORES[0]);
    setMonedaSel(monedaBase?.codigo || '');
  };

  const calcularFechaLimite = (): string => {
    const d = parseInt(duracion) || 1;
    const f = new Date();
    if (unidad === 'dias')  f.setDate(f.getDate() + d);
    if (unidad === 'meses') f.setMonth(f.getMonth() + d);
    if (unidad === 'años')  f.setFullYear(f.getFullYear() + d);
    return f.toISOString();
  };

  const handleAgregar = () => {
    if (!nombre.trim()) { Alert.alert('Error', 'Ingresa un nombre'); return; }
    const monto = parseFloat(montoObjetivo);
    if (isNaN(monto) || monto <= 0) { Alert.alert('Error', 'Ingresa un monto válido'); return; }
    const dur = parseInt(duracion);
    if (isNaN(dur) || dur <= 0) { Alert.alert('Error', 'Ingresa una duración válida'); return; }

    agregarMeta({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      montoObjetivo: monto,
      monedaId: monedaSel || monedaBase?.codigo || '',
      fechaInicio: new Date().toISOString(),
      fechaLimite: calcularFechaLimite(),
      icono, color,
    });

    resetForm();
    setFormVisible(false);
    showToast('Meta creada');
  };

  const abrirAporte = (metaId: string, retiro = false) => {
    setMetaAporteId(metaId);
    setEsRetiro(retiro);
    setMontoAporte('');
    setModalAporte(true);
  };

  const confirmarAporte = async () => {
    if (!metaAporteId) return;
    const monto = parseFloat(montoAporte);
    if (isNaN(monto) || monto <= 0) { Alert.alert('Error', 'Monto inválido'); return; }

    const meta = metas.find(m => m.id === metaAporteId);
    if (!esRetiro && meta?.monedaId === monedaBase?.codigo && monto > balance.balanceDisponible) {
      Alert.alert(
        'Balance insuficiente',
        `Disponible: ${monedaBase?.simbolo}${balance.balanceDisponible.toFixed(2)}`
      );
      return;
    }

    const resultado = esRetiro
      ? await retirarDeMeta(metaAporteId, monto)
      : await aportarAMeta(metaAporteId, monto);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.mensaje);
    } else {
      setModalAporte(false);
      showToast(esRetiro ? 'Retiro realizado' : '¡Aporte registrado!');
    }
  };

  const handleEliminar = (meta: Meta) => {
    Alert.alert(
      'Eliminar meta',
      `¿Seguro de eliminar "${meta.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => { eliminarMeta(meta.id); showToast('Meta eliminada'); } },
      ]
    );
  };

  const obtenerRitmo = (pctCompletado: number, pctTiempo: number) => {
    if (pctCompletado >= 100) return null;
    const diff = pctCompletado - pctTiempo;
    if (diff >= 0)   return { label: 'En tiempo',  color: '#10b981', emoji: '✓' };
    if (diff >= -15) return { label: 'Ligeramente atrasado', color: '#f59e0b', emoji: '⚠️' };
    return               { label: 'Atrasado',   color: '#ef4444', emoji: '🔴' };
  };

  // ─── Agrupar metas ────────────────────────────────────────────────────────────
  const metasActivas    = metas.filter(m => m.estado === 'en_progreso');
  const metasCompletadas = metas.filter(m => m.estado === 'completada');
  const metasVencidas   = metas.filter(m => m.estado === 'vencida');

  // ─── Render card ─────────────────────────────────────────────────────────────
  const renderCard = (meta: Meta) => {
    const stats = obtenerEstadisticasMeta(meta.id);
    if (!stats) return null;

    const pctCompletado = Math.min(stats.porcentajeCompletado, 100);

    const diasTotales = Math.max(1, Math.floor(
      (new Date(meta.fechaLimite).getTime() - new Date(meta.fechaInicio).getTime()) / 86400000
    ));
    const diasTranscurridos = Math.floor(
      (Date.now() - new Date(meta.fechaInicio).getTime()) / 86400000
    );
    const pctTiempo = Math.min((diasTranscurridos / diasTotales) * 100, 100);

    const ritmo = meta.estado === 'en_progreso' ? obtenerRitmo(pctCompletado, pctTiempo) : null;
    const sim = simboloMoneda(meta.monedaId);

    const fechaLimiteStr = new Date(meta.fechaLimite).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
      <View key={meta.id} style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
        {/* Acento lateral */}
        <View style={[styles.cardAccent, { backgroundColor: meta.color }]} />

        <View style={styles.cardBody}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcono}>{meta.icono}</Text>
            <View style={styles.cardHeaderTexto}>
              <Text style={[styles.cardNombre, { color: c.texto }]} numberOfLines={1}>
                {meta.nombre}
              </Text>
              {meta.descripcion ? (
                <Text style={[styles.cardDescripcion, { color: c.textoSecundario }]} numberOfLines={1}>
                  {meta.descripcion}
                </Text>
              ) : null}
            </View>
            {meta.estado === 'completada' && (
              <View style={[styles.estadoBadge, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}>
                <Text style={[styles.estadoBadgeTexto, { color: '#10b981' }]}>✓ Completada</Text>
              </View>
            )}
            {meta.estado === 'vencida' && (
              <View style={[styles.estadoBadge, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}>
                <Text style={[styles.estadoBadgeTexto, { color: '#ef4444' }]}>Vencida</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => handleEliminar(meta)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.btnEliminar}
            >
              <Text style={[styles.btnEliminarTexto, { color: c.textoSecundario }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Montos + barra */}
          <View style={styles.montosRow}>
            <Text style={[styles.montoActual, { color: meta.color }]}>
              {sim}{meta.montoActual.toFixed(2)}
            </Text>
            <Text style={[styles.montoSep, { color: c.textoSecundario }]}> / </Text>
            <Text style={[styles.montoObjetivo, { color: c.textoSecundario }]}>
              {sim}{meta.montoObjetivo.toFixed(2)}
            </Text>
            <Text style={[styles.pctTexto, { color: meta.color }]}>
              {pctCompletado.toFixed(0)}%
            </Text>
          </View>

          <View style={[styles.barraTrack, { backgroundColor: c.bordes }]}>
            <View style={[styles.barraFill, { width: `${pctCompletado}%`, backgroundColor: meta.color }]} />
            {meta.estado === 'en_progreso' && (
              <View style={[styles.barraRitmoLinea, { left: `${pctTiempo}%` }]} />
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Vence</Text>
              <Text style={[styles.statValor, { color: c.texto }]}>{fechaLimiteStr}</Text>
            </View>
            {meta.estado === 'en_progreso' && stats.diasRestantes > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Faltan</Text>
                <Text style={[styles.statValor, { color: c.texto }]}>
                  {stats.diasRestantes > 30
                    ? `${Math.round(stats.diasRestantes / 30)} meses`
                    : `${stats.diasRestantes} días`}
                </Text>
              </View>
            )}
            {meta.estado === 'en_progreso' && stats.montoFaltante > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Mensual</Text>
                <Text style={[styles.statValor, { color: c.texto }]}>
                  {sim}{stats.ahorroRequeridoMensual.toFixed(0)}
                </Text>
              </View>
            )}
          </View>

          {/* Ritmo */}
          {ritmo && (
            <View style={[styles.ritmoRow, { backgroundColor: `${ritmo.color}18` }]}>
              <Text style={[styles.ritmoTexto, { color: ritmo.color }]}>
                {ritmo.emoji} {ritmo.label}
              </Text>
            </View>
          )}

          {/* Botones */}
          {meta.estado === 'en_progreso' && (
            <View style={styles.botonesRow}>
              <BotonAnimado
                style={[styles.btnAportar, { backgroundColor: meta.color }]}
                onPress={() => abrirAporte(meta.id)}
              >
                <Text style={styles.btnAportarTexto}>💰 Aportar</Text>
              </BotonAnimado>
              <TouchableOpacity
                style={[styles.btnRetirar, { borderColor: c.bordes }]}
                onPress={() => abrirAporte(meta.id, true)}
                disabled={meta.montoActual === 0}
              >
                <Text style={[styles.btnRetirarTexto, { color: meta.montoActual > 0 ? c.texto : c.textoSecundario }]}>
                  ↩ Retirar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: c.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {metas.length === 0 ? (
          <EstadoVacio
            emoji="🎯"
            titulo="No tienes metas de ahorro"
            subtitulo='Toca "+" para crear tu primera meta'
          />
        ) : (
          <>
            {/* Metas activas */}
            {metasActivas.length > 0 && (
              <View style={styles.grupo}>
                {metasActivas.map(renderCard)}
              </View>
            )}

            {/* Metas completadas */}
            {metasCompletadas.length > 0 && (
              <View style={styles.grupo}>
                <Text style={[styles.grupoTitulo, { color: '#10b981' }]}>
                  ✓ Completadas ({metasCompletadas.length})
                </Text>
                {metasCompletadas.map(renderCard)}
              </View>
            )}

            {/* Metas vencidas */}
            {metasVencidas.length > 0 && (
              <View style={styles.grupo}>
                <Text style={[styles.grupoTitulo, { color: '#ef4444' }]}>
                  Vencidas ({metasVencidas.length})
                </Text>
                {metasVencidas.map(renderCard)}
              </View>
            )}
          </>
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
              <Text style={[styles.modalTitulo, { color: c.primario }]}>🎯 Nueva Meta</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalCerrar, { color: c.textoSecundario }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}
            >
              {/* Nombre */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Nombre</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: Vacaciones, Auto nuevo…"
                placeholderTextColor={c.textoSecundario}
                value={nombre}
                onChangeText={setNombre}
              />

              {/* Descripción */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: Viaje a Europa en diciembre"
                placeholderTextColor={c.textoSecundario}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              {/* Icono */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Icono</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconosRow}>
                  {ICONOS.map(ic => (
                    <TouchableOpacity
                      key={ic}
                      onPress={() => setIcono(ic)}
                      style={[styles.iconoBtn, {
                        backgroundColor: icono === ic ? c.primario : c.fondoSecundario,
                        borderColor: icono === ic ? c.primario : c.bordes,
                      }]}
                    >
                      <Text style={styles.iconoBtnTexto}>{ic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Color */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Color</Text>
              <View style={styles.coloresRow}>
                {COLORES.map(col => (
                  <TouchableOpacity
                    key={col}
                    onPress={() => setColor(col)}
                    style={[styles.colorBtn, {
                      backgroundColor: col,
                      borderWidth: color === col ? 3 : 0,
                      borderColor: c.texto,
                    }]}
                  />
                ))}
              </View>

              {/* Monto objetivo */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Monto objetivo</Text>
              <View style={[styles.formInputRow, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
                <Text style={[styles.formPrefijo, { color: c.primario }]}>
                  {simboloMoneda(monedaSel || monedaBase?.codigo || '')}
                </Text>
                <TextInput
                  style={[styles.formInputInner, { color: c.texto }]}
                  placeholder="0.00"
                  placeholderTextColor={c.textoSecundario}
                  keyboardType="decimal-pad"
                  value={montoObjetivo}
                  onChangeText={setMontoObjetivo}
                />
              </View>

              {/* Moneda (solo si hay más de una) */}
              {monedas.length > 1 && (
                <>
                  <Text style={[styles.formLabel, { color: c.texto }]}>Moneda</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      {monedas.map(mon => (
                        <TouchableOpacity
                          key={mon.codigo}
                          onPress={() => setMonedaSel(mon.codigo)}
                          style={[styles.chip, {
                            backgroundColor: (monedaSel || monedaBase?.codigo) === mon.codigo ? c.primario : c.fondoSecundario,
                            borderColor: c.bordes,
                          }]}
                        >
                          <Text style={[styles.chipTexto, {
                            color: (monedaSel || monedaBase?.codigo) === mon.codigo ? '#fff' : c.texto,
                          }]}>
                            {mon.simbolo} {mon.codigo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Duración */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Duración</Text>
              <View style={styles.duracionRow}>
                <TextInput
                  style={[styles.formInputDuracion, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                  placeholder="6"
                  placeholderTextColor={c.textoSecundario}
                  keyboardType="number-pad"
                  value={duracion}
                  onChangeText={setDuracion}
                />
                <View style={styles.chipsRow}>
                  {(['dias', 'meses', 'años'] as const).map(u => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setUnidad(u)}
                      style={[styles.chip, {
                        backgroundColor: unidad === u ? c.primario : c.fondoSecundario,
                        borderColor: c.bordes,
                      }]}
                    >
                      <Text style={[styles.chipTexto, { color: unidad === u ? '#fff' : c.texto }]}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <BotonAnimado
                onPress={handleAgregar}
                style={[styles.formBoton, { backgroundColor: c.primario }]}
              >
                <Text style={styles.formBotonTexto}>➕ Crear meta</Text>
              </BotonAnimado>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal aportar/retirar ── */}
      <Modal visible={modalAporte} transparent animationType="fade" onRequestClose={() => setModalAporte(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.aportarContainer, { backgroundColor: c.fondo }]}>
            {(() => {
              const meta = metas.find(m => m.id === metaAporteId);
              if (!meta) return null;
              const sim = simboloMoneda(meta.monedaId);
              return (
                <>
                  <View style={[styles.aportarAccent, { backgroundColor: meta.color }]} />
                  <Text style={[styles.aportarTitulo, { color: c.texto }]}>
                    {esRetiro ? '↩ Retirar de' : '💰 Aportar a'} {meta.icono} {meta.nombre}
                  </Text>
                  <Text style={[styles.aportarInfo, { color: c.textoSecundario }]}>
                    {esRetiro
                      ? `Aportado: ${sim}${meta.montoActual.toFixed(2)}`
                      : meta.monedaId === monedaBase?.codigo
                        ? `Balance disponible: ${monedaBase?.simbolo}${balance.balanceDisponible.toFixed(2)}`
                        : `Moneda: ${sim}`
                    }
                  </Text>
                  <View style={[styles.formInputRow, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, marginBottom: 20 }]}>
                    <Text style={[styles.formPrefijo, { color: meta.color }]}>{sim}</Text>
                    <TextInput
                      style={[styles.formInputInner, { color: c.texto }]}
                      placeholder="0.00"
                      placeholderTextColor={c.textoSecundario}
                      keyboardType="decimal-pad"
                      value={montoAporte}
                      onChangeText={setMontoAporte}
                      autoFocus
                    />
                  </View>
                  <View style={styles.aportarBotones}>
                    <TouchableOpacity
                      style={[styles.aportarBtnCancelar, { borderColor: c.bordes }]}
                      onPress={() => setModalAporte(false)}
                    >
                      <Text style={[styles.aportarBtnTexto, { color: c.textoSecundario }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <BotonAnimado
                      style={[styles.aportarBtnConfirmar, { backgroundColor: meta.color }]}
                      onPress={confirmarAporte}
                    >
                      <Text style={styles.aportarBtnConfirmarTexto}>
                        {esRetiro ? 'Retirar' : 'Aportar'}
                      </Text>
                    </BotonAnimado>
                  </View>
                </>
              );
            })()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 },

  grupo: { marginBottom: 8 },
  grupoTitulo: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4, letterSpacing: 0.5 },

  // ── Card ──
  card: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  cardIcono: { fontSize: 28 },
  cardHeaderTexto: { flex: 1 },
  cardNombre: { fontSize: 16, fontWeight: 'bold' },
  cardDescripcion: { fontSize: 12, marginTop: 1 },
  estadoBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  estadoBadgeTexto: { fontSize: 11, fontWeight: '700' },
  btnEliminar: { padding: 4 },
  btnEliminarTexto: { fontSize: 16, fontWeight: 'bold' },

  montosRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  montoActual: { fontSize: 22, fontWeight: 'bold' },
  montoSep: { fontSize: 14 },
  montoObjetivo: { fontSize: 14, flex: 1 },
  pctTexto: { fontSize: 16, fontWeight: 'bold' },

  barraTrack: {
    height: 8, borderRadius: 4, overflow: 'visible',
    position: 'relative', marginBottom: 12,
  },
  barraFill: { height: 8, borderRadius: 4 },
  barraRitmoLinea: {
    position: 'absolute', top: -3, width: 2, height: 14,
    backgroundColor: 'rgba(0,0,0,0.3)', marginLeft: -1, borderRadius: 1,
  },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  statItem: {},
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValor: { fontSize: 13, fontWeight: '600' },

  ritmoRow: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10 },
  ritmoTexto: { fontSize: 12, fontWeight: '600' },

  botonesRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnAportar: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  btnAportarTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  btnRetirar: {
    paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: 10, borderWidth: 2, alignItems: 'center',
  },
  btnRetirarTexto: { fontSize: 14, fontWeight: '600' },

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

  // ── Modal formulario ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '92%', paddingBottom: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 2,
  },
  modalTitulo: { fontSize: 20, fontWeight: 'bold' },
  modalCerrar: { fontSize: 24, fontWeight: 'bold' },
  modalScroll: { padding: 20, paddingBottom: 10 },

  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  formInput: { borderWidth: 2, borderRadius: 12, padding: 13, fontSize: 16 },
  formInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderRadius: 12, paddingHorizontal: 14,
  },
  formPrefijo: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  formInputInner: { flex: 1, paddingVertical: 13, fontSize: 16 },
  formInputDuracion: { borderWidth: 2, borderRadius: 12, padding: 13, fontSize: 16, width: 80 },
  formBoton: { marginTop: 20, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  formBotonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  iconosRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  iconoBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  iconoBtnTexto: { fontSize: 22 },

  coloresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 2 },
  chipTexto: { fontSize: 13, fontWeight: '600' },

  duracionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // ── Modal aportar/retirar ──
  aportarContainer: {
    margin: 20, borderRadius: 20, padding: 20,
    overflow: 'hidden', alignSelf: 'center', width: '90%',
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  aportarAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  aportarTitulo: { fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  aportarInfo: { fontSize: 13, marginBottom: 16 },
  aportarBotones: { flexDirection: 'row', gap: 10 },
  aportarBtnCancelar: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 2, alignItems: 'center',
  },
  aportarBtnTexto: { fontSize: 15, fontWeight: '600' },
  aportarBtnConfirmar: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  aportarBtnConfirmarTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
