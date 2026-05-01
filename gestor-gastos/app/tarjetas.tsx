import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useTarjetas } from './src/context/TarjetasContext';
import { useCuotas } from './src/context/CuotasContext';
import { useGastos } from './src/context/GastosContext';
import { useMonedas } from './src/context/MonedasContext';
import { ModalAgregarTarjeta } from './src/components/ModalAgregarTarjeta';
import { ModalAgregarCuota } from './src/components/ModalAgregarCuota';
import { VistaProyeccionCuotas } from './src/components/VistaProyeccionCuotas';
import { SimuladorCuotas } from './src/components/SimuladorCuotas';
import { TarjetaCredito } from './src/types';

export default function TarjetasScreen() {
  const { tema } = useTema();
  const { showToast } = useToast();
  const { tarjetas, eliminarTarjeta, obtenerEstadoTarjeta, editarTarjeta } = useTarjetas();
  const { obtenerEstadisticasTarjeta, eliminarCuota, registrarPagoCuota } = useCuotas();
  const { monedas, monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo ?? tema.moneda;
  const c = tema.colores;

  const [tarjetaActivaId, setTarjetaActivaId] = useState<string | null>(null);
  const [cuotasExpandido, setCuotasExpandido] = useState(false);
  const [modalTarjetaVisible, setModalTarjetaVisible] = useState(false);
  const [modalCuotaVisible, setModalCuotaVisible] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<{ id: string; nombre: string } | null>(null);
  const [tarjetaParaEditar, setTarjetaParaEditar] = useState<TarjetaCredito | null>(null);
  const [modalDesglose, setModalDesglose] = useState(false);
  const [desgloseTarjeta, setDesgloseTarjeta] = useState<TarjetaCredito | null>(null);
  const [desgloseTipo, setDesgloseTipo] = useState<'pendiente' | 'actual'>('pendiente');

  const { gastos } = useGastos();

  // Sincronizar tarjeta activa cuando cambia la lista
  useEffect(() => {
    if (tarjetas.length === 0) { setTarjetaActivaId(null); return; }
    if (!tarjetaActivaId || !tarjetas.find(t => t.id === tarjetaActivaId)) {
      setTarjetaActivaId(tarjetas[0].id);
    }
  }, [tarjetas]);

  const tarjetaActiva = tarjetas.find(t => t.id === tarjetaActivaId) ?? null;

  const seleccionarTarjeta = (id: string) => {
    if (id !== tarjetaActivaId) {
      setTarjetaActivaId(id);
      setCuotasExpandido(false);
    }
  };

  // ─── Contraste de texto sobre color de tarjeta ──────────────────────────────

  const obtenerColoresTextoTarjeta = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const oscuro = L > 0.35;
    return {
      primario:    oscuro ? 'rgba(0,0,0,0.85)'  : '#fff',
      secundario:  oscuro ? 'rgba(0,0,0,0.55)'  : 'rgba(255,255,255,0.75)',
      tenue:       oscuro ? 'rgba(0,0,0,0.40)'  : 'rgba(255,255,255,0.6)',
      botonBg:     oscuro ? 'rgba(0,0,0,0.20)'  : 'rgba(0,0,0,0.40)',
    };
  };

  // ─── Lógica de balances (sin cambios) ───────────────────────────────────────

  const obtenerUltimoCorte = (tarjeta: TarjetaCredito): Date => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dia = hoy.getDate();
    let mes = dia > tarjeta.diaCorte ? hoy.getMonth() : hoy.getMonth() - 1;
    let anio = hoy.getFullYear();
    if (mes < 0) { mes = 11; anio -= 1; }
    const corte = new Date(anio, mes, tarjeta.diaCorte);
    corte.setHours(0, 0, 0, 0);
    return corte;
  };

  const obtenerBalancesTarjeta = (tarjeta: TarjetaCredito) => {
    const ultimoCorte = obtenerUltimoCorte(tarjeta);
    const cortePrevio = new Date(ultimoCorte);
    cortePrevio.setMonth(cortePrevio.getMonth() - 1);
    const yaPageado = tarjeta.ultimoPago
      ? new Date(tarjeta.ultimoPago) >= ultimoCorte
      : false;
    const gastosTarjeta = gastos.filter(g => g.tarjetaId === tarjeta.id && g.tipo === 'gasto');
    const consumoPendientePago = yaPageado ? 0 : gastosTarjeta
      .filter(g => { const f = new Date(g.fecha); f.setHours(0,0,0,0); return f > cortePrevio && f <= ultimoCorte; })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);
    const consumoCicloActual = gastosTarjeta
      .filter(g => { const f = new Date(g.fecha); f.setHours(0,0,0,0); return f > ultimoCorte; })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);
    return { consumoPendientePago, consumoCicloActual, ultimoCorte, yaPageado };
  };

  const obtenerDiasHastaPago = (tarjeta: TarjetaCredito, ultimoCorte: Date): number => {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fechaPago = new Date(ultimoCorte.getFullYear(), ultimoCorte.getMonth() + 1, tarjeta.diaPago);
    fechaPago.setHours(0,0,0,0);
    return Math.round((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  const obtenerGastosDesglose = (tarjeta: TarjetaCredito, tipo: 'pendiente' | 'actual') => {
    const { ultimoCorte } = obtenerBalancesTarjeta(tarjeta);
    const cortePrevio = new Date(ultimoCorte);
    cortePrevio.setMonth(cortePrevio.getMonth() - 1);
    return gastos
      .filter(g => {
        if (g.tarjetaId !== tarjeta.id || g.tipo !== 'gasto') return false;
        const f = new Date(g.fecha); f.setHours(0,0,0,0);
        return tipo === 'pendiente' ? f > cortePrevio && f <= ultimoCorte : f > ultimoCorte;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  };

  const obtenerSimboloMoneda = (codigo: string) =>
    monedas.find(m => m.codigo === codigo)?.simbolo ?? monedaBase?.simbolo ?? '$';

  // Agrupa los gastos de un ciclo por moneda original (para mostrar GTQ + USD separados)
  const obtenerResumenPorMoneda = (tarjeta: TarjetaCredito, tipo: 'pendiente' | 'actual') => {
    const items = obtenerGastosDesglose(tarjeta, tipo);
    const porMoneda: Record<string, { monto: number; simbolo: string }> = {};
    let totalEnBase = 0;
    items.forEach(g => {
      const cod = g.moneda || monedaBase?.codigo || 'GTQ';
      const sim = obtenerSimboloMoneda(cod);
      if (!porMoneda[cod]) porMoneda[cod] = { monto: 0, simbolo: sim };
      porMoneda[cod].monto += g.monto;
      totalEnBase += g.montoEnMonedaBase ?? g.monto;
    });
    return { porMoneda, totalEnBase, entries: Object.entries(porMoneda) };
  };

  // ─── Urgencia de chips ───────────────────────────────────────────────────────

  const obtenerUrgenciaChip = (tarjeta: TarjetaCredito): 'pago' | 'corte' | 'ok' => {
    const { consumoPendientePago, ultimoCorte } = obtenerBalancesTarjeta(tarjeta);
    if (consumoPendientePago > 0) return 'pago';
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const proximoCorte = new Date(ultimoCorte.getFullYear(), ultimoCorte.getMonth() + 1, tarjeta.diaCorte);
    const dias = Math.round((proximoCorte.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (dias <= 5) return 'corte';
    return 'ok';
  };

  const prioridadUrgencia = { pago: 0, corte: 1, ok: 2 };
  const tarjetasOrdenadas = [...tarjetas].sort((a, b) =>
    prioridadUrgencia[obtenerUrgenciaChip(a)] - prioridadUrgencia[obtenerUrgenciaChip(b)]
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleRegistrarPagoCiclo = (tarjeta: TarjetaCredito) => {
    const { consumoPendientePago, ultimoCorte } = obtenerBalancesTarjeta(tarjeta);
    Alert.alert(
      '💳 Registrar pago',
      `¿Confirmar pago de ${simbolo}${consumoPendientePago.toFixed(2)} de "${tarjeta.nombre}"?\n\nCorresponde al ciclo cerrado el día ${tarjeta.diaCorte}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
          editarTarjeta(tarjeta.id, { ultimoPago: ultimoCorte.toISOString() });
          showToast('Pago registrado correctamente');
        }},
      ]
    );
  };

  const handleEditar = (tarjeta: TarjetaCredito) => {
    setTarjetaParaEditar(tarjeta);
    setModalTarjetaVisible(true);
  };

  const handleEliminar = (id: string, nombre: string) => {
    Alert.alert('Confirmar eliminación', `¿Eliminar la tarjeta "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        eliminarTarjeta(id);
        showToast('Tarjeta eliminada');
      }},
    ]);
  };

  const handleEliminarCuota = (cuotaId: string, descripcion: string) => {
    Alert.alert('Confirmar eliminación', `¿Eliminar la cuota "${descripcion}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        eliminarCuota(cuotaId);
        showToast('Cuota eliminada');
      }},
    ]);
  };

  const handleRegistrarPago = (cuotaId: string, descripcion: string, cuotasPagadas: number, totalCuotas: number) => {
    if (cuotasPagadas >= totalCuotas) { showToast('Esta cuota ya está completamente pagada', 'info'); return; }
    Alert.alert('Registrar pago', `¿Confirmar cuota ${cuotasPagadas + 1}/${totalCuotas} de "${descripcion}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Registrar', onPress: () => { registrarPagoCuota(cuotaId); showToast('Pago registrado'); }},
    ]);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: c.fondo }]}>
      {tarjetas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EstadoVacio
            emoji="💳"
            titulo="No tienes tarjetas registradas"
            subtitulo='Toca el botón "+" para agregar tu primera tarjeta'
          />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── 1. Chips selector ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {tarjetasOrdenadas.map(t => {
              const urgencia = obtenerUrgenciaChip(t);
              const activa = t.id === tarjetaActivaId;
              const colorUrgencia = urgencia === 'pago' ? '#ef4444' : urgencia === 'corte' ? '#f59e0b' : '#10b981';
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => seleccionarTarjeta(t.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: activa ? c.fondoSecundario : c.fondo,
                      borderColor: activa ? t.color : c.bordes,
                    },
                  ]}
                >
                  <View style={[styles.chipAccent, { backgroundColor: t.color }]} />
                  <Text style={[styles.chipNombre, { color: activa ? c.texto : c.textoSecundario }]} numberOfLines={1}>
                    {t.nombre}
                  </Text>
                  <View style={[styles.chipDot, { backgroundColor: colorUrgencia }]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── 2. Spotlight card ── */}
          {tarjetaActiva && (() => {
            const estado = obtenerEstadoTarjeta(tarjetaActiva);
            const txt = obtenerColoresTextoTarjeta(tarjetaActiva.color);
            return (
              <View style={[styles.spotlight, { backgroundColor: tarjetaActiva.color }]}>
                {/* Decoración */}
                <View style={styles.decoCirculoGrande} />
                <View style={styles.decoCirculoPequeno} />

                {/* Acciones */}
                <View style={styles.spotlightAcciones}>
                  <TouchableOpacity onPress={() => handleEditar(tarjetaActiva)} style={[styles.spotlightBoton, { backgroundColor: txt.botonBg }]}>
                    <Text style={styles.spotlightBotonTexto}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEliminar(tarjetaActiva.id, tarjetaActiva.nombre)} style={[styles.spotlightBoton, { backgroundColor: txt.botonBg }]}>
                    <Text style={styles.spotlightBotonTexto}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Contenido de la tarjeta */}
                <View style={styles.spotlightContenido}>
                  <View>
                    <Text style={[styles.spotlightBanco, { color: txt.secundario }]}>{tarjetaActiva.banco}</Text>
                    <Text style={[styles.spotlightNombre, { color: txt.primario }]}>{tarjetaActiva.nombre}</Text>
                  </View>
                  <View style={styles.spotlightDigitos}>
                    <Text style={[styles.spotlightDigitosTexto, { color: txt.secundario }]}>•• •• •• {tarjetaActiva.ultimosCuatroDigitos}</Text>
                  </View>
                  <View style={styles.spotlightFooter}>
                    <View>
                      <Text style={[styles.spotlightFechaLabel, { color: txt.tenue }]}>CORTE</Text>
                      <Text style={[styles.spotlightFechaValor, { color: txt.primario }]}>{tarjetaActiva.diaCorte}</Text>
                    </View>
                    <View>
                      <Text style={[styles.spotlightFechaLabel, { color: txt.tenue }]}>PAGO</Text>
                      <Text style={[styles.spotlightFechaValor, { color: txt.primario }]}>{tarjetaActiva.diaPago}</Text>
                    </View>
                    <View style={styles.spotlightEstadoBadge}>
                      <Text style={[styles.spotlightEstadoTexto, { color: estado.color }]}>
                        {estado.mensaje}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })()}

          {/* ── 3. Panel financiero ── */}
          {tarjetaActiva && (() => {
            const { consumoPendientePago, consumoCicloActual, yaPageado, ultimoCorte } = obtenerBalancesTarjeta(tarjetaActiva);
            const estadisticas = obtenerEstadisticasTarjeta(tarjetaActiva.id);
            const totalDeuda = consumoPendientePago + consumoCicloActual + estadisticas.totalPendiente;
            const diasHastaPago = consumoPendientePago > 0 ? obtenerDiasHastaPago(tarjetaActiva, ultimoCorte) : null;

            return (
              <View style={[styles.panel, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>

                {/* Fila: A pagar */}
                {consumoPendientePago > 0 && (() => {
                  const { entries, totalEnBase } = obtenerResumenPorMoneda(tarjetaActiva, 'pendiente');
                  const multiMoneda = entries.length > 1;
                  return (
                    <View style={[styles.panelFila, { borderBottomColor: c.bordes }]}>
                      <View style={styles.panelFilaLeft}>
                        <View style={[styles.panelDot, { backgroundColor: '#ef4444' }]} />
                        <View>
                          <Text style={[styles.panelEtiqueta, { color: c.textoSecundario }]}>A pagar este ciclo</Text>
                          {diasHastaPago !== null && (
                            <Text style={[styles.panelSubetiqueta, { color: diasHastaPago <= 3 ? '#ef4444' : '#f59e0b' }]}>
                              {diasHastaPago < 0
                                ? `Venció hace ${Math.abs(diasHastaPago)} día${Math.abs(diasHastaPago) !== 1 ? 's' : ''}`
                                : diasHastaPago === 0 ? '⚠ Vence hoy'
                                : `⏰ Vence en ${diasHastaPago} día${diasHastaPago !== 1 ? 's' : ''}`}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.panelFilaRight}>
                        {entries.map(([cod, data]) => (
                          <Text key={cod} style={[styles.panelMonto, { color: '#ef4444' }]}>
                            {data.simbolo}{data.monto.toFixed(2)}
                          </Text>
                        ))}
                        {multiMoneda && (
                          <Text style={[styles.panelSubetiqueta, { color: c.textoSecundario }]}>
                            ≈ {simbolo}{totalEnBase.toFixed(2)}
                          </Text>
                        )}
                        <TouchableOpacity onPress={() => { setDesgloseTarjeta(tarjetaActiva); setDesgloseTipo('pendiente'); setModalDesglose(true); }}>
                          <Text style={[styles.panelDetalle, { color: c.primario }]}>Ver →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}

                {/* Pagado confirmado */}
                {yaPageado && consumoPendientePago === 0 && (
                  <View style={[styles.panelFila, { borderBottomColor: c.bordes }]}>
                    <View style={styles.panelFilaLeft}>
                      <View style={[styles.panelDot, { backgroundColor: '#10b981' }]} />
                      <Text style={[styles.panelEtiqueta, { color: '#10b981' }]}>Estado de cuenta pagado ✓</Text>
                    </View>
                  </View>
                )}

                {/* Fila: Ciclo actual */}
                {consumoCicloActual > 0 && (() => {
                  const { entries, totalEnBase } = obtenerResumenPorMoneda(tarjetaActiva, 'actual');
                  const multiMoneda = entries.length > 1;
                  return (
                    <View style={[styles.panelFila, { borderBottomColor: c.bordes }]}>
                      <View style={styles.panelFilaLeft}>
                        <View style={[styles.panelDot, { backgroundColor: c.primario }]} />
                        <View>
                          <Text style={[styles.panelEtiqueta, { color: c.textoSecundario }]}>Ciclo en curso</Text>
                          <Text style={[styles.panelSubetiqueta, { color: c.textoSecundario }]}>
                            Corta el día {tarjetaActiva.diaCorte}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.panelFilaRight}>
                        {entries.map(([cod, data]) => (
                          <Text key={cod} style={[styles.panelMonto, { color: c.primario }]}>
                            {data.simbolo}{data.monto.toFixed(2)}
                          </Text>
                        ))}
                        {multiMoneda && (
                          <Text style={[styles.panelSubetiqueta, { color: c.textoSecundario }]}>
                            ≈ {simbolo}{totalEnBase.toFixed(2)}
                          </Text>
                        )}
                        <TouchableOpacity onPress={() => { setDesgloseTarjeta(tarjetaActiva); setDesgloseTipo('actual'); setModalDesglose(true); }}>
                          <Text style={[styles.panelDetalle, { color: c.primario }]}>Ver →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}

                {/* Barra de utilización */}
                {tarjetaActiva.limiteCredito && tarjetaActiva.limiteCredito > 0 && (() => {
                  const util = Math.min(totalDeuda / tarjetaActiva.limiteCredito!, 1);
                  const pct = Math.round(util * 100);
                  const colorBarra = util >= 0.8 ? '#ef4444' : util >= 0.5 ? '#f59e0b' : '#10b981';
                  return (
                    <View style={styles.utilizacionContainer}>
                      <View style={styles.utilizacionHeaderRow}>
                        <Text style={[styles.panelEtiqueta, { color: c.textoSecundario }]}>Utilización del crédito</Text>
                        <Text style={[styles.utilizacionPct, { color: colorBarra }]}>{pct}%</Text>
                      </View>
                      <View style={[styles.utilizacionTrack, { backgroundColor: c.bordes }]}>
                        <View style={[styles.utilizacionFill, { width: `${pct}%` as any, backgroundColor: colorBarra }]} />
                      </View>
                      <Text style={[styles.utilizacionDetalle, { color: c.textoSecundario }]}>
                        {simbolo}{totalDeuda.toFixed(2)} de {simbolo}{tarjetaActiva.limiteCredito!.toFixed(2)}
                      </Text>
                    </View>
                  );
                })()}

                {/* Botón pagar */}
                {consumoPendientePago > 0 && (() => {
                  const { entries, totalEnBase } = obtenerResumenPorMoneda(tarjetaActiva, 'pendiente');
                  const multiMoneda = entries.length > 1;
                  const resumenBtn = multiMoneda
                    ? `≈ ${simbolo}${totalEnBase.toFixed(2)}`
                    : entries.length === 1
                      ? `${entries[0][1].simbolo}${entries[0][1].monto.toFixed(2)}`
                      : `${simbolo}${consumoPendientePago.toFixed(2)}`;
                  return (
                    <BotonAnimado
                      onPress={() => handleRegistrarPagoCiclo(tarjetaActiva)}
                      style={[styles.botonPagar, { backgroundColor: '#10b981' }]}
                    >
                      <Text style={styles.botonPagarTexto}>
                        ✓ Registrar pago · {resumenBtn}
                      </Text>
                    </BotonAnimado>
                  );
                })()}
              </View>
            );
          })()}

          {/* ── 4. Cuotas colapsables ── */}
          {tarjetaActiva && (() => {
            const estadisticas = obtenerEstadisticasTarjeta(tarjetaActiva.id);
            const tieneCuotas = estadisticas.cuotas.length > 0;
            return (
              <View style={[styles.cuotasCard, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
                <TouchableOpacity
                  style={styles.cuotasHeader}
                  onPress={() => tieneCuotas && setCuotasExpandido(v => !v)}
                  activeOpacity={tieneCuotas ? 0.7 : 1}
                >
                  <View style={styles.cuotasHeaderLeft}>
                    <Text style={styles.cuotasIcono}>📦</Text>
                    <View>
                      <Text style={[styles.cuotasTitulo, { color: c.texto }]}>
                        Compras a cuotas
                        {tieneCuotas && (
                          <Text style={[styles.cuotasConteo, { color: c.primario }]}> · {estadisticas.cuotasActivas}</Text>
                        )}
                      </Text>
                      {tieneCuotas && (
                        <Text style={[styles.cuotasSubtitulo, { color: c.textoSecundario }]}>
                          {simbolo}{estadisticas.totalMensual.toFixed(2)}/mes
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.cuotasHeaderRight}>
                    <TouchableOpacity
                      onPress={() => { setTarjetaSeleccionada({ id: tarjetaActiva.id, nombre: tarjetaActiva.nombre }); setModalCuotaVisible(true); }}
                      style={[styles.botonAgregarCuota, { borderColor: c.primario }]}
                    >
                      <Text style={[styles.botonAgregarCuotaTexto, { color: c.primario }]}>+ Agregar</Text>
                    </TouchableOpacity>
                    {tieneCuotas && (
                      <Text style={[styles.cuotasChevron, { color: c.textoSecundario }]}>
                        {cuotasExpandido ? '▲' : '▼'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {cuotasExpandido && tieneCuotas && (
                  <View style={[styles.cuotasLista, { borderTopColor: c.bordes }]}>
                    {estadisticas.cuotas.map((cuota, i) => (
                      <View
                        key={cuota.id}
                        style={[
                          styles.cuotaItem,
                          { borderBottomColor: c.bordes },
                          i === estadisticas.cuotas.length - 1 && { borderBottomWidth: 0 },
                        ]}
                      >
                        <View style={styles.cuotaInfo}>
                          <Text style={[styles.cuotaDescripcion, { color: c.texto }]}>{cuota.descripcion}</Text>
                          <Text style={[styles.cuotaDetalle, { color: c.textoSecundario }]}>
                            {cuota.cuotasPagadas}/{cuota.cantidadCuotas} cuotas · {simbolo}{cuota.montoPorCuota}/mes
                          </Text>
                          <View style={[styles.progresoBar, { backgroundColor: c.bordes }]}>
                            <View style={[styles.progresoFill, {
                              width: `${(cuota.cuotasPagadas / cuota.cantidadCuotas) * 100}%`,
                              backgroundColor: c.primario,
                            }]} />
                          </View>
                          {cuota.cuotasPagadas < cuota.cantidadCuotas && (
                            <BotonAnimado
                              onPress={() => handleRegistrarPago(cuota.id, cuota.descripcion, cuota.cuotasPagadas, cuota.cantidadCuotas)}
                              style={[styles.botonRegistrarPago, { backgroundColor: c.primario }]}
                            >
                              <Text style={styles.botonRegistrarPagoTexto}>
                                ✓ Registrar cuota {cuota.cuotasPagadas + 1}
                              </Text>
                            </BotonAnimado>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEliminarCuota(cuota.id, cuota.descripcion)}
                          style={styles.cuotaEliminar}
                        >
                          <Text style={styles.cuotaEliminarTexto}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })()}

          {/* ── 5. Proyección + Simulador ── */}
          <VistaProyeccionCuotas variant="full-width" />
          <SimuladorCuotas variant="full-width" />

          <View style={styles.espacioInferior} />
        </ScrollView>
      )}

      {/* FAB */}
      <BotonAnimado
        style={[styles.fab, { backgroundColor: c.primario }]}
        onPress={() => setModalTarjetaVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </BotonAnimado>

      {/* Modals */}
      <ModalAgregarTarjeta
        visible={modalTarjetaVisible}
        onClose={() => { setModalTarjetaVisible(false); setTarjetaParaEditar(null); }}
        tarjetaEditar={tarjetaParaEditar ?? undefined}
      />

      {tarjetaSeleccionada && (
        <ModalAgregarCuota
          visible={modalCuotaVisible}
          onClose={() => { setModalCuotaVisible(false); setTarjetaSeleccionada(null); }}
          tarjetaId={tarjetaSeleccionada.id}
          nombreTarjeta={tarjetaSeleccionada.nombre}
        />
      )}

      {/* Modal desglose */}
      <Modal visible={modalDesglose} transparent animationType="slide" onRequestClose={() => setModalDesglose(false)}>
        <View style={styles.desgloseOverlay}>
          <View style={[styles.desgloseContainer, { backgroundColor: c.fondoSecundario }]}>
            <View style={styles.desgloseHeader}>
              <Text style={[styles.desgloseTitulo, { color: c.texto }]}>
                {desgloseTipo === 'pendiente' ? '💳 A pagar' : '🔄 Ciclo en curso'}
              </Text>
              <TouchableOpacity onPress={() => setModalDesglose(false)}>
                <Text style={{ fontSize: 22, color: c.textoSecundario }}>✕</Text>
              </TouchableOpacity>
            </View>
            {desgloseTarjeta && (
              <Text style={[styles.desgloseSubtitulo, { color: c.textoSecundario }]}>
                {desgloseTarjeta.nombre} · {desgloseTipo === 'pendiente'
                  ? `ciclo cerrado el día ${desgloseTarjeta.diaCorte}`
                  : `ciclo abierto desde el día ${desgloseTarjeta.diaCorte}`}
              </Text>
            )}
            <ScrollView style={styles.desgloseScroll} showsVerticalScrollIndicator={false}>
              {desgloseTarjeta && (() => {
                const items = obtenerGastosDesglose(desgloseTarjeta, desgloseTipo);
                if (items.length === 0) return (
                  <Text style={[styles.desgloseSinDatos, { color: c.textoSecundario }]}>No hay gastos en este ciclo</Text>
                );
                const total = items.reduce((s, g) => s + (g.montoEnMonedaBase ?? g.monto), 0);
                return (
                  <>
                    {items.map(g => {
                      const codMoneda = g.moneda || monedaBase?.codigo || 'GTQ';
                      const simOriginal = obtenerSimboloMoneda(codMoneda);
                      const esDivisa = codMoneda !== (monedaBase?.codigo ?? 'GTQ');
                      return (
                        <View key={g.id} style={[styles.desgloseItem, { borderBottomColor: c.bordes }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.desgloseItemDesc, { color: c.texto }]}>{g.descripcion}</Text>
                            <Text style={[styles.desgloseItemFecha, { color: c.textoSecundario }]}>
                              {g.categoria} · {new Date(g.fecha).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.desgloseItemMonto, { color: c.texto }]}>
                              {simOriginal}{g.monto.toFixed(2)}
                            </Text>
                            {esDivisa && g.montoEnMonedaBase != null && (
                              <Text style={[styles.desgloseItemFecha, { color: c.textoSecundario }]}>
                                ≈ {simbolo}{g.montoEnMonedaBase.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                    {/* Totales por moneda al pie del desglose */}
                    {(() => {
                      const { entries, totalEnBase } = obtenerResumenPorMoneda(desgloseTarjeta!, desgloseTipo);
                      const color = desgloseTipo === 'pendiente' ? '#ef4444' : c.primario;
                      return (
                        <View style={[styles.desgloseTotalFila, { borderTopColor: c.bordes }]}>
                          <Text style={[styles.desgloseTotalLabel, { color: c.textoSecundario }]}>Total</Text>
                          <View style={{ alignItems: 'flex-end', gap: 2 }}>
                            {entries.map(([cod, data]) => (
                              <Text key={cod} style={[styles.desgloseTotalMonto, { color }]}>
                                {data.simbolo}{data.monto.toFixed(2)}
                              </Text>
                            ))}
                            {entries.length > 1 && (
                              <Text style={[styles.desgloseItemFecha, { color: c.textoSecundario }]}>
                                ≈ {simbolo}{totalEnBase.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })()}
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 },

  // Chips
  chipsContainer: { gap: 10, paddingBottom: 16, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 2,
    gap: 8,
    maxWidth: 160,
  },
  chipAccent: { width: 8, height: 8, borderRadius: 4 },
  chipNombre: { fontSize: 13, fontWeight: '600', flex: 1 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },

  // Spotlight card
  spotlight: {
    borderRadius: 20,
    height: 200,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  decoCirculoGrande: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -50,
  },
  decoCirculoPequeno: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 80,
    right: 40,
  },
  spotlightAcciones: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 1,
  },
  spotlightBoton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightBotonTexto: { fontSize: 16 },
  spotlightContenido: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  spotlightBanco: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  spotlightNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  spotlightDigitos: { alignItems: 'center' },
  spotlightDigitosTexto: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
  },
  spotlightFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
  },
  spotlightFechaLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  spotlightFechaValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotlightEstadoBadge: {
    flex: 1,
    alignItems: 'flex-end',
  },
  spotlightEstadoTexto: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Panel financiero
  panel: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  panelFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  panelFilaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  panelFilaRight: { alignItems: 'flex-end', gap: 4 },
  panelDot: { width: 8, height: 8, borderRadius: 4 },
  panelEtiqueta: { fontSize: 13, fontWeight: '600' },
  panelSubetiqueta: { fontSize: 11, marginTop: 2 },
  panelMonto: { fontSize: 16, fontWeight: 'bold' },
  panelDetalle: { fontSize: 11, fontWeight: '600' },
  utilizacionContainer: { padding: 16 },
  utilizacionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  utilizacionPct: { fontSize: 13, fontWeight: 'bold' },
  utilizacionTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  utilizacionFill: { height: 6, borderRadius: 3 },
  utilizacionDetalle: { fontSize: 11 },
  botonPagar: {
    margin: 12,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonPagarTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // Cuotas
  cuotasCard: { borderRadius: 16, borderWidth: 2, marginBottom: 12 },
  cuotasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cuotasHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cuotasHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cuotasIcono: { fontSize: 22 },
  cuotasTitulo: { fontSize: 15, fontWeight: '600' },
  cuotasConteo: { fontSize: 15, fontWeight: 'bold' },
  cuotasSubtitulo: { fontSize: 12, marginTop: 2 },
  cuotasChevron: { fontSize: 12, fontWeight: 'bold' },
  botonAgregarCuota: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  botonAgregarCuotaTexto: { fontSize: 12, fontWeight: '600' },
  cuotasLista: { borderTopWidth: 1 },
  cuotaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  cuotaInfo: { flex: 1 },
  cuotaDescripcion: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cuotaDetalle: { fontSize: 12, marginBottom: 8 },
  progresoBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progresoFill: { height: 4, borderRadius: 2 },
  botonRegistrarPago: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  botonRegistrarPagoTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cuotaEliminar: { padding: 4, marginLeft: 8 },
  cuotaEliminarTexto: { fontSize: 16, color: '#ef4444', fontWeight: 'bold' },

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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabTexto: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },

  espacioInferior: { height: 20 },

  // Modal desglose
  desgloseOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  desgloseContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  desgloseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  desgloseTitulo: { fontSize: 18, fontWeight: 'bold' },
  desgloseSubtitulo: { fontSize: 12, marginBottom: 14 },
  desgloseScroll: { maxHeight: 400 },
  desgloseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  desgloseItemDesc: { fontSize: 14, fontWeight: '500' },
  desgloseItemFecha: { fontSize: 11, marginTop: 2 },
  desgloseItemMonto: { fontSize: 14, fontWeight: 'bold' },
  desgloseTotalFila: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 4, borderTopWidth: 2, marginTop: 4 },
  desgloseTotalLabel: { fontSize: 13, fontWeight: '600' },
  desgloseTotalMonto: { fontSize: 16, fontWeight: 'bold' },
  desgloseSinDatos: { textAlign: 'center', paddingVertical: 30, fontSize: 14 },
});
