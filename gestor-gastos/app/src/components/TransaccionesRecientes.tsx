import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';

export const TransaccionesRecientes = () => {
  const { tema } = useTema();
  const { gastos } = useGastos();
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo || '$';

  const recientes = useMemo(() => {
    return [...gastos]
      .filter(g => !g.esTransferencia)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [gastos]);

  if (recientes.length === 0) return null;

  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        🕐 Últimas transacciones
      </Text>
      <View style={[styles.card, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
        {recientes.map((gasto, index) => {
          const categoria = categorias.find(c => c.id === gasto.categoria);
          const esIngreso = gasto.tipo === 'ingreso';
          const monto = gasto.montoEnMonedaBase ?? gasto.monto;
          const fecha = new Date(gasto.fecha);
          const fechaLabel =
            fecha.toDateString() === hoy.toDateString() ? 'Hoy' :
            fecha.toDateString() === ayer.toDateString() ? 'Ayer' :
            fecha.toLocaleDateString('es', { day: 'numeric', month: 'short' });

          return (
            <View key={gasto.id}>
              {index > 0 && <View style={[styles.separador, { backgroundColor: tema.colores.bordes }]} />}
              <View style={styles.fila}>
                <Text style={styles.emoji}>{categoria?.emoji ?? '📦'}</Text>
                <View style={styles.info}>
                  <Text style={[styles.descripcion, { color: tema.colores.texto }]} numberOfLines={1}>
                    {gasto.descripcion || categoria?.nombre || 'Sin descripción'}
                  </Text>
                  <Text style={[styles.meta, { color: tema.colores.textoSecundario }]}>
                    {categoria?.nombre ?? 'Sin categoría'} · {fechaLabel}
                  </Text>
                </View>
                <Text style={[styles.monto, { color: esIngreso ? '#10b981' : '#ef4444' }]}>
                  {esIngreso ? '+' : '-'}{simbolo}{monto.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  emoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  descripcion: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  monto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  separador: {
    height: 1,
  },
});
