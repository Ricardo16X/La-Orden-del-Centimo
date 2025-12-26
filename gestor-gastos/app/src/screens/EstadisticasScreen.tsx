import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useCategorias } from '../context/CategoriasContext';
import { useNivel } from '../context/NivelContext';
import { useEstadisticas } from '../hooks';
import { GraficaPastel } from '../components/GraficaPastel';
import { GraficaLineas } from '../components/GraficaLineas';

export const EstadisticasScreen = () => {
  const { tema } = useTema();
  const { gastos, totalIngresos, totalGastado, balance } = useGastos();
  const { categorias } = useCategorias();
  const { datosJugador } = useNivel();
  const { gastosPorCategoria } = useEstadisticas(gastos, categorias);

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

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        📊 Estadísticas
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Estadísticas Generales */}
        <View style={[styles.seccion, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
            💰 Resumen General
          </Text>

          <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
            <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
              Total Ingresos:
            </Text>
            <Text style={[styles.estatValor, { color: '#4ade80' }]}>
              {`+${totalIngresos.toFixed(2)} ${tema.moneda}`}
            </Text>
          </View>

          <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
            <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
              Total Gastos:
            </Text>
            <Text style={[styles.estatValor, { color: tema.colores.acento }]}>
              {`-${totalGastado.toFixed(2)} ${tema.moneda}`}
            </Text>
          </View>

          <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
            <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
              Balance:
            </Text>
            <Text style={[styles.estatValor, { color: balance >= 0 ? '#4ade80' : '#ef4444' }]}>
              {`${balance >= 0 ? '+' : ''}${balance.toFixed(2)} ${tema.moneda}`}
            </Text>
          </View>

          <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
            <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
              Transacciones:
            </Text>
            <Text style={[styles.estatValor, { color: tema.colores.primarioClaro }]}>
              {gastos.length}
            </Text>
          </View>

          <View style={[styles.estadistica, { borderBottomWidth: 0 }]}>
            <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
              Experiencia total:
            </Text>
            <Text style={[styles.estatValor, { color: tema.colores.primarioClaro }]}>
              {`${datosJugador.xp} XP`}
            </Text>
          </View>
        </View>

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
              🍰 Distribución por Categoría
            </Text>
            <GraficaPastel datos={datosPastel} />
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
                    {`${cat.cantidad} ${cat.cantidad === 1 ? 'gasto' : 'gastos'} • ${cat.total.toFixed(2)} ${tema.moneda}`}
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
  estadistica: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  estatLabel: {
    fontSize: 16,
  },
  estatValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
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
