import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { SelectorMoneda } from './SelectorMoneda';
import { SelectorFecha } from './SelectorFecha';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useFormGasto } from '../hooks';
import { TipoTransaccion } from '../types';
import { useTarjetas } from '../context/TarjetasContext';

interface Props {
  tipo: TipoTransaccion;
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => void;
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
  const { tarjetas } = useTarjetas();
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
    fecha,
    setFecha,
    tarjetaId,
    setTarjetaId,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleSubmit,
    resetForm,
  } = useFormGasto((monto, descripcion, categoria, nota, fecha, tarjetaId) => {
    onAgregar(monto, descripcion, categoria, monedaSeleccionada, nota, fecha, tarjetaId);
  });

  const handleAgregar = () => {
    const success = handleSubmit();
    if (success) {
      resetForm();
      setMonedaSeleccionada(monedaBase?.codigo || '');
      setTarjetaId(undefined);
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

      {tipo === 'gasto' && tarjetas.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tarjetasScroll}
        >
          <View style={styles.tarjetasContainer}>
            <TouchableOpacity
              onPress={() => setTarjetaId(undefined)}
              style={[styles.tarjetaChip, {
                backgroundColor: !tarjetaId ? tema.colores.primario : tema.colores.fondoSecundario,
                borderColor: !tarjetaId ? tema.colores.primario : tema.colores.bordes,
              }]}
            >
              <Text style={[styles.tarjetaChipTexto, { color: !tarjetaId ? '#fff' : tema.colores.textoSecundario }]}>
                💵 Efectivo
              </Text>
            </TouchableOpacity>
            {tarjetas.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTarjetaId(t.id)}
                style={[styles.tarjetaChip, {
                  backgroundColor: tarjetaId === t.id ? tema.colores.primario : tema.colores.fondoSecundario,
                  borderColor: tarjetaId === t.id ? tema.colores.primario : tema.colores.bordes,
                }]}
              >
                <View style={[styles.tarjetaDot, { backgroundColor: t.color }]} />
                <Text style={[styles.tarjetaChipTexto, { color: tarjetaId === t.id ? '#fff' : tema.colores.texto }]}>
                  {t.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <SelectorFecha fecha={fecha} onChange={setFecha} />

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
  tarjetasScroll: {
    marginBottom: 10,
  },
  tarjetasContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tarjetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  tarjetaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tarjetaChipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
});
