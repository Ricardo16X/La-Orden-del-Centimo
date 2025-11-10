import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { obtenerCategorias } from '../constants/categorias';

interface Props {
  categoriaSeleccionada: string;
  onSeleccionar: (id: string) => void;
}

export const SelectorCategoria = ({ categoriaSeleccionada, onSeleccionar }: Props) => {
  const { tema } = useTema();
  const categorias = obtenerCategorias(tema?.id || 'medieval', tema?.categorias);
  
  // Protección adicional
  if (!categorias || categorias.length === 0) {
    return null;
  }
  
  return (
    <View>
      <Text style={[styles.label, { color: tema.colores.primario }]}>Categoría:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {categorias.map(categoria => (
          <TouchableOpacity
            key={categoria.id}
            style={[
              styles.boton,
              {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: categoriaSeleccionada === categoria.id 
                  ? categoria.color 
                  : tema.colores.bordes,
              },
              categoriaSeleccionada === categoria.id && styles.seleccionada,
            ]}
            onPress={() => onSeleccionar(categoria.id)}
          >
            <Text style={styles.emoji}>{categoria.emoji}</Text>
            <Text style={[styles.nombre, { color: tema.colores.texto }]}>
              {categoria.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  scroll: {
    marginBottom: 15,
  },
  boton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 100,
  },
  seleccionada: {
    transform: [{ scale: 1.05 }],
  },
  emoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  nombre: {
    fontSize: 11,
    textAlign: 'center',
  },
});