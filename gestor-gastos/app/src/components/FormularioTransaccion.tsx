import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { SelectorMoneda } from './SelectorMoneda';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useFormGasto } from '../hooks';
import { TipoTransaccion } from '../types';

interface Props {
  tipo: TipoTransaccion;
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string) => void;
}

const CONFIG = {
  gasto: {
    placeholder: '¿En qué lo gastaste?',
    botonTexto: 'Registrar Gasto',
    botonEmoji: '📜',
  },
  ingreso: {
    placeholder: '¿De dónde viene?',
    botonTexto: 'Registrar Ingreso',
    botonEmoji: '💰',
  },
};

export const FormularioTransaccion = ({ tipo, onAgregar }: Props) => {
  const { tema } = useTema();
  const { monedaBase } = useMonedas();
  const config = CONFIG[tipo];

  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>('');

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
    nota,
    setNota,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleSubmit,
    resetForm,
  } = useFormGasto((monto, descripcion, categoria, nota) => {
    onAgregar(monto, descripcion, categoria, monedaSeleccionada, nota);
  });

  const handleAgregar = () => {
    const success = handleSubmit();
    if (success) {
      resetForm();
      setMonedaSeleccionada(monedaBase?.codigo || '');
    }
  };

  const esIngreso = tipo === 'ingreso';

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: esIngreso ? tema.colores.primario : tema.colores.bordes,
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
        placeholder={config.placeholder}
        placeholderTextColor={tema.colores.textoSecundario}
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={[styles.input, styles.inputNota, {
          borderColor: tema.colores.bordes,
          backgroundColor: tema.colores.fondo,
          color: tema.colores.texto,
        }]}
        placeholder="Agrega una nota (opcional)"
        placeholderTextColor={tema.colores.textoSecundario}
        value={nota}
        onChangeText={setNota}
        multiline
        numberOfLines={2}
        maxLength={200}
        textAlignVertical="top"
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
          backgroundColor: esIngreso ? tema.colores.primarioClaro : tema.colores.acento,
          borderColor: tema.colores.primario,
        }]}
        onPress={handleAgregar}
      >
        <Text style={[styles.botonTexto, {
          color: esIngreso ? tema.colores.fondo : tema.colores.primarioClaro
        }]}>
          {config.botonEmoji} {config.botonTexto}
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
  inputNota: {
    minHeight: 50,
    fontSize: 14,
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
