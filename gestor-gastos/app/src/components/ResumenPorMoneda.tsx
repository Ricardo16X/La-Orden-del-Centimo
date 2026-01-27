import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useMonedas } from '../context/MonedasContext';
import { useMemo } from 'react';

interface SubtotalMoneda {
  codigo: string;
  simbolo: string;
  nombre: string;
  ingresos: number;
  gastos: number;
  balance: number;
  balanceEnMonedaBase: number;
}

export const ResumenPorMoneda = () => {
  const { tema } = useTema();
  const { gastos } = useGastos();
  const { monedas, monedaBase, convertirAMonedaBase } = useMonedas();

  const { subtotalesPorMoneda, totalEnMonedaBase } = useMemo(() => {
    // Agrupar transacciones por moneda
    const agrupados: Record<string, { ingresos: number; gastos: number }> = {};

    gastos.forEach(gasto => {
      const codigoMoneda = gasto.moneda || monedaBase?.codigo || 'GTQ';

      if (!agrupados[codigoMoneda]) {
        agrupados[codigoMoneda] = { ingresos: 0, gastos: 0 };
      }

      if (gasto.tipo === 'ingreso') {
        agrupados[codigoMoneda].ingresos += gasto.monto;
      } else {
        agrupados[codigoMoneda].gastos += gasto.monto;
      }
    });

    // Convertir a array con información de moneda
    const subtotales: SubtotalMoneda[] = Object.keys(agrupados).map(codigo => {
      const moneda = monedas.find(m => m.codigo === codigo);
      const data = agrupados[codigo];
      const balance = data.ingresos - data.gastos;

      return {
        codigo,
        simbolo: moneda?.simbolo || codigo,
        nombre: moneda?.nombre || codigo,
        ingresos: data.ingresos,
        gastos: data.gastos,
        balance,
        balanceEnMonedaBase: convertirAMonedaBase(balance, codigo),
      };
    });

    // Ordenar: moneda base primero, luego alfabéticamente
    subtotales.sort((a, b) => {
      if (a.codigo === monedaBase?.codigo) return -1;
      if (b.codigo === monedaBase?.codigo) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    // Calcular total en moneda base
    const total = subtotales.reduce((sum, s) => sum + s.balanceEnMonedaBase, 0);

    return { subtotalesPorMoneda: subtotales, totalEnMonedaBase: total };
  }, [gastos, monedas, monedaBase, convertirAMonedaBase]);

  if (subtotalesPorMoneda.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        💱 Balance por Moneda
      </Text>

      <View style={[styles.card, {
        backgroundColor: tema.colores.fondoSecundario,
        borderColor: tema.colores.bordes,
      }]}>
        {subtotalesPorMoneda.map((subtotal, index) => (
          <View key={subtotal.codigo}>
            <View style={styles.monedaRow}>
              <View style={styles.monedaHeader}>
                <Text style={[styles.monedaNombre, { color: tema.colores.texto }]}>
                  {subtotal.simbolo} {subtotal.nombre}
                </Text>
                {subtotal.codigo === monedaBase?.codigo && (
                  <View style={[styles.badgeBase, { backgroundColor: tema.colores.primario }]}>
                    <Text style={styles.badgeTexto}>Base</Text>
                  </View>
                )}
              </View>

              <View style={styles.detallesMoneda}>
                <View style={styles.detalleItem}>
                  <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>
                    Ingresos
                  </Text>
                  <Text style={[styles.detalleValor, { color: '#10b981' }]}>
                    +{subtotal.simbolo}{subtotal.ingresos.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.detalleItem}>
                  <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>
                    Gastos
                  </Text>
                  <Text style={[styles.detalleValor, { color: '#ef4444' }]}>
                    -{subtotal.simbolo}{subtotal.gastos.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.detalleItem}>
                  <Text style={[styles.detalleLabel, { color: tema.colores.texto, fontWeight: '600' }]}>
                    Balance
                  </Text>
                  <Text style={[styles.detalleValor, {
                    color: subtotal.balance >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 'bold',
                  }]}>
                    {subtotal.simbolo}{subtotal.balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {index < subtotalesPorMoneda.length - 1 && (
              <View style={[styles.separador, { backgroundColor: tema.colores.bordes }]} />
            )}
          </View>
        ))}

        {/* Total en moneda base */}
        {subtotalesPorMoneda.length > 1 && monedaBase && (
          <>
            <View style={[styles.separadorTotal, { backgroundColor: tema.colores.primario }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: tema.colores.texto }]}>
                Total en {monedaBase.nombre}
              </Text>
              <Text style={[styles.totalValor, {
                color: totalEnMonedaBase >= 0 ? '#10b981' : '#ef4444',
              }]}>
                {monedaBase.simbolo}{totalEnMonedaBase.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
  },
  monedaRow: {
    marginVertical: 8,
  },
  monedaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monedaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeBase: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detallesMoneda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detalleItem: {
    flex: 1,
    alignItems: 'center',
  },
  detalleLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detalleValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  separador: {
    height: 1,
    marginVertical: 8,
  },
  separadorTotal: {
    height: 2,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
