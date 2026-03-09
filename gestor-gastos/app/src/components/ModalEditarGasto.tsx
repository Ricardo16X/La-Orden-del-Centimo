import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SelectorCategoria } from './SelectorCategoria';
import { ModalBase } from './ModalBase';
import { useTema } from '../context/TemaContext';
import { Gasto } from '../types';
import { formatearFechaCompacta } from '../utils/date';

interface Props {
  visible: boolean;
  gasto: Gasto | null;
  onClose: () => void;
  onEditar: (id: string, monto: number, descripcion: string, categoria: string, nota: string) => void;
  onEliminar: (id: string) => void;
}

export const ModalEditarGasto = ({ visible, gasto, onClose, onEditar, onEliminar }: Props) => {
  const { tema } = useTema();
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [nota, setNota] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('comida');

  useEffect(() => {
    if (gasto) {
      setMonto(gasto.monto.toString());
      setDescripcion(gasto.descripcion);
      setNota(gasto.nota || '');
      setCategoriaSeleccionada(gasto.categoria);
    }
  }, [gasto]);

  const handleGuardar = () => {
    if (!monto || !descripcion || !gasto) {
      Alert.alert('Error', 'Llena todos los campos');
      return;
    }

    onEditar(gasto.id, parseFloat(monto), descripcion, categoriaSeleccionada, nota.trim());
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
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={gasto.tipo === 'ingreso' ? '💰 Editar Ingreso' : '✏️ Editar Gasto'}
      position="center"
      maxHeight="85%"
    >
      <View style={[styles.formulario, {
        backgroundColor: tema.colores.fondoSecundario,
        borderColor: tema.colores.bordes,
      }]}>
        <Text style={[styles.label, { color: tema.colores.primario }]}>Monto</Text>
        <TextInput
          style={[styles.input, {
            borderColor: tema.colores.bordes,
            backgroundColor: tema.colores.fondo,
            color: tema.colores.texto,
          }]}
          placeholder={`Cantidad de ${tema.moneda}`}
          placeholderTextColor={tema.colores.textoSecundario}
          keyboardType="numeric"
          value={monto}
          onChangeText={setMonto}
        />

        <Text style={[styles.label, { color: tema.colores.primario }]}>Descripción</Text>
        <TextInput
          style={[styles.input, {
            borderColor: tema.colores.bordes,
            backgroundColor: tema.colores.fondo,
            color: tema.colores.texto,
          }]}
          placeholder="¿En qué lo gastaste?"
          placeholderTextColor={tema.colores.textoSecundario}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={[styles.label, { color: tema.colores.primario }]}>Nota (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputNota, {
            borderColor: tema.colores.bordes,
            backgroundColor: tema.colores.fondo,
            color: tema.colores.texto,
          }]}
          placeholder="Agrega contexto adicional"
          placeholderTextColor={tema.colores.textoSecundario}
          value={nota}
          onChangeText={setNota}
          multiline
          numberOfLines={2}
          maxLength={200}
          textAlignVertical="top"
        />

        <SelectorCategoria
          categoriaSeleccionada={categoriaSeleccionada}
          onSeleccionar={setCategoriaSeleccionada}
        />

        <Text style={[styles.fecha, { color: tema.colores.textoSecundario }]}>
          Registrado: {formatearFechaCompacta(gasto.fecha)}
        </Text>

        <TouchableOpacity
          style={[styles.botonGuardar, {
            backgroundColor: tema.colores.acento,
            borderColor: tema.colores.primario,
          }]}
          onPress={handleGuardar}
        >
          <Text style={styles.botonTexto}>
            💾 Guardar Cambios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
          <Text style={styles.botonEliminarTexto}>🗑️ Eliminar {gasto.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</Text>
        </TouchableOpacity>
      </View>
    </ModalBase>
  );
};

const styles = StyleSheet.create({
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
  inputNota: {
    minHeight: 50,
    fontSize: 14,
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
    color: '#fff',
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
