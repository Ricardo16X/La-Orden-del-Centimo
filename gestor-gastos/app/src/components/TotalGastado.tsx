import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  total: number;
}

export const TotalGastado = ({ total }: Props) => {
  const { tema } = useTema();
  
  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.acento,
      borderColor: tema.colores.primario,
    }]}>
      <Text style={[styles.texto, { color: tema.colores.primario }]}>
        Oro Gastado:
      </Text>
      <Text style={[styles.monto, { color: tema.colores.primarioClaro }]}>
        {total.toFixed(2)} {tema.moneda}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  texto: {
    fontSize: 16,
  },
  monto: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});