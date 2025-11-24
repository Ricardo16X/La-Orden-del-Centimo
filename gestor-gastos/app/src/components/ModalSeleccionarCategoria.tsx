import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { Categoria } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSeleccionar: (id: string) => void;
  categorias: Categoria[];
  categoriaSeleccionada: string;
}

export const ModalSeleccionarCategoria = ({
  visible,
  onClose,
  onSeleccionar,
  categorias,
  categoriaSeleccionada,
}: Props) => {
  const { tema } = useTema();

  const handleSeleccionar = (id: string) => {
    onSeleccionar(id);
    onClose();
  };

  // Separar categorías predeterminadas y personalizadas
  const predeterminadas = categorias.filter(c => !c.esPersonalizada);
  const personalizadas = categorias.filter(c => c.esPersonalizada);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              🏷️ Seleccionar Categoría
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {predeterminadas.length > 0 && (
              <>
                <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                  Predeterminadas
                </Text>
                <View style={styles.grid}>
                  {predeterminadas.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoriaBoton,
                        {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: categoriaSeleccionada === cat.id
                            ? cat.color
                            : tema.colores.bordes,
                        },
                        categoriaSeleccionada === cat.id && styles.seleccionada,
                      ]}
                      onPress={() => handleSeleccionar(cat.id)}
                    >
                      <Text style={styles.emoji}>{cat.emoji}</Text>
                      <Text
                        style={[styles.nombre, { color: tema.colores.texto }]}
                        numberOfLines={1}
                      >
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {personalizadas.length > 0 && (
              <>
                <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                  Mis Categorías
                </Text>
                <View style={styles.grid}>
                  {personalizadas.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoriaBoton,
                        {
                          backgroundColor: tema.colores.fondoSecundario,
                          borderColor: categoriaSeleccionada === cat.id
                            ? cat.color
                            : tema.colores.bordes,
                        },
                        categoriaSeleccionada === cat.id && styles.seleccionada,
                      ]}
                      onPress={() => handleSeleccionar(cat.id)}
                    >
                      <Text style={styles.emoji}>{cat.emoji}</Text>
                      <Text
                        style={[styles.nombre, { color: tema.colores.texto }]}
                        numberOfLines={1}
                      >
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoriaBoton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  seleccionada: {
    transform: [{ scale: 0.95 }],
    borderWidth: 3,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  nombre: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
});
