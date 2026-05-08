import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useCategorias } from '../context/CategoriasContext';
import { useGastos } from '../context/GastosContext';
import { useCategoriasPopulares } from '../hooks';
import { ModalSeleccionarCategoria } from './ModalSeleccionarCategoria';
import { TipoTransaccion } from '../types';

interface Props {
  categoriaSeleccionada: string;
  onSeleccionar: (id: string) => void;
  tipoTransaccion?: TipoTransaccion;
}

export const SelectorCategoria = ({ categoriaSeleccionada, onSeleccionar, tipoTransaccion }: Props) => {
  const { tema } = useTema();
  const { categorias } = useCategorias();
  const { gastos } = useGastos();
  const [modalVisible, setModalVisible] = useState(false);

  const categoriasFiltradas = tipoTransaccion
    ? categorias.filter(c => c.tipo === tipoTransaccion || c.tipo === 'ambos')
    : categorias;

  const idsPopulares = useCategoriasPopulares(gastos, categorias, 5, tipoTransaccion);
  const categoriasAMostrar = idsPopulares
    .map(id => categoriasFiltradas.find(c => c.id === id))
    .filter(Boolean) as typeof categorias;

  if (!categorias || categorias.length === 0) return null;

  return (
    <View>
      <Text style={[styles.label, { color: tema.colores.primario }]}>Categoría:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {categoriasAMostrar.map(categoria => (
          <TouchableOpacity
            key={categoria.id}
            style={[
              styles.boton,
              {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: categoriaSeleccionada === categoria.id ? categoria.color : tema.colores.bordes,
                borderWidth: categoriaSeleccionada === categoria.id ? 3 : 2,
              },
            ]}
            onPress={() => onSeleccionar(categoria.id)}
          >
            <Text style={styles.emoji}>{categoria.emoji}</Text>
            <Text style={[styles.nombre, { color: tema.colores.texto }]}>{categoria.nombre}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.boton, styles.botonVerTodas, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.primario,
          }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.iconoVerTodas}>⋯</Text>
          <Text style={[styles.nombre, { color: tema.colores.primario }]}>Ver todas</Text>
        </TouchableOpacity>
      </ScrollView>

      <ModalSeleccionarCategoria
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSeleccionar={onSeleccionar}
        categorias={categoriasFiltradas}
        categoriaSeleccionada={categoriaSeleccionada}
      />
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
  scroll: { marginBottom: 15 },
  boton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  botonVerTodas: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  emoji: { fontSize: 24, marginBottom: 5 },
  iconoVerTodas: { fontSize: 28, marginBottom: 2 },
  nombre: { fontSize: 11, textAlign: 'center' },
});
