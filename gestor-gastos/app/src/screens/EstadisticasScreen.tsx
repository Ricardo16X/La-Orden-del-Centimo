import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';
import { useEstadisticas } from '../hooks';
import { GraficaPastel } from '../components/GraficaPastel';
import { GraficaLineas } from '../components/GraficaLineas';
import { StackedBarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const EstadisticasScreen = () => {
  const { tema } = useTema();
  const { gastos } = useGastos();
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();
  const {
    gastosPorCategoria,
    resumenMes,
    promedioDiario,
    topGastos,
    tendenciaMensual,
  } = useEstadisticas(gastos, categorias);

  const simbolo = monedaBase?.simbolo || 'Q';

  // Preparar datos para gráfica de pastel
  const datosPastel = gastosPorCategoria
    .filter(cat => cat.total > 0)
    .map(cat => ({
      categoriaId: cat.id,
      total: cat.total,
    }));

  // Preparar datos para gráfica de líneas (últimos 7 días)
  const datosLineas = (() => {
    const hoy = new Date();
    const ultimos7Dias = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      fecha.setHours(0, 0, 0, 0);

      const gastosDelDia = gastos.filter(g => {
        const fechaGasto = new Date(g.fecha);
        fechaGasto.setHours(0, 0, 0, 0);
        return fechaGasto.getTime() === fecha.getTime() && g.tipo === 'gasto';
      });

      const totalDia = gastosDelDia.reduce((sum, g) => sum + g.monto, 0);

      ultimos7Dias.push({
        fecha: fecha.toISOString(),
        total: totalDia,
      });
    }

    return ultimos7Dias;
  })();

  // Verificar si hay datos en la tendencia mensual
  const hayDatosTendencia = tendenciaMensual.some(t => t.ingresos > 0 || t.gastos > 0);

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        📊 Estadísticas
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumen del Mes */}
        <View style={[styles.seccion, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
            📋 Resumen del Mes
          </Text>
          <View style={styles.resumenGrid}>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>Ingresos</Text>
              <Text style={[styles.resumenValor, { color: '#10b981' }]}>
                {simbolo}{resumenMes.ingresos.toFixed(2)}
              </Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>Gastos</Text>
              <Text style={[styles.resumenValor, { color: '#ef4444' }]}>
                {simbolo}{resumenMes.gastos.toFixed(2)}
              </Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>Ahorro</Text>
              <Text style={[styles.resumenValor, { color: resumenMes.ahorro >= 0 ? '#3b82f6' : '#ef4444' }]}>
                {simbolo}{resumenMes.ahorro.toFixed(2)}
              </Text>
            </View>
            {resumenMes.cambioVsMesAnterior !== 0 && (
              <View style={styles.resumenItem}>
                <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>vs mes anterior</Text>
                <Text style={[styles.resumenValor, { color: resumenMes.cambioVsMesAnterior > 0 ? '#ef4444' : '#10b981' }]}>
                  {resumenMes.cambioVsMesAnterior > 0 ? '📈 +' : '📉 '}{resumenMes.cambioVsMesAnterior.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Promedio Diario */}
        <View style={[styles.seccion, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
            💰 Promedio Diario
          </Text>
          <Text style={[styles.promedioValor, { color: tema.colores.texto }]}>
            {simbolo}{promedioDiario.actual.toFixed(2)}
          </Text>
          {promedioDiario.mesAnterior > 0 && (
            <Text style={[styles.promedioComparacion, { color: tema.colores.textoSecundario }]}>
              Mes anterior: {simbolo}{promedioDiario.mesAnterior.toFixed(2)}/día
            </Text>
          )}
        </View>

        {/* Comparativa Mensual */}
        {hayDatosTendencia && (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
              📊 Comparativa Mensual
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <StackedBarChart
                data={{
                  labels: tendenciaMensual.map(t => t.mes),
                  legend: ['Ingresos', 'Gastos'],
                  data: tendenciaMensual.map(t => [t.ingresos, t.gastos]),
                  barColors: ['#10b981', '#ef4444'],
                }}
                width={Math.max(screenWidth - 60, tendenciaMensual.length * 70)}
                height={220}
                chartConfig={{
                  backgroundColor: tema.colores.fondoSecundario,
                  backgroundGradientFrom: tema.colores.fondoSecundario,
                  backgroundGradientTo: tema.colores.fondoSecundario,
                  decimalPlaces: 0,
                  color: (opacity = 1) => tema.colores.texto,
                  labelColor: (opacity = 1) => tema.colores.textoSecundario,
                }}
                style={{ borderRadius: 10 }}
                hideLegend={true}
              />
            </ScrollView>
            <View style={styles.leyenda}>
              <View style={styles.leyendaItem}>
                <View style={[styles.leyendaColor, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.leyendaTexto, { color: tema.colores.textoSecundario }]}>Ingresos</Text>
              </View>
              <View style={styles.leyendaItem}>
                <View style={[styles.leyendaColor, { backgroundColor: '#ef4444' }]} />
                <Text style={[styles.leyendaTexto, { color: tema.colores.textoSecundario }]}>Gastos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfica de Tendencia */}
        {gastos.length > 0 && (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
              📈 Tendencia (Últimos 7 días)
            </Text>
            <GraficaLineas datos={datosLineas} />
          </View>
        )}

        {/* Gráfica de Pastel por Categoría */}
        {datosPastel.length > 0 && (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
              Distribución por Categoría
            </Text>
            <GraficaPastel datos={datosPastel} />
          </View>
        )}

        {/* Top 5 Gastos del Mes */}
        {topGastos.length > 0 && (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
              🏆 Top 5 Gastos del Mes
            </Text>
            {topGastos.map((gasto, index) => {
              const cat = categorias.find(c => c.id === gasto.categoria);
              return (
                <View key={gasto.id} style={[styles.categoriaItem, {
                  borderBottomColor: tema.colores.bordes,
                }]}>
                  <Text style={styles.topRango}>{index + 1}</Text>
                  <Text style={styles.categoriaEmoji}>{cat?.emoji || '💸'}</Text>
                  <View style={styles.categoriaInfo}>
                    <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                      {gasto.descripcion}
                    </Text>
                    <Text style={[styles.categoriaDetalle, { color: tema.colores.textoSecundario }]}>
                      {new Date(gasto.fecha).toLocaleDateString('es')}
                    </Text>
                  </View>
                  <Text style={[styles.topMonto, { color: '#ef4444' }]}>
                    {simbolo}{(gasto.montoEnMonedaBase || gasto.monto).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Estadísticas por Categoría */}
        {gastosPorCategoria.length > 0 ? (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
              🏷️ Por Categoría
            </Text>
            {gastosPorCategoria.map(cat => (
              <View key={cat.id} style={[styles.categoriaItem, {
                borderBottomColor: tema.colores.bordes
              }]}>
                <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                <View style={styles.categoriaInfo}>
                  <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                    {cat.nombre}
                  </Text>
                  <Text style={[styles.categoriaDetalle, { color: tema.colores.textoSecundario }]}>
                    {`${cat.cantidad} ${cat.cantidad === 1 ? 'gasto' : 'gastos'} • ${simbolo}${cat.total.toFixed(2)}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.seccion, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
              No hay gastos registrados todavía.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  seccion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // Resumen del mes
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resumenItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  resumenLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Promedio diario
  promedioValor: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  promedioComparacion: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Leyenda de gráfico de barras
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  leyendaTexto: {
    fontSize: 12,
  },
  // Top gastos
  topRango: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginRight: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  topMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Categorías
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoriaEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriaDetalle: {
    fontSize: 14,
    marginTop: 2,
  },
  vacio: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
