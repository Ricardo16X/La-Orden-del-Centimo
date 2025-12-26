import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTema } from '../context/TemaContext';

interface Props {
  datos: Array<{
    fecha: string;
    total: number;
  }>;
  titulo?: string;
}

export const GraficaLineas = ({ datos, titulo }: Props) => {
  const { tema } = useTema();

  if (datos.length === 0) {
    return (
      <View style={styles.vacio}>
        <Text style={[styles.textoVacio, { color: tema.colores.textoSecundario }]}>
          No hay datos para mostrar
        </Text>
      </View>
    );
  }

  // Preparar datos para la gráfica (últimos 7 días)
  const labels = datos.map(d => {
    const fecha = new Date(d.fecha);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
  });

  const values = datos.map(d => d.total);

  const chartData = {
    labels: labels.length > 7 ? labels.slice(-7) : labels,
    datasets: [
      {
        data: values.length > 7 ? values.slice(-7) : values,
        color: (opacity = 1) => tema.colores.primario,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: tema.colores.fondo,
    backgroundGradientFrom: tema.colores.fondoSecundario,
    backgroundGradientTo: tema.colores.fondoSecundario,
    decimalPlaces: 0,
    color: (opacity = 1) => tema.colores.primario,
    labelColor: (opacity = 1) => tema.colores.textoSecundario,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: tema.colores.primario,
    },
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {titulo && (
        <Text style={[styles.titulo, { color: tema.colores.texto }]}>
          {titulo}
        </Text>
      )}
      <LineChart
        data={chartData}
        width={screenWidth - 60}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.grafica}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  grafica: {
    borderRadius: 16,
  },
  vacio: {
    padding: 30,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
