import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useGastos } from '../context/GastosContext';
import { useExportar } from '../hooks';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalExportar = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { gastos, totalIngresos, totalGastado, balance } = useGastos();
  const { compartirCSV, compartirResumen } = useExportar();

  const handleExportarCSV = async () => {
    if (gastos.length === 0) {
      Alert.alert('Sin datos', 'No hay gastos para exportar');
      return;
    }

    try {
      await compartirCSV(gastos);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos');
    }
  };

  const handleCompartirResumen = async () => {
    try {
      await compartirResumen(totalIngresos, totalGastado, balance);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el resumen');
    }
  };

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
              📤 Exportar Datos
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contenido}>
            <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
              Elige cómo quieres compartir tus datos
            </Text>

            {/* Botón Exportar CSV */}
            <TouchableOpacity
              style={[styles.opcion, {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: tema.colores.bordes,
              }]}
              onPress={handleExportarCSV}
            >
              <Text style={styles.opcionIcono}>📊</Text>
              <View style={styles.opcionInfo}>
                <Text style={[styles.opcionTitulo, { color: tema.colores.texto }]}>
                  Exportar como CSV
                </Text>
                <Text style={[styles.opcionDescripcion, { color: tema.colores.textoSecundario }]}>
                  Descarga todos tus gastos en formato Excel
                </Text>
              </View>
            </TouchableOpacity>

            {/* Botón Compartir Resumen */}
            <TouchableOpacity
              style={[styles.opcion, {
                backgroundColor: tema.colores.fondoSecundario,
                borderColor: tema.colores.bordes,
              }]}
              onPress={handleCompartirResumen}
            >
              <Text style={styles.opcionIcono}>📱</Text>
              <View style={styles.opcionInfo}>
                <Text style={[styles.opcionTitulo, { color: tema.colores.texto }]}>
                  Compartir Resumen
                </Text>
                <Text style={[styles.opcionDescripcion, { color: tema.colores.textoSecundario }]}>
                  Comparte un resumen por WhatsApp, SMS, etc.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Info */}
            <View style={[styles.infoBox, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.infoTexto, { color: tema.colores.textoSecundario }]}>
                💡 Los datos se compartirán mediante las aplicaciones instaladas en tu dispositivo
              </Text>
            </View>
          </View>

          {/* Botón Cancelar */}
          <TouchableOpacity
            style={[styles.botonCancelar, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}
            onPress={onClose}
          >
            <Text style={[styles.botonCancelarTexto, { color: tema.colores.texto }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contenido: {
    marginBottom: 20,
  },
  descripcion: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  opcionIcono: {
    fontSize: 32,
    marginRight: 15,
  },
  opcionInfo: {
    flex: 1,
  },
  opcionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  opcionDescripcion: {
    fontSize: 12,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  infoTexto: {
    fontSize: 12,
    textAlign: 'center',
  },
  botonCancelar: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
});
