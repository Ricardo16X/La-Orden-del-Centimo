import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { SelectorCategoria } from './SelectorCategoria';
import { SelectorMoneda } from './SelectorMoneda';
import { SelectorFecha } from './SelectorFecha';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useFormGasto } from '../hooks';
import { useMetodoPagoSugerido } from '../hooks/useMetodoPagoSugerido';
import { TipoTransaccion } from '../types';
import { useTarjetas } from '../context/TarjetasContext';

interface Props {
  tipo: TipoTransaccion;
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => void;
}

const CONFIG = {
  gasto:   { placeholder: '¿En qué lo gastaste?', botonTexto: 'Registrar Gasto',   botonEmoji: '📜' },
  ingreso: { placeholder: '¿De dónde viene?',     botonTexto: 'Registrar Ingreso', botonEmoji: '💰' },
};

export const FormularioTransaccion = ({ tipo, onAgregar }: Props) => {
  const { tema } = useTema();
  const c = tema.colores;
  const { monedaBase } = useMonedas();
  const { tarjetas } = useTarjetas();
  const { registrarUso, obtenerSugerido } = useMetodoPagoSugerido();
  const config = CONFIG[tipo];
  const esGasto = tipo === 'gasto';
  const tieneTarjetas = esGasto && tarjetas.length > 0;

  const [monedaSeleccionada, setMonedaSeleccionada] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (monedaBase && !monedaSeleccionada) setMonedaSeleccionada(monedaBase.codigo);
  }, [monedaBase]);

  const {
    monto, setMonto,
    descripcion, setDescripcion,
    nota, setNota,
    fecha, setFecha,
    tarjetaId, setTarjetaId,
    categoriaSeleccionada, setCategoriaSeleccionada,
    handleSubmit, resetForm,
  } = useFormGasto((monto, descripcion, categoria, nota, fecha, tarjetaId) => {
    onAgregar(monto, descripcion, categoria, monedaSeleccionada, nota, fecha, tarjetaId);
  });

  // Aplicar sugerencia inteligente al cambiar categoría (solo gastos)
  useEffect(() => {
    if (!esGasto || !tieneTarjetas) return;
    setTarjetaId(obtenerSugerido(categoriaSeleccionada));
  }, [categoriaSeleccionada]);

  const handleAgregar = () => {
    const success = handleSubmit();
    if (success) {
      if (esGasto) registrarUso(categoriaSeleccionada, tarjetaId);
      resetForm();
      setMonedaSeleccionada(monedaBase?.codigo || '');
      setPickerVisible(false);
    }
  };

  const seleccionarMetodo = (id?: string) => {
    setTarjetaId(id);
    setPickerVisible(false);
  };

  const tarjetaActiva = tarjetas.find(t => t.id === tarjetaId);
  const metodoLabel = tarjetaActiva ? tarjetaActiva.nombre : 'Efectivo';
  const metodoColor = tarjetaActiva ? tarjetaActiva.color : undefined;

  return (
    <View style={[styles.container, {
      backgroundColor: c.fondoSecundario,
      borderColor: esGasto ? c.bordes : c.primario,
    }]}>
      <TextInput
        style={[styles.input, { borderColor: c.bordes, backgroundColor: c.fondo, color: c.texto }]}
        placeholder={`Cantidad de ${tema.moneda}`}
        placeholderTextColor={c.textoSecundario}
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      <TextInput
        style={[styles.input, { borderColor: c.bordes, backgroundColor: c.fondo, color: c.texto }]}
        placeholder={config.placeholder}
        placeholderTextColor={c.textoSecundario}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={[styles.input, styles.inputNota, { borderColor: c.bordes, backgroundColor: c.fondo, color: c.texto }]}
        placeholder="Agrega una nota (opcional)"
        placeholderTextColor={c.textoSecundario}
        value={nota}
        onChangeText={setNota}
        multiline
        numberOfLines={2}
        maxLength={200}
        textAlignVertical="top"
      />

      <SelectorFecha fecha={fecha} onChange={setFecha} />
      <SelectorMoneda monedaSeleccionada={monedaSeleccionada} onSeleccionar={setMonedaSeleccionada} />
      <SelectorCategoria categoriaSeleccionada={categoriaSeleccionada} onSeleccionar={setCategoriaSeleccionada} tipoTransaccion={tipo} />

      {/* Picker de método de pago — aparece encima del botón */}
      {pickerVisible && tieneTarjetas && (
        <View style={[styles.picker, { backgroundColor: c.fondo, borderColor: c.bordes }]}>
          <TouchableOpacity
            style={[styles.pickerItem, !tarjetaId && { backgroundColor: c.primario + '18' }]}
            onPress={() => seleccionarMetodo(undefined)}
          >
            <Text style={styles.pickerEmoji}>💵</Text>
            <Text style={[styles.pickerNombre, { color: c.texto }]}>Efectivo</Text>
            {!tarjetaId && <Text style={[styles.pickerCheck, { color: c.primario }]}>✓</Text>}
          </TouchableOpacity>
          {tarjetas.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.pickerItem, tarjetaId === t.id && { backgroundColor: c.primario + '18' }]}
              onPress={() => seleccionarMetodo(t.id)}
            >
              <View style={[styles.pickerDot, { backgroundColor: t.color }]} />
              <Text style={[styles.pickerNombre, { color: c.texto }]}>{t.nombre}</Text>
              {tarjetaId === t.id && <Text style={[styles.pickerCheck, { color: c.primario }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Botón split (gasto con tarjetas) o botón simple (ingreso / sin tarjetas) */}
      {tieneTarjetas ? (
        <View style={styles.botonRow}>
          <TouchableOpacity
            style={[styles.botonPrincipal, { backgroundColor: c.acento, borderColor: c.primario }]}
            onPress={handleAgregar}
          >
            <Text style={[styles.botonTexto, { color: c.primarioClaro }]}>
              {config.botonEmoji} {config.botonTexto}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonMetodo, { backgroundColor: c.acento, borderColor: c.primario, borderLeftColor: c.primario + '50' }]}
            onPress={() => setPickerVisible(v => !v)}
          >
            {metodoColor
              ? <View style={[styles.metodoDot, { backgroundColor: metodoColor }]} />
              : <Text style={styles.metodoEfectivoIcon}>💵</Text>
            }
            <Text style={[styles.metodoFlecha, { color: c.primarioClaro }]}>▾</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.botonSimple, {
            backgroundColor: esGasto ? c.acento : c.primarioClaro,
            borderColor: c.primario,
          }]}
          onPress={handleAgregar}
        >
          <Text style={[styles.botonTexto, { color: esGasto ? c.primarioClaro : c.fondo }]}>
            {config.botonEmoji} {config.botonTexto}
          </Text>
        </TouchableOpacity>
      )}

      {/* Indicador de sugerencia debajo del botón */}
      {tieneTarjetas && !pickerVisible && (
        <Text style={[styles.metodoHint, { color: c.textoSecundario }]}>
          {tarjetaActiva ? `💳 ${metodoLabel}` : `💵 ${metodoLabel}`}
          {obtenerSugerido(categoriaSeleccionada) === tarjetaId && tarjetaId && ' · sugerido'}
        </Text>
      )}
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
  picker: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  pickerEmoji: { fontSize: 16 },
  pickerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickerNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  pickerCheck: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  botonRow: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop: 4,
  },
  botonPrincipal: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderRightWidth: 0,
    borderRadius: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  botonMetodo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 2,
    borderLeftWidth: 1,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    gap: 5,
    minWidth: 60,
  },
  botonSimple: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 4,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metodoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metodoEfectivoIcon: {
    fontSize: 15,
  },
  metodoFlecha: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metodoHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
