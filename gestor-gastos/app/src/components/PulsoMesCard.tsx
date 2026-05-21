import { View, Text, StyleSheet } from 'react-native';
import { memo, useMemo } from 'react';
import { useTema } from '../context/TemaContext';
import { useBalance } from '../context/BalanceContext';
import { useGastos } from '../context/GastosContext';
import { useMonedas } from '../context/MonedasContext';
import { useCuotas } from '../context/CuotasContext';

export const PulsoMesCard = memo(() => {
  const { tema } = useTema();
  const c = tema.colores;
  const { resumen } = useBalance();
  const { gastos } = useGastos();
  const { monedaBase } = useMonedas();
  const { obtenerTotalCuotasMensual } = useCuotas();
  const sim = monedaBase?.simbolo || '$';

  const { balance, tendencia, cambioMensual } = resumen;

  const gastosMes = useMemo(() => {
    const ahora = new Date();
    return gastos
      .filter(g => {
        if (g.esTransferencia || g.tipo !== 'gasto') return false;
        const f = new Date(g.fecha);
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
      })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);
  }, [gastos]);

  const hoy = new Date();
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diaActual = hoy.getDate();
  const diasRestantes = diasEnMes - diaActual;
  const pctMes = diaActual / diasEnMes;

  const totalCuotasMensual = obtenerTotalCuotasMensual();

  const tendenciaInfo = tendencia === 'positiva'
    ? { emoji: '📈', color: '#10b981', label: `+${Math.abs(cambioMensual).toFixed(0)}%` }
    : tendencia === 'negativa'
      ? { emoji: '📉', color: '#ef4444', label: `-${Math.abs(cambioMensual).toFixed(0)}%` }
      : null;

  return (
    <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
      {/* Balance hero */}
      <View style={styles.balanceRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.balanceLabel, { color: c.textoSecundario }]}>
            💵 Balance disponible
          </Text>
          <Text style={[styles.balanceValor, {
            color: balance.balanceDisponible >= 0 ? '#10b981' : '#ef4444',
          }]}>
            {sim}{balance.balanceDisponible.toFixed(2)}
          </Text>
        </View>
        {tendenciaInfo && (
          <View style={[styles.tendenciaBadge, { backgroundColor: tendenciaInfo.color + '18' }]}>
            <Text style={styles.tendenciaEmoji}>{tendenciaInfo.emoji}</Text>
            <Text style={[styles.tendenciaLabel, { color: tendenciaInfo.color }]}>
              {tendenciaInfo.label}
            </Text>
            <Text style={[styles.tendenciaHint, { color: tendenciaInfo.color }]}>vs mes ant.</Text>
          </View>
        )}
      </View>

      {/* Barra de progreso del mes */}
      <View style={styles.mesBarra}>
        <View style={[styles.mesBarraTrack, { backgroundColor: c.bordes + '60' }]}>
          <View style={[styles.mesBarraFill, {
            width: `${Math.round(pctMes * 100)}%`,
            backgroundColor: c.primario + '55',
          }]} />
        </View>
        <Text style={[styles.mesLabel, { color: c.textoSecundario }]}>
          Día {diaActual} de {diasEnMes}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Gasto del mes</Text>
          <Text style={[styles.statValor, { color: c.texto }]}>
            {sim}{gastosMes.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.divisorV, { backgroundColor: c.bordes }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Días restantes</Text>
          <Text style={[styles.statValor, { color: c.texto }]}>{diasRestantes}</Text>
        </View>
        {totalCuotasMensual > 0 && (
          <>
            <View style={[styles.divisorV, { backgroundColor: c.bordes }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.textoSecundario }]}>Cuotas/mes</Text>
              <Text style={[styles.statValor, { color: '#8b5cf6' }]}>
                {sim}{totalCuotasMensual.toFixed(0)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceValor: {
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  tendenciaBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 64,
  },
  tendenciaEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  tendenciaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tendenciaHint: {
    fontSize: 10,
    marginTop: 1,
    opacity: 0.8,
  },
  mesBarra: {
    marginBottom: 14,
  },
  mesBarraTrack: {
    height: 5,
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  mesBarraFill: {
    height: 5,
    borderRadius: 3,
  },
  mesLabel: {
    fontSize: 11,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 3,
    textAlign: 'center',
  },
  statValor: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  divisorV: {
    width: 1,
    height: 36,
    marginHorizontal: 4,
  },
});
