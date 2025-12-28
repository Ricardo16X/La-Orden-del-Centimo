import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useMetas } from '../context/MetasContext';
import { formatearTiempoRestante, formatearAhorroRequerido } from '../utils/date';

export const ResumenMetas = () => {
  const { tema } = useTema();
  const { metas, obtenerEstadisticasMeta } = useMetas();

  // Filtrar solo metas en progreso
  const metasActivas = metas.filter(m => m.estado === 'en_progreso');

  if (metasActivas.length === 0) return null;

  // Ordenar por porcentaje de completado (más cercanas a completarse primero)
  const metasOrdenadas = metasActivas
    .map(meta => ({
      ...meta,
      stats: obtenerEstadisticasMeta(meta.id),
    }))
    .filter(m => m.stats !== null)
    .sort((a, b) => (b.stats?.porcentajeCompletado || 0) - (a.stats?.porcentajeCompletado || 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          🎯 Metas de Ahorro {metasActivas.length > 0 && `(${metasActivas.length})`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carruselContainer}
      >
        {metasOrdenadas.map(({ id, nombre, icono, color, montoActual, montoObjetivo, stats }) => {
          if (!stats) return null;

          return (
            <View
              key={id}
              style={[styles.metaCard, {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: color,
              }]}
            >
              <View style={styles.metaHeader}>
                <Text style={styles.icono}>{icono}</Text>
                <Text style={[styles.porcentaje, { color: color }]}>
                  {Math.round(stats.porcentajeCompletado)}%
                </Text>
              </View>

              <Text style={[styles.nombre, { color: tema.colores.texto }]} numberOfLines={1}>
                {nombre}
              </Text>

              <Text style={[styles.monto, { color: tema.colores.textoSecundario }]}>
                ${montoActual.toFixed(0)} / ${montoObjetivo.toFixed(0)}
              </Text>

              <View style={styles.barraContainer}>
                <View
                  style={[styles.barraProgreso, {
                    width: `${Math.min(stats.porcentajeCompletado, 100)}%`,
                    backgroundColor: color,
                  }]}
                />
              </View>

              <View style={styles.statsColumn}>
                <Text style={[styles.statTexto, { color: tema.colores.textoSecundario }]} numberOfLines={1}>
                  ⏱ {formatearTiempoRestante(stats.diasRestantes)}
                </Text>
                <Text style={[styles.statTexto, { color: tema.colores.textoSecundario }]} numberOfLines={1}>
                  💰 {formatearAhorroRequerido(stats.diasRestantes, stats.ahorroRequeridoDiario, stats.ahorroRequeridoMensual)}
                </Text>
              </View>

              {!stats.enTiempo && (
                <View style={[styles.alerta, {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#ef4444',
                }]}>
                  <Text style={styles.alertaTexto} numberOfLines={2}>
                    ⚠️ Retrasado
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  carruselContainer: {
    paddingRight: 20,
    gap: 12,
  },
  metaCard: {
    width: 200,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginRight: 12,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  icono: {
    fontSize: 32,
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  monto: {
    fontSize: 12,
    marginBottom: 8,
  },
  porcentaje: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  barraContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 3,
  },
  statsColumn: {
    gap: 4,
  },
  statTexto: {
    fontSize: 11,
    fontWeight: '500',
  },
  alerta: {
    marginTop: 6,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  alertaTexto: {
    fontSize: 10,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
});
