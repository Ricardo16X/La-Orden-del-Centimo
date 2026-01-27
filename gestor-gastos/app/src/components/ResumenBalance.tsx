import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useBalance } from '../context/BalanceContext';
import { useMonedas } from '../context/MonedasContext';

export const ResumenBalance = () => {
  const { tema } = useTema();
  const { resumen } = useBalance();
  const { monedaBase } = useMonedas();
  const { balance, tendencia, cambioMensual } = resumen;
  const [mostrarDesglose, setMostrarDesglose] = useState(false);
  const simbolo = monedaBase?.simbolo || '';

  // Iconos y colores según tendencia
  const getTendenciaInfo = () => {
    switch (tendencia) {
      case 'positiva':
        return { icono: '📈', color: '#10b981', texto: 'Mejorando' };
      case 'negativa':
        return { icono: '📉', color: '#ef4444', texto: 'Descendiendo' };
      default:
        return { icono: '➡️', color: '#6b7280', texto: 'Estable' };
    }
  };

  const tendenciaInfo = getTendenciaInfo();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setMostrarDesglose(!mostrarDesglose)}
        activeOpacity={0.7}
      >
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          💰 Balance General
        </Text>
        <Text style={[styles.iconoToggle, { color: tema.colores.textoSecundario }]}>
          {mostrarDesglose ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Balance Principal - Siempre visible */}
      <View
        style={[styles.balanceCard, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}
      >
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, { color: tema.colores.textoSecundario }]}>
              💵 Disponible
            </Text>
            <Text style={[styles.balanceValor, {
              color: balance.balanceDisponible >= 0 ? '#10b981' : '#ef4444'
            }]}>
              {simbolo}{balance.balanceDisponible.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, { color: tema.colores.textoSecundario }]}>
              🎯 En Metas
            </Text>
            <Text style={[styles.balanceValor, { color: '#3b82f6' }]}>
              {simbolo}{balance.totalReservado.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Tendencia - Solo cuando está expandido */}
        {mostrarDesglose && cambioMensual !== 0 && (
          <View style={[styles.tendenciaContainer, {
            backgroundColor: `${tendenciaInfo.color}15`,
            borderColor: tendenciaInfo.color,
          }]}>
            <Text style={styles.tendenciaIcono}>{tendenciaInfo.icono}</Text>
            <Text style={[styles.tendenciaTexto, { color: tendenciaInfo.color }]}>
              {tendenciaInfo.texto} {Math.abs(cambioMensual).toFixed(1)}% vs mes anterior
            </Text>
          </View>
        )}
      </View>

      {/* Desglose - Colapsable */}
      {mostrarDesglose && (
        <View style={styles.desglose}>
          <View style={styles.desgloseItem}>
            <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>
              Total Ingresos
            </Text>
            <Text style={[styles.desgloseValor, { color: '#10b981' }]}>
              +{simbolo}{balance.totalIngresos.toFixed(2)}
            </Text>
          </View>

          <View style={styles.desgloseItem}>
            <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>
              Total Gastos
            </Text>
            <Text style={[styles.desgloseValor, { color: '#ef4444' }]}>
              -{simbolo}{balance.totalGastos.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.divisorLinea, { backgroundColor: tema.colores.bordes }]} />

          <View style={styles.desgloseItem}>
            <Text style={[styles.desgloseLabel, { color: tema.colores.texto, fontWeight: 'bold' }]}>
              Balance Total
            </Text>
            <Text style={[styles.desgloseValor, {
              color: balance.balanceTotal >= 0 ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
            }]}>
              {simbolo}{balance.balanceTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
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
  balanceCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  divisor: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValor: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tendenciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tendenciaIcono: {
    fontSize: 16,
    marginRight: 6,
  },
  tendenciaTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  desglose: {
    gap: 10,
    marginTop: 10,
  },
  desgloseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desgloseLabel: {
    fontSize: 13,
  },
  desgloseValor: {
    fontSize: 15,
    fontWeight: '600',
  },
  divisorLinea: {
    height: 1,
    marginVertical: 5,
  },
});
