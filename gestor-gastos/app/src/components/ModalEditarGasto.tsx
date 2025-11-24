import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SelectorCategoria } from './SelectorCategoria';
import { useTema } from '../context/TemaContext';
import { Gasto } from '../types';

interface Props {
  visible: boolean;
  gasto: Gasto | null;
  onClose: () => void;
  onEditar: (id: string, monto: number, descripcion: string, categoria: string) => void;
  onEliminar: (id: string) => void;
}

export const ModalEditarGasto = ({ visible, gasto, onClose, onEditar, onEliminar }: Props) => {
  const { tema } = useTema();
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('comida');

  useEffect(() => {
    if (gasto) {
      setMonto(gasto.monto.toString());
      setDescripcion(gasto.descripcion);
      setCategoriaSeleccionada(gasto.categoria);
    }
  }, [gasto]);

  const handleGuardar = () => {
    if (!monto || !descripcion || !gasto) {
      Alert.alert('Error', 'Llena todos los campos');
      return;
    }

    onEditar(gasto.id, parseFloat(monto), descripcion, categoriaSeleccionada);
    onClose();
  };

  const handleEliminar = () => {
    if (!gasto) return;

    const tipoTexto = gasto.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';

    Alert.alert(
      `Eliminar ${tipoTexto}`,
      `¿Estás seguro de que quieres eliminar este ${tipoTexto.toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            onEliminar(gasto.id);
            onClose();
          }
        }
      ]
    );
  };

  if (!gasto) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.contenido, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              {gasto.tipo === 'ingreso' ? '💰' : '✏️'} Editar {gasto.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={[styles.formulario, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.label, { color: tema.colores.primario }]}>Monto</Text>
              <TextInput
                style={[styles.input, {
                  borderColor: tema.colores.bordes,
                  backgroundColor: tema.colores.texto,
                }]}
                placeholder={`Cantidad de ${tema.moneda}`}
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
              />

              <Text style={[styles.label, { color: tema.colores.primario }]}>Descripción</Text>
              <TextInput
                style={[styles.input, {
                  borderColor: tema.colores.bordes,
                  backgroundColor: tema.colores.texto,
                }]}
                placeholder="¿En qué lo gastaste?"
                value={descripcion}
                onChangeText={setDescripcion}
              />
              
              <SelectorCategoria
                categoriaSeleccionada={categoriaSeleccionada}
                onSeleccionar={setCategoriaSeleccionada}
              />

              <Text style={[styles.fecha, { color: tema.colores.textoSecundario }]}>
                Registrado: {gasto.fecha}
              </Text>

              <TouchableOpacity 
                style={[styles.botonGuardar, {
                  backgroundColor: tema.colores.acento,
                  borderColor: tema.colores.primario,
                }]} 
                onPress={handleGuardar}
              >
                <Text style={[styles.botonTexto, { color: tema.colores.primarioClaro }]}>
                  💾 Guardar Cambios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
                <Text style={styles.botonEliminarTexto}>🗑️ Eliminar Gasto</Text>
              </TouchableOpacity>
            </View>
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
  contenido: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
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
  formulario: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  fecha: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  botonGuardar: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 10,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonEliminar: {
    backgroundColor: '#8b0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  botonEliminarTexto: {
    color: '#ffcccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});