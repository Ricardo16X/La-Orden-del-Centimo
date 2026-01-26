import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gasto } from '../types';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { useMonedas } from '../context/MonedasContext';
import { formatearFechaCompacta } from '../utils/date';
import { obtenerMonedaPorCodigo } from '../constants/monedas';

interface Props {
  gastos: Gasto[];
  onEliminar: (id: string) => void;
  onEditar?: (gasto: Gasto) => void;
}

export const ListaGastos = ({ gastos, onEliminar, onEditar }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { monedaBase } = useMonedas();

  return (
    <FlatList
      data={gastos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // Buscar la categoría en el contexto (incluye personalizadas y predeterminadas)
        const categoria = categorias.find(cat => cat.id === item.categoria) || categorias[0];

        // Obtener info de la moneda del gasto
        const codigoMoneda = item.moneda || monedaBase?.codigo || 'GTQ';
        const infoMoneda = obtenerMonedaPorCodigo(codigoMoneda);
        const simboloMoneda = infoMoneda?.simbolo || tema.moneda;

        return (
          <TouchableOpacity
            style={[styles.item, {
              borderLeftColor: categoria.color,
              borderLeftWidth: 4,
              backgroundColor: tema?.colores?.fondoSecundario || '#3d2f1f',
              borderColor: tema?.colores?.bordes || '#8b7355',
            }]}
            onPress={() => onEditar && onEditar(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{categoria.emoji}</Text>
            <View style={styles.info}>
              <Text style={[styles.descripcion, { color: tema?.colores?.texto || '#f5deb3' }]}>
                {item.descripcion}
              </Text>
              <Text style={[styles.fecha, { color: tema?.colores?.textoSecundario || '#c9b08a' }]}>
                {formatearFechaCompacta(item.fecha)}
              </Text>
            </View>
            <View style={styles.actions}>
              <Text style={[
                styles.monto,
                {
                  color: item.tipo === 'ingreso'
                    ? '#4ade80'
                    : tema?.colores?.primarioClaro || '#ffd700'
                }
              ]}>
                {item.tipo === 'ingreso' ? '+' : '-'}{simboloMoneda}{item.monto.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <Text style={[styles.vacio, { color: tema?.colores?.textoSecundario || '#c9b08a' }]}>
          Tu diario está vacío. ¡Comienza tu aventura financiera!
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  descripcion: {
    fontSize: 16,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});