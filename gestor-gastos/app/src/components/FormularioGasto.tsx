import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { useTema } from '../context/TemaContext';

interface Props {
  onAgregar: (monto: number, descripcion: string, categoria: string) => void;
}

export const FormularioGasto = ({ onAgregar }: Props) => {
  const { tema } = useTema();
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('comida');

  const handleAgregar = () => {
    if (!monto || !descripcion) {
      Alert.alert('Error', 'Llena todos los campos');
      return;
    }

    onAgregar(parseFloat(monto), descripcion, categoriaSeleccionada);
    setMonto('');
    setDescripcion('');
  };

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.bordes,
    }]}>
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

      <TouchableOpacity 
        style={[styles.boton, {
          backgroundColor: tema.colores.acento,
          borderColor: tema.colores.primario,
        }]} 
        onPress={handleAgregar}
      >
        <Text style={[styles.botonTexto, { color: tema.colores.primarioClaro }]}>
          📜 Registrar en el Diario
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  boton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});