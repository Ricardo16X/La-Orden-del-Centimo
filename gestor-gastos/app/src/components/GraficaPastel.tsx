import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';

interface Props {
  datos: Array<{
    categoriaId: string;
    total: number;
  }>;
}

export const GraficaPastel = ({ datos }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();

  if (datos.length === 0) {
    return (
      <View style={styles.vacio}>
        <Text style={[styles.textoVacio, { color: tema.colores.textoSecundario }]}>
          No hay datos para mostrar
        </Text>
      </View>
    );
  }

  // Preparar datos para la gráfica
  const colores = [
    '#3b82f6', // Azul
    '#ef4444', // Rojo
    '#10b981', // Verde
    '#f59e0b', // Amarillo
    '#8b5cf6', // Morado
    '#ec4899', // Rosa
    '#14b8a6', // Teal
    '#f97316', // Naranja
    '#06b6d4', // Cyan
    '#84cc16', // Lima
  ];

  const datosGrafica = datos.map((item, index) => {
    const categoria = categorias.find(c => c.id === item.categoriaId);
    return {
      name: categoria?.nombre || 'Sin categoría',
      amount: item.total,
      color: colores[index % colores.length],
      legendFontColor: tema.colores.texto,
      legendFontSize: 12,
    };
  }).sort((a, b) => b.amount - a.amount).slice(0, 10); // Top 10

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => tema.colores.texto,
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <PieChart
        data={datosGrafica}
        width={screenWidth - 60}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
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
