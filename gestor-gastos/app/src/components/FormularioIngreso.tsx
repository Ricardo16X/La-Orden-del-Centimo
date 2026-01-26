import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { SelectorMoneda } from './SelectorMoneda';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useFormGasto } from '../hooks';

interface Props {
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string) => void;
}

export const FormularioIngreso = ({ onAgregar }: Props) => {
  const { tema } = useTema();
  const { monedaBase } = useMonedas();

  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>('');

  // Actualizar moneda seleccionada cuando monedaBase cambie (carga inicial)
  useEffect(() => {
    if (monedaBase && !monedaSeleccionada) {
      setMonedaSeleccionada(monedaBase.codigo);
    }
  }, [monedaBase]);

  const {
    monto,
    setMonto,
    descripcion,
    setDescripcion,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleSubmit,
    resetForm,
  } = useFormGasto((monto, descripcion, categoria) => {
    console.log('💵 FormularioIngreso - Enviando:', {
      monto,
      descripcion,
      categoria,
      monedaSeleccionada,
      monedaBase: monedaBase?.codigo,
    });
    onAgregar(monto, descripcion, categoria, monedaSeleccionada);
  });

  const handleAgregar = () => {
    const success = handleSubmit();
    if (success) {
      resetForm();
      setMonedaSeleccionada(monedaBase?.codigo || '');
    }
  };

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.primario,
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
        placeholder="¿De dónde viene?"
        placeholderTextColor={tema.colores.textoSecundario}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <SelectorMoneda
        monedaSeleccionada={monedaSeleccionada}
        onSeleccionar={setMonedaSeleccionada}
      />

      <SelectorCategoria
        categoriaSeleccionada={categoriaSeleccionada}
        onSeleccionar={setCategoriaSeleccionada}
      />

      <TouchableOpacity
        style={[styles.boton, {
          backgroundColor: tema.colores.primarioClaro,
          borderColor: tema.colores.primario,
        }]}
        onPress={handleAgregar}
      >
        <Text style={[styles.botonTexto, { color: tema.colores.fondo }]}>
          💰 Registrar Ingreso
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
