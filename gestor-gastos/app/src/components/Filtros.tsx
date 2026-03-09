import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  textoBusqueda: string;
  onBusquedaChange: (texto: string) => void;
  tipoFiltro: 'todos' | 'gasto' | 'ingreso';
  onTipoChange: (tipo: 'todos' | 'gasto' | 'ingreso') => void;
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  totalFiltrados: number;
}

export const Filtros = ({
  textoBusqueda,
  onBusquedaChange,
  tipoFiltro,
  onTipoChange,
  hayFiltrosActivos,
  onLimpiarFiltros,
  totalFiltrados,
}: Props) => {
  const { tema } = useTema();

  const tipos: Array<{ label: string; value: 'todos' | 'gasto' | 'ingreso' }> = [
    { label: 'Todos', value: 'todos' },
    { label: 'Gastos', value: 'gasto' },
    { label: 'Ingresos', value: 'ingreso' },
  ];

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.bordes,
    }]}>
      {/* Buscador */}
      <TextInput
        style={[styles.input, {
          backgroundColor: tema.colores.fondo,
          borderColor: tema.colores.bordes,
          color: tema.colores.texto,
        }]}
        placeholder="Buscar por descripción o nota..."
        placeholderTextColor={tema.colores.textoSecundario}
        value={textoBusqueda}
        onChangeText={onBusquedaChange}
      />

      {/* Filtro de Tipo */}
      <Text style={[styles.label, { color: tema.colores.texto }]}>Tipo:</Text>
      <View style={styles.botones}>
        {tipos.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.boton,
              {
                backgroundColor: tipoFiltro === t.value
                  ? tema.colores.primario
                  : tema.colores.fondo,
                borderColor: tema.colores.bordes,
              }
            ]}
            onPress={() => onTipoChange(t.value)}
          >
            <Text style={[
              styles.botonTexto,
              {
                color: tipoFiltro === t.value
                  ? '#fff'
                  : tema.colores.texto
              }
            ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón limpiar y resultados */}
      <View style={styles.footer}>
        <Text style={[styles.resultados, { color: tema.colores.textoSecundario }]}>
          {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
        </Text>
        {hayFiltrosActivos && (
          <TouchableOpacity onPress={onLimpiarFiltros}>
            <Text style={[styles.limpiar, { color: tema.colores.acento }]}>
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  botones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  boton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  botonTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultados: {
    fontSize: 12,
  },
  limpiar: {
    fontSize: 12,
    fontWeight: '600',
  },
});
