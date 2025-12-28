import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { useTema } from '../context/TemaContext';
import { useFormGasto } from '../hooks';

interface Props {
  onAgregar: (monto: number, descripcion: string, categoria: string) => void;
}

export const FormularioGasto = ({ onAgregar }: Props) => {
  const { tema } = useTema();

  const {
    monto,
    setMonto,
    descripcion,
    setDescripcion,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleSubmit,
    resetForm,
  } = useFormGasto(onAgregar);

  const handleAgregar = () => {
    const success = handleSubmit();
    if (success) {
      resetForm();
    }
  };

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.bordes,
    }]}>
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
          📜 Registrar Gasto
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