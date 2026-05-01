import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useState, useRef, startTransition } from 'react';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';
import { useEstadisticas } from '../hooks';
import { GraficaPastel } from '../components/GraficaPastel';
import { GraficaLineas } from '../components/GraficaLineas';
import { ProximoMesPanel } from '../components/ProximoMesPanel';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface DistribucionProps {
  datosPastel: Array<{ categoriaId: string; total: number }>;
  comparativaPorCategoria: Array<{ categoriaId: string; nombre: string; emoji: string; datos: Array<{ label: string; total: number }> }>;
  c: ReturnType<typeof useTema>['tema']['colores'];
}

const DistribucionMesCard = ({ datosPastel, comparativaPorCategoria, c }: DistribucionProps) => {
  const [historialId, setHistorialId] = useState<string | null>(null);
  const hasInteracted = useRef(false);
  const historial = historialId ? comparativaPorCategoria.find(x => x.categoriaId === historialId) : null;

  const handleSelect = (id: string | null) => {
    hasInteracted.current = true;
    startTransition(() => setHistorialId(id));
  };

  return (
    <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitulo, { color: c.texto }]}>Distribución del mes</Text>
        {!hasInteracted.current && (
          <Text style={[styles.cardSubtitulo, { color: c.textoSecundario }]}>Toca un segmento</Text>
        )}
      </View>
      <GraficaPastel
        datos={datosPastel}
        onSelect={handleSelect}
      />
      {historial && (
        <View style={[styles.historialSection, { borderTopColor: c.bordes }]}>
          <Text style={[styles.historialTitulo, { color: c.texto }]}>
            {historial.emoji} {historial.nombre} · últimos 6 meses
          </Text>
          <LineChart
            data={{
              labels: historial.datos.map(d => d.label),
              datasets: [{
                data: historial.datos.map(d => d.total || 0),
                color: () => c.primario,
                strokeWidth: 2,
              }],
            }}
            width={screenWidth - 64}
            height={170}
            chartConfig={{
              backgroundColor: c.fondoSecundario,
              backgroundGradientFrom: c.fondoSecundario,
              backgroundGradientTo: c.fondoSecundario,
              decimalPlaces: 0,
              color: () => c.textoSecundario,
              labelColor: () => c.textoSecundario,
              propsForDots: { r: '4', strokeWidth: '2', stroke: c.primario },
            }}
            bezier
            withShadow={false}
            withInnerLines={false}
            style={{ borderRadius: 10, marginTop: 12 }}
          />
        </View>
      )}
    </View>
  );
};

export const EstadisticasScreen = () => {
  const { tema } = useTema();
  const c = tema.colores;
  const { gastos } = useGastos();
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo ?? '$';

  const {
    gastosPorCategoriaMes,
    resumenMes,
    promedioDiario,
    topGastos,
    tendenciaMensual,
    gastoPorDiaSemana,
    comparativaPorCategoria,
  } = useEstadisticas(gastos, categorias);


  // ─── Proyección de fin de mes ────────────────────────────────────────────────

  const hoy = new Date();
  const diasTranscurridos = hoy.getDate();
  const diasTotalesMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diasRestantes = diasTotalesMes - diasTranscurridos;
  const proyeccionFinMes = diasTranscurridos > 0
    ? resumenMes.gastos + (resumenMes.gastos / diasTranscurridos) * diasRestantes
    : 0;

  // Gasto mes anterior aproximado desde promedioDiario
  const diasMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  const gastoMesAnteriorAprox = promedioDiario.mesAnterior * diasMesAnterior;

  const diferenciaProy = gastoMesAnteriorAprox > 0
    ? ((proyeccionFinMes - gastoMesAnteriorAprox) / gastoMesAnteriorAprox) * 100
    : 0;
  const proyMejora = diferenciaProy < 0;
  const colorProy = proyMejora ? '#10b981' : diferenciaProy > 10 ? '#ef4444' : '#f59e0b';

  // ─── Día más caro ────────────────────────────────────────────────────────────

  const diasConDatos = gastoPorDiaSemana.dias.filter(d => d.cantidad > 0);
  const diaMasCaro = gastoPorDiaSemana.totalTransacciones >= 14 && diasConDatos.length > 0
    ? diasConDatos.reduce((max, d) => d.promedio > max.promedio ? d : max)
    : null;
  const maxPromedioDia = diasConDatos.length > 0 ? Math.max(...diasConDatos.map(d => d.promedio)) : 1;

  // ─── Pie chart + historial integrado ─────────────────────────────────────────

  const datosPastel = gastosPorCategoriaMes
    .filter(cat => cat.total > 0)
    .map(cat => ({ categoriaId: cat.id, total: cat.total }));

  // ─── Tendencia 7 días ────────────────────────────────────────────────────────

  const datosLineas = (() => {
    const resultado = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      const totalDia = gastos
        .filter(g => {
          const fg = new Date(g.fecha); fg.setHours(0, 0, 0, 0);
          return fg.getTime() === fecha.getTime() && g.tipo === 'gasto';
        })
        .reduce((s, g) => s + g.monto, 0);
      resultado.push({ fecha: fecha.toISOString(), total: totalDia });
    }
    return resultado;
  })();

  const hayDatosTendencia = tendenciaMensual.some(t => t.ingresos > 0 || t.gastos > 0);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: c.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── 1. Proyección del mes ── */}
        {resumenMes.gastos > 0 && (
          <View style={[styles.proyeccionCard, { backgroundColor: c.primario }]}>
            {/* Decoración */}
            <View style={styles.proyDecoBig} />
            <View style={styles.proyDecoSmall} />

            <View style={styles.proyContenido}>
              <Text style={styles.proyTitulo}>Proyección fin de mes</Text>
              <Text style={styles.proyMonto}>{simbolo}{proyeccionFinMes.toFixed(0)}</Text>
              <Text style={styles.proyDetalle}>
                Llevas {simbolo}{resumenMes.gastos.toFixed(0)} · día {diasTranscurridos} de {diasTotalesMes}
              </Text>

              <View style={styles.proyFila}>
                <View style={[styles.proyChip, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
                  <Text style={styles.proyChipTexto}>
                    {simbolo}{promedioDiario.actual.toFixed(2)}/día promedio
                  </Text>
                </View>
                {gastoMesAnteriorAprox > 0 && (
                  <View style={[styles.proyChip, { backgroundColor: `${colorProy}30` }]}>
                    <Text style={[styles.proyChipTexto, { color: colorProy }]}>
                      {proyMejora ? '↓' : '↑'} {Math.abs(diferenciaProy).toFixed(0)}% vs mes anterior
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── 2. Compromisos del mes siguiente ── */}
        <ProximoMesPanel />

        {/* ── 3. Tendencia últimos 7 días ── */}
        {gastos.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitulo, { color: c.texto }]}>Últimos 7 días</Text>
              <Text style={[styles.cardSubtitulo, { color: c.textoSecundario }]}>Gasto diario</Text>
            </View>
            <GraficaLineas datos={datosLineas} />
          </View>
        )}

        {/* ── 3. Evolución mensual ── */}
        {hayDatosTendencia && (
          <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitulo, { color: c.texto }]}>Evolución 6 meses</Text>
              <View style={styles.leyendaRow}>
                <View style={styles.leyendaItem}>
                  <View style={[styles.leyendaDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.leyendaTexto, { color: c.textoSecundario }]}>Ingresos</Text>
                </View>
                <View style={styles.leyendaItem}>
                  <View style={[styles.leyendaDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={[styles.leyendaTexto, { color: c.textoSecundario }]}>Gastos</Text>
                </View>
              </View>
            </View>
            <LineChart
              data={{
                labels: tendenciaMensual.map(t => t.mes),
                datasets: [
                  {
                    data: tendenciaMensual.map(t => t.ingresos),
                    color: () => '#10b981',
                    strokeWidth: 2,
                  },
                  {
                    data: tendenciaMensual.map(t => t.gastos),
                    color: () => '#ef4444',
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: c.fondoSecundario,
                backgroundGradientFrom: c.fondoSecundario,
                backgroundGradientTo: c.fondoSecundario,
                decimalPlaces: 0,
                color: () => c.textoSecundario,
                labelColor: () => c.textoSecundario,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                },
              }}
              bezier
              withShadow={false}
              withInnerLines={false}
              style={{ borderRadius: 10 }}
            />
          </View>
        )}

        {/* ── 4. Distribución del mes + historial por categoría ── */}
        {datosPastel.length > 0 && (
          <DistribucionMesCard
            datosPastel={datosPastel}
            comparativaPorCategoria={comparativaPorCategoria}
            c={c}
          />
        )}

        {/* ── 6. Patrón semanal ── */}
        {gastoPorDiaSemana.totalTransacciones >= 14 && (
          <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitulo, { color: c.texto }]}>Patrón semanal</Text>
              <Text style={[styles.cardSubtitulo, { color: c.textoSecundario }]}>Promedio por día</Text>
            </View>

            {diaMasCaro && gastoPorDiaSemana.promedioGlobal > 0 && (
              <View style={[styles.insightBanner, { backgroundColor: `${c.primario}15`, borderColor: `${c.primario}40` }]}>
                <Text style={styles.insightIcono}>💡</Text>
                <Text style={[styles.insightTexto, { color: c.texto }]}>
                  Los{' '}
                  <Text style={{ fontWeight: 'bold', color: c.primario }}>{diaMasCaro.nombre}</Text>
                  {' '}gastas{' '}
                  <Text style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                    {Math.round((diaMasCaro.promedio / gastoPorDiaSemana.promedioGlobal - 1) * 100)}%
                  </Text>
                  {' '}más que el promedio semanal
                </Text>
              </View>
            )}

            <View style={styles.diasContainer}>
              {gastoPorDiaSemana.dias.map((d, i) => {
                const esMasCaro = diaMasCaro?.nombre === d.nombre;
                const pct = maxPromedioDia > 0 ? d.promedio / maxPromedioDia : 0;
                const tieneDatos = d.cantidad > 0;
                return (
                  <View key={i} style={styles.diaFila}>
                    <Text style={[
                      styles.diaNombre,
                      { color: esMasCaro ? c.primario : c.textoSecundario },
                    ]}>
                      {d.nombre}
                    </Text>
                    <View style={[styles.diaTrack, { backgroundColor: c.bordes }]}>
                      {tieneDatos && (
                        <View style={[
                          styles.diaFill,
                          {
                            width: `${pct * 100}%`,
                            backgroundColor: esMasCaro ? c.primario : `${c.textoSecundario}88`,
                          },
                        ]} />
                      )}
                    </View>
                    <Text style={[
                      styles.diaValor,
                      { color: esMasCaro ? c.primario : c.textoSecundario },
                    ]}>
                      {tieneDatos ? `${simbolo}${d.promedio.toFixed(0)}` : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 7. Top 5 gastos del mes ── */}
        {topGastos.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitulo, { color: c.texto }]}>Top gastos del mes</Text>
              <Text style={[styles.cardSubtitulo, { color: c.textoSecundario }]}>Los más grandes</Text>
            </View>
            {topGastos.map((gasto, idx) => {
              const cat = categorias.find(cat => cat.id === gasto.categoria);
              const medallas = ['🥇', '🥈', '🥉', '4°', '5°'];
              return (
                <View
                  key={gasto.id}
                  style={[
                    styles.topItem,
                    { borderBottomColor: c.bordes },
                    idx === topGastos.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.topMedalla}>{medallas[idx]}</Text>
                  <Text style={styles.topEmoji}>{cat?.emoji ?? '💸'}</Text>
                  <View style={styles.topInfo}>
                    <Text style={[styles.topDesc, { color: c.texto }]} numberOfLines={1}>
                      {gasto.descripcion}
                    </Text>
                    <Text style={[styles.topMeta, { color: c.textoSecundario }]}>
                      {cat?.nombre ?? ''} · {new Date(gasto.fecha).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={[styles.topMonto, { color: '#ef4444' }]}>
                    {simbolo}{(gasto.montoEnMonedaBase ?? gasto.monto).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Estado vacío */}
        {gastos.filter(g => g.tipo === 'gasto').length === 0 && (
          <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
            <Text style={[styles.vacio, { color: c.textoSecundario }]}>
              Registra algunos gastos para ver tus estadísticas aquí.
            </Text>
          </View>
        )}

        <View style={styles.espacioInferior} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40 },

  // ── Proyección card ──
  proyeccionCard: {
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  proyDecoBig: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    right: -60,
  },
  proyDecoSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40,
    left: -30,
  },
  proyContenido: {
    padding: 22,
  },
  proyTitulo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  proyMonto: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: -1,
  },
  proyDetalle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 16,
  },
  proyFila: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  proyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proyChipTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Cards genéricas ──
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardSubtitulo: {
    fontSize: 12,
    flexShrink: 0,
    marginLeft: 8,
  },

  // ── Leyenda ──
  leyendaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  leyendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leyendaTexto: {
    fontSize: 11,
  },

  // ── Chips selector ──
  chipsScroll: { marginBottom: 4 },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 5,
  },
  chipEmoji: { fontSize: 15 },
  chipTexto: { fontSize: 12, fontWeight: '600' },

  // ── Insight banner ──
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  insightIcono: { fontSize: 16, marginTop: 1 },
  insightTexto: { fontSize: 13, lineHeight: 20, flex: 1 },

  // ── Barras por día ──
  diasContainer: { gap: 10 },
  diaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diaNombre: {
    fontSize: 12,
    fontWeight: '600',
    width: 32,
  },
  diaTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  diaFill: {
    height: 10,
    borderRadius: 5,
  },
  diaValor: {
    fontSize: 12,
    fontWeight: '600',
    width: 58,
    textAlign: 'right',
  },

  // ── Top gastos ──
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 10,
  },
  topMedalla: { fontSize: 18, width: 28, textAlign: 'center' },
  topEmoji: { fontSize: 26 },
  topInfo: { flex: 1 },
  topDesc: { fontSize: 14, fontWeight: '600' },
  topMeta: { fontSize: 12, marginTop: 2 },
  topMonto: { fontSize: 15, fontWeight: 'bold' },

  // ── Historial integrado ──
  historialSection: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  historialTitulo: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  // ── Misc ──
  vacio: { fontSize: 14, textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 },
  espacioInferior: { height: 20 },
});
