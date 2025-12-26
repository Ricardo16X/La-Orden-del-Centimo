import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useMetas } from '../context/MetasContext';
import { formatearTiempoRestante, formatearAhorroRequerido } from '../utils/date';

export const ResumenMetas = () => {
  const { tema } = useTema();
  const { metas, obtenerEstadisticasMeta } = useMetas();
  const [expandido, setExpandido] = useState(false);

  // Filtrar solo metas en progreso
  const metasActivas = metas.filter(m => m.estado === 'en_progreso');

  if (metasActivas.length === 0) return null;

  // Mostrar solo las 2 metas más cercanas a completarse, o todas si está expandido
  const metasOrdenadas = metasActivas
    .map(meta => ({
      ...meta,
      stats: obtenerEstadisticasMeta(meta.id),
    }))
    .filter(m => m.stats !== null)
    .sort((a, b) => (b.stats?.porcentajeCompletado || 0) - (a.stats?.porcentajeCompletado || 0))
    .slice(0, expandido ? metasActivas.length : 2);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.7}
      >
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          🎯 Metas de Ahorro {metasActivas.length > 0 && `(${metasActivas.length})`}
        </Text>
        {metasActivas.length > 2 && (
          <Text style={[styles.iconoToggle, { color: tema.colores.textoSecundario }]}>
            {expandido ? '▼' : '▶'}
          </Text>
        )}
      </TouchableOpacity>

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
              <View style={styles.metaInfo}>
                <Text style={[styles.nombre, { color: tema.colores.texto }]}>
                  {nombre}
                </Text>
                <Text style={[styles.monto, { color: tema.colores.textoSecundario }]}>
                  ${montoActual.toFixed(2)} de ${montoObjetivo.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.porcentaje, { color: color }]}>
                {Math.round(stats.porcentajeCompletado)}%
              </Text>
            </View>

            <View style={styles.barraContainer}>
              <View
                style={[styles.barraProgreso, {
                  width: `${Math.min(stats.porcentajeCompletado, 100)}%`,
                  backgroundColor: color,
                }]}
              />
            </View>

            <View style={styles.statsRow}>
              <Text style={[styles.statTexto, { color: tema.colores.textoSecundario }]}>
                ⏱ {formatearTiempoRestante(stats.diasRestantes)}
              </Text>
              <Text style={[styles.statTexto, { color: tema.colores.textoSecundario }]}>
                💰 {formatearAhorroRequerido(stats.diasRestantes, stats.ahorroRequeridoDiario, stats.ahorroRequeridoMensual)}
              </Text>
            </View>

            {!stats.enTiempo && (
              <View style={[styles.alerta, {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
              }]}>
                <Text style={styles.alertaTexto}>
                  ⚠️ Estás retrasado. Necesitas aumentar el ahorro diario
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconoToggle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metaCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    marginBottom: 12,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icono: {
    fontSize: 28,
    marginRight: 10,
  },
  metaInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monto: {
    fontSize: 13,
  },
  porcentaje: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  barraContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  alerta: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  alertaTexto: {
    fontSize: 11,
    color: '#ef4444',
    textAlign: 'center',
  },
});
