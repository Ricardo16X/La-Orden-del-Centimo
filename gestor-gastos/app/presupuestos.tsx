import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useCategorias } from './src/context/CategoriasContext';
import { usePresupuestos } from './src/context/PresupuestosContext';
import { useMonedas } from './src/context/MonedasContext';
import { ModalSugerenciaPresupuesto } from './src/components/ModalSugerenciaPresupuesto';
import { Presupuesto } from './src/types';

const PERIODOS = [
  { id: 'semanal', nombre: 'Semanal', emoji: '📅' },
  { id: 'mensual', nombre: 'Mensual', emoji: '🗓️' },
  { id: 'anual',   nombre: 'Anual',   emoji: '📆' },
] as const;

export default function PresupuestosScreen() {
  const { tema } = useTema();
  const c = tema.colores;
  const { showToast } = useToast();
  const { categorias } = useCategorias();
  const { presupuestos, agregarPresupuesto, editarPresupuesto, eliminarPresupuesto, obtenerEstadisticasPresupuesto } = usePresupuestos();
  const { monedas, monedaBase, convertirAMonedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo ?? '$';

  const [formVisible, setFormVisible] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [monto, setMonto] = useState('');
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');
  const [alertaEn, setAlertaEn] = useState('80');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(monedaBase?.codigo || '');
  const [modalSugerenciaVisible, setModalSugerenciaVisible] = useState(false);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);

  // ─── Fecha helpers ───────────────────────────────────────────────────────────

  const hoy = new Date();
  const diaActual = hoy.getDate();
  const diasTotalesMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const progresoMes = diaActual / diasTotalesMes;
  const nombreMes = hoy.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const obtenerSimboloMoneda = (cod: string) =>
    monedas.find(m => m.codigo === cod)?.simbolo ?? simbolo;

  const obtenerCategoria = (id: string) =>
    categorias.find(cat => cat.id === id);

  // Ritmo: compara gasto actual vs gasto esperado a este punto del mes
  const obtenerRitmo = (gastado: number, presupuestoMonto: number, periodoTipo: string) => {
    if (periodoTipo !== 'mensual' || gastado === 0 || progresoMes === 0) return null;
    const esperado = progresoMes * presupuestoMonto;
    const ratio = gastado / esperado;
    if (ratio > 1.5) return { label: 'Ritmo alto',     emoji: '⚡', color: '#ef4444', ratio };
    if (ratio > 1.0) return { label: 'Ritmo elevado',  emoji: '⚠️', color: '#f59e0b', ratio };
    return               { label: 'Ritmo ideal',     emoji: '✓',  color: '#10b981', ratio };
  };

  // ─── Estadísticas globales ───────────────────────────────────────────────────

  const presupuestosConStats = presupuestos
    .map(p => ({ ...p, stats: obtenerEstadisticasPresupuesto(p.categoriaId, p.periodo) }))
    .sort((a, b) => {
      const pa = a.stats?.excedido ? 2 : a.stats?.debeAlertar ? 1 : 0;
      const pb = b.stats?.excedido ? 2 : b.stats?.debeAlertar ? 1 : 0;
      return pb - pa;
    });

  const codigoBase = monedaBase?.codigo || 'GTQ';
  const totalGastado = presupuestosConStats.reduce((s, p) => {
    const cod = p.monedaId || codigoBase;
    return s + convertirAMonedaBase(p.stats?.gastado ?? 0, cod);
  }, 0);
  const totalPresupuestado = presupuestosConStats.reduce((s, p) => {
    const cod = p.monedaId || codigoBase;
    return s + convertirAMonedaBase(p.monto, cod);
  }, 0);
  const excedidos  = presupuestosConStats.filter(p => p.stats?.excedido).length;
  const enAlerta   = presupuestosConStats.filter(p => p.stats?.debeAlertar).length;
  const alDia      = presupuestosConStats.filter(p => !p.stats?.excedido && !p.stats?.debeAlertar).length;
  const pctGlobal  = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0;
  const colorGlobal = excedidos > 0 ? '#ef4444' : enAlerta > 0 ? '#f59e0b' : '#10b981';

  // ─── Form handlers ───────────────────────────────────────────────────────────

  const resetFormulario = () => {
    setCategoriaSeleccionada('');
    setMonto('');
    setPeriodo('mensual');
    setAlertaEn('80');
    setEditandoId(null);
    setMonedaSeleccionada(monedaBase?.codigo || '');
    setFormVisible(false);
  };

  const handleEditar = (p: Presupuesto) => {
    setEditandoId(p.id);
    setCategoriaSeleccionada(p.categoriaId);
    setMonto(p.monto.toString());
    setPeriodo(p.periodo);
    setAlertaEn(p.alertaEn.toString());
    setMonedaSeleccionada(p.monedaId || monedaBase?.codigo || '');
    setFormVisible(true);
  };

  const handleGuardar = () => {
    if (!categoriaSeleccionada) { showToast('Selecciona una categoría', 'error'); return; }
    const montoNum  = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) { showToast('Ingresa un monto válido', 'error'); return; }
    const alertaNum = parseFloat(alertaEn);
    if (isNaN(alertaNum) || alertaNum < 0 || alertaNum > 100) { showToast('El porcentaje debe estar entre 0 y 100', 'error'); return; }

    if (editandoId) {
      editarPresupuesto(editandoId, { categoriaId: categoriaSeleccionada, monto: montoNum, periodo, alertaEn: alertaNum, monedaId: monedaSeleccionada });
      resetFormulario();
      showToast('Presupuesto actualizado');
      return;
    }

    const existente = presupuestos.find(p => p.categoriaId === categoriaSeleccionada && p.periodo === periodo);
    if (existente) {
      editarPresupuesto(existente.id, { monto: montoNum, alertaEn: alertaNum, monedaId: monedaSeleccionada });
      resetFormulario();
      showToast('Presupuesto actualizado');
      return;
    }

    agregarPresupuesto({ categoriaId: categoriaSeleccionada, monto: montoNum, periodo, alertaEn: alertaNum, monedaId: monedaSeleccionada });
    resetFormulario();
    showToast('Presupuesto agregado');
  };

  const handleEliminar = (id: string) => {
    eliminarPresupuesto(id);
    setConfirmandoEliminarId(null);
    showToast('Presupuesto eliminado');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: c.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── 1. Timeline del mes ── */}
        <View style={[styles.timelineCard, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
          <View style={styles.timelineHeaderRow}>
            <Text style={[styles.timelineMes, { color: c.primario }]}>
              {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}
            </Text>
            <TouchableOpacity
              onPress={() => setModalSugerenciaVisible(true)}
              style={[styles.botonSugerir, { borderColor: c.primario }]}
            >
              <Text style={[styles.botonSugerirTexto, { color: c.primario }]}>✨ Sugerir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineRow}>
            <Text style={[styles.timelineEtiqueta, { color: c.textoSecundario }]}>1</Text>
            <View style={[styles.timelineTrack, { backgroundColor: c.bordes }]}>
              <View style={[styles.timelineFill, { width: `${progresoMes * 100}%`, backgroundColor: c.primario }]} />
              <View style={[styles.timelineMarker, { left: `${progresoMes * 100}%`, borderColor: c.primario, backgroundColor: c.fondo }]} />
            </View>
            <Text style={[styles.timelineEtiqueta, { color: c.textoSecundario }]}>{diasTotalesMes}</Text>
          </View>

          <Text style={[styles.timelineDetalle, { color: c.textoSecundario }]}>
            Día {diaActual} de {diasTotalesMes} · {diasTotalesMes - diaActual} días restantes en el mes
          </Text>
        </View>

        {/* ── 2. Resumen global ── */}
        {presupuestos.length > 0 && (
          <View style={[styles.resumenCard, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.resumenHeaderRow}>
              <Text style={[styles.resumenTitulo, { color: c.texto }]}>Salud del presupuesto</Text>
              <Text style={[styles.resumenPct, { color: colorGlobal }]}>{Math.round(pctGlobal)}%</Text>
            </View>

            {/* Barra con marcador de ritmo esperado */}
            <View style={[styles.resumenTrack, { backgroundColor: c.bordes }]}>
              <View style={[styles.resumenFill, { width: `${Math.min(pctGlobal, 100)}%`, backgroundColor: colorGlobal }]} />
              <View style={[styles.resumenRitmoLinea, { left: `${progresoMes * 100}%` }]} />
            </View>
            <Text style={[styles.resumenHint, { color: c.textoSecundario }]}>
              La línea indica el gasto esperado al día de hoy
            </Text>

            <View style={styles.resumenMontoRow}>
              <Text style={[styles.resumenGastado, { color: c.texto }]}>{simbolo}{totalGastado.toFixed(0)}</Text>
              <Text style={[styles.resumenSep, { color: c.textoSecundario }]}> / </Text>
              <Text style={[styles.resumenTotal, { color: c.textoSecundario }]}>{simbolo}{totalPresupuestado.toFixed(0)}</Text>
            </View>

            <View style={styles.resumenChips}>
              {excedidos > 0 && (
                <View style={[styles.resumenChip, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                  <Text style={[styles.resumenChipTexto, { color: '#ef4444' }]}>🚨 {excedidos} excedido{excedidos !== 1 ? 's' : ''}</Text>
                </View>
              )}
              {enAlerta > 0 && (
                <View style={[styles.resumenChip, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                  <Text style={[styles.resumenChipTexto, { color: '#f59e0b' }]}>⚠️ {enAlerta} en alerta</Text>
                </View>
              )}
              {alDia > 0 && (
                <View style={[styles.resumenChip, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Text style={[styles.resumenChipTexto, { color: '#10b981' }]}>✓ {alDia} al día</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── 3. Cards de presupuestos ── */}
        {presupuestos.length === 0 ? (
          <EstadoVacio
            emoji="📋"
            titulo="Sin presupuestos configurados"
            subtitulo='Toca "+" para agregar tu primer presupuesto'
          />
        ) : (
          presupuestosConStats.map(p => {
            const stats      = p.stats;
            const porcentaje = stats ? Math.min(stats.porcentaje, 100) : 0;
            const colorEstado = stats?.excedido ? '#ef4444' : stats?.debeAlertar ? '#f59e0b' : '#10b981';
            const ritmo      = stats ? obtenerRitmo(stats.gastado, p.monto, p.periodo) : null;
            const cat        = obtenerCategoria(p.categoriaId);
            const confirmando = confirmandoEliminarId === p.id;
            const restante   = stats ? p.monto - stats.gastado : 0;

            return (
              <View key={p.id} style={[styles.budgetCard, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
                {/* Acento lateral de estado */}
                <View style={[styles.budgetAccent, { backgroundColor: colorEstado }]} />

                <View style={styles.budgetBody}>
                  {/* Header */}
                  <View style={styles.budgetHeaderRow}>
                    <View style={styles.budgetHeaderLeft}>
                      <Text style={styles.budgetEmoji}>{cat?.emoji ?? '📦'}</Text>
                      <View>
                        <Text style={[styles.budgetNombre, { color: c.texto }]}>{cat?.nombre ?? 'Categoría'}</Text>
                        <Text style={[styles.budgetPeriodoBadge, { color: c.textoSecundario }]}>
                          {PERIODOS.find(per => per.id === p.periodo)?.nombre} · {obtenerSimboloMoneda(p.monedaId)}{p.monto.toFixed(0)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.budgetHeaderRight}>
                      <Text style={[styles.budgetPct, { color: colorEstado }]}>
                        {stats ? `${Math.round(stats.porcentaje)}%` : '—'}
                      </Text>
                      <View style={styles.budgetAcciones}>
                        <TouchableOpacity onPress={() => handleEditar(p)} style={styles.budgetBtn}>
                          <Text style={styles.budgetBtnTexto}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setConfirmandoEliminarId(confirmando ? null : p.id)}
                          style={styles.budgetBtn}
                        >
                          <Text style={styles.budgetBtnTexto}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Barra de progreso con marcador de ritmo esperado */}
                  <View style={[styles.barraTrack, { backgroundColor: c.bordes }]}>
                    <View style={[styles.barraFill, { width: `${porcentaje}%`, backgroundColor: colorEstado }]} />
                    {p.periodo === 'mensual' && (
                      <View style={[styles.barraRitmoLinea, { left: `${Math.min(progresoMes * 100, 100)}%` }]} />
                    )}
                  </View>

                  {/* Montos */}
                  <View style={styles.budgetMontosRow}>
                    <Text style={[styles.budgetGastado, { color: c.texto }]}>
                      {stats ? `${obtenerSimboloMoneda(p.monedaId)}${stats.gastado.toFixed(2)}` : '—'}
                    </Text>
                    <Text style={[styles.budgetRestante, { color: stats?.excedido ? '#ef4444' : c.textoSecundario }]}>
                      {stats?.excedido
                        ? `+${obtenerSimboloMoneda(p.monedaId)}${(stats.gastado - p.monto).toFixed(2)} excedido`
                        : stats
                          ? `${obtenerSimboloMoneda(p.monedaId)}${restante.toFixed(2)} restante`
                          : ''}
                    </Text>
                  </View>

                  {/* Indicador de ritmo */}
                  {ritmo && (
                    <View style={[styles.ritmoRow, { backgroundColor: `${ritmo.color}18` }]}>
                      <Text style={[styles.ritmoTexto, { color: ritmo.color }]}>
                        {ritmo.emoji} {ritmo.label}
                        {ritmo.ratio > 1
                          ? ` · gastas ${((ritmo.ratio - 1) * 100).toFixed(0)}% más rápido de lo esperado`
                          : ` · vas según lo planeado`}
                      </Text>
                    </View>
                  )}

                  {/* Días restantes */}
                  {stats && stats.diasRestantes > 0 && (
                    <Text style={[styles.budgetDias, { color: c.textoSecundario }]}>
                      ⏱ {stats.diasRestantes} día{stats.diasRestantes !== 1 ? 's' : ''} para cerrar el período
                    </Text>
                  )}

                  {/* Confirmación inline de eliminar */}
                  {confirmando && (
                    <View style={[styles.confirmRow, { borderTopColor: c.bordes }]}>
                      <Text style={[styles.confirmTexto, { color: c.textoSecundario }]}>
                        ¿Eliminar este presupuesto?
                      </Text>
                      <View style={styles.confirmBotones}>
                        <TouchableOpacity
                          onPress={() => setConfirmandoEliminarId(null)}
                          style={[styles.confirmBtn, { borderColor: c.bordes }]}
                        >
                          <Text style={[styles.confirmBtnTexto, { color: c.textoSecundario }]}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEliminar(p.id)}
                          style={[styles.confirmBtn, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                        >
                          <Text style={[styles.confirmBtnTexto, { color: '#fff' }]}>Sí, eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.espacioInferior} />
      </ScrollView>

      {/* FAB */}
      <BotonAnimado
        style={[styles.fab, { backgroundColor: c.primario }]}
        onPress={() => { setEditandoId(null); setFormVisible(true); }}
      >
        <Text style={styles.fabTexto}>+</Text>
      </BotonAnimado>

      {/* ── Bottom sheet: formulario ── */}
      <Modal visible={formVisible} transparent animationType="slide" onRequestClose={resetFormulario}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContainer, { backgroundColor: c.fondo }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.bordes }]}>
              <View>
                <Text style={[styles.modalTitulo, { color: c.primario }]}>
                  {editandoId ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'}
                </Text>
              </View>
              <TouchableOpacity onPress={resetFormulario} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalCerrar, { color: c.textoSecundario }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}
            >
              {/* Categoría */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formScrollH}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoriaSeleccionada(cat.id)}
                    style={[
                      styles.formChip,
                      {
                        backgroundColor: categoriaSeleccionada === cat.id ? c.primario : c.fondoSecundario,
                        borderColor: cat.color,
                      },
                    ]}
                  >
                    <Text style={styles.formChipEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.formChipTexto, { color: categoriaSeleccionada === cat.id ? '#fff' : c.texto }]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Período */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Período</Text>
              <View style={styles.periodosRow}>
                {PERIODOS.map(per => (
                  <TouchableOpacity
                    key={per.id}
                    onPress={() => setPeriodo(per.id)}
                    style={[
                      styles.periodoBtn,
                      {
                        backgroundColor: periodo === per.id ? c.primario : c.fondoSecundario,
                        borderColor: c.bordes,
                      },
                    ]}
                  >
                    <Text style={styles.periodoBtnEmoji}>{per.emoji}</Text>
                    <Text style={[styles.periodoBtnTexto, { color: periodo === per.id ? '#fff' : c.texto }]}>
                      {per.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Moneda (solo si hay más de una) */}
              {monedas.length > 1 && (
                <>
                  <Text style={[styles.formLabel, { color: c.texto }]}>Moneda</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formScrollH}>
                    {monedas.map(mon => (
                      <TouchableOpacity
                        key={mon.codigo}
                        onPress={() => setMonedaSeleccionada(mon.codigo)}
                        style={[
                          styles.formChip,
                          {
                            backgroundColor: monedaSeleccionada === mon.codigo ? c.primario : c.fondoSecundario,
                            borderColor: c.bordes,
                          },
                        ]}
                      >
                        <Text style={[styles.formChipTexto, { color: monedaSeleccionada === mon.codigo ? '#fff' : c.texto }]}>
                          {mon.simbolo} {mon.codigo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Monto */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Monto del presupuesto</Text>
              <View style={[styles.formInputRow, { borderColor: c.bordes, backgroundColor: c.fondoSecundario }]}>
                <Text style={[styles.formPrefijo, { color: c.primario }]}>{obtenerSimboloMoneda(monedaSeleccionada)}</Text>
                <TextInput
                  style={[styles.formInput, { color: c.texto }]}
                  placeholder="0.00"
                  placeholderTextColor={c.textoSecundario}
                  keyboardType="decimal-pad"
                  value={monto}
                  onChangeText={setMonto}
                />
              </View>

              {/* Alerta */}
              <Text style={[styles.formLabel, { color: c.texto }]}>Alertar al alcanzar (%)</Text>
              <TextInput
                style={[styles.formInputSolo, { borderColor: c.bordes, backgroundColor: c.fondoSecundario, color: c.texto }]}
                placeholder="80"
                placeholderTextColor={c.textoSecundario}
                keyboardType="number-pad"
                maxLength={3}
                value={alertaEn}
                onChangeText={setAlertaEn}
              />

              <BotonAnimado
                onPress={handleGuardar}
                style={[styles.formBoton, { backgroundColor: c.primario }]}
              >
                <Text style={styles.formBotonTexto}>
                  {editandoId ? '✓ Guardar cambios' : '➕ Agregar presupuesto'}
                </Text>
              </BotonAnimado>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ModalSugerenciaPresupuesto
        visible={modalSugerenciaVisible}
        onClose={() => setModalSugerenciaVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 },

  // ── Timeline ──
  timelineCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timelineMes: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  botonSugerir: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  botonSugerirTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timelineEtiqueta: {
    fontSize: 11,
    fontWeight: '600',
    width: 18,
    textAlign: 'center',
  },
  timelineTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  timelineFill: {
    height: 8,
    borderRadius: 4,
  },
  timelineMarker: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginLeft: -7,
  },
  timelineDetalle: {
    fontSize: 12,
  },

  // ── Resumen global ──
  resumenCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  resumenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumenTitulo: {
    fontSize: 15,
    fontWeight: '600',
  },
  resumenPct: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resumenTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 6,
  },
  resumenFill: {
    height: 10,
    borderRadius: 5,
  },
  resumenRitmoLinea: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginLeft: -1,
    borderRadius: 1,
  },
  resumenHint: {
    fontSize: 11,
    marginBottom: 10,
  },
  resumenMontoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  resumenGastado: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  resumenSep: {
    fontSize: 16,
  },
  resumenTotal: {
    fontSize: 16,
  },
  resumenChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resumenChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  resumenChipTexto: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Budget cards ──
  budgetCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  budgetAccent: {
    width: 5,
  },
  budgetBody: {
    flex: 1,
    padding: 14,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  budgetEmoji: {
    fontSize: 26,
  },
  budgetNombre: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  budgetPeriodoBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  budgetPct: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetAcciones: {
    flexDirection: 'row',
  },
  budgetBtn: {
    padding: 4,
  },
  budgetBtnTexto: {
    fontSize: 18,
  },
  barraTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 10,
  },
  barraFill: {
    height: 8,
    borderRadius: 4,
  },
  barraRitmoLinea: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginLeft: -1,
    borderRadius: 1,
  },
  budgetMontosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetGastado: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  budgetRestante: {
    fontSize: 12,
    fontWeight: '600',
  },
  ritmoRow: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  ritmoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetDias: {
    fontSize: 11,
    marginTop: 2,
  },
  confirmRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  confirmTexto: {
    fontSize: 13,
    marginBottom: 10,
  },
  confirmBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  confirmBtnTexto: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabTexto: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
  espacioInferior: { height: 20 },

  // ── Modal formulario ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 10,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 14,
  },
  formScrollH: {
    marginBottom: 4,
  },
  formChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    gap: 6,
  },
  formChipEmoji: { fontSize: 18 },
  formChipTexto: { fontSize: 14, fontWeight: '600' },
  periodosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodoBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  periodoBtnEmoji: { fontSize: 22, marginBottom: 4 },
  periodoBtnTexto: { fontSize: 12, fontWeight: '600' },
  formInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  formPrefijo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  formInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
  },
  formInputSolo: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
  },
  formBoton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  formBotonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
