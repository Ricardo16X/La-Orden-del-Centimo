import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  totalIngresos: number;
  totalGastos: number;
}

export const Balance = ({ totalIngresos, totalGastos }: Props) => {
  const { tema } = useTema();
  const balance = totalIngresos - totalGastos;

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.bordes,
    }]}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
            Ingresos
          </Text>
          <Text style={[styles.valor, { color: '#4ade80' }]}>
            +{totalIngresos.toFixed(2)}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
            Gastos
          </Text>
          <Text style={[styles.valor, { color: tema.colores.acento }]}>
            -{totalGastos.toFixed(2)}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
            Balance
          </Text>
          <Text style={[
            styles.valor,
            styles.balance,
            {
              color: balance >= 0
                ? '#4ade80'
                : '#ef4444'
            }
          ]}>
            {balance >= 0 ? '+' : ''}{balance.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={[styles.moneda, { color: tema.colores.primario }]}>
        {tema.moneda}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
  },
  valor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balance: {
    fontSize: 20,
  },
  moneda: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
