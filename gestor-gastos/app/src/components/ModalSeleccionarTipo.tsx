import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSeleccionar: (tipo: 'gasto' | 'ingreso') => void;
}

export const ModalSeleccionarTipo = ({ visible, onClose, onSeleccionar }: Props) => {
  const { tema } = useTema();

  const handleSeleccionar = (tipo: 'gasto' | 'ingreso') => {
    onSeleccionar(tipo);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: tema.colores.fondoSecundario }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.titulo, { color: tema.colores.primario }]}>
            ¿Qué deseas registrar?
          </Text>

          <TouchableOpacity
            style={[styles.opcion, {
              backgroundColor: tema.colores.fondo,
              borderColor: tema.colores.bordes,
            }]}
            onPress={() => handleSeleccionar('gasto')}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>💸</Text>
            <Text style={[styles.textoOpcion, { color: tema.colores.texto }]}>
              Registrar Gasto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.opcion, {
              backgroundColor: tema.colores.fondo,
              borderColor: tema.colores.bordes,
            }]}
            onPress={() => handleSeleccionar('ingreso')}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>💰</Text>
            <Text style={[styles.textoOpcion, { color: tema.colores.texto }]}>
              Registrar Ingreso
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonCancelar, { borderColor: tema.colores.bordes }]}
            onPress={onClose}
          >
            <Text style={[styles.textoCancelar, { color: tema.colores.textoSecundario }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 32,
    marginRight: 15,
  },
  textoOpcion: {
    fontSize: 18,
    fontWeight: '600',
  },
  botonCancelar: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  textoCancelar: {
    fontSize: 16,
    fontWeight: '500',
  },
});
