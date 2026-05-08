import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SelectorCategoria } from './SelectorCategoria';
import { SelectorFecha } from './SelectorFecha';
import { SelectorMoneda } from './SelectorMoneda';
import { ModalBase } from './ModalBase';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { Gasto } from '../types';

interface Props {
  visible: boolean;
  gasto: Gasto | null;
  onClose: () => void;
  onEditar: (id: string, monto: number, descripcion: string, categoria: string, nota: string, fecha: string, moneda: string, tarjetaId?: string) => void;
  onEliminar: (id: string) => void;
}

export const ModalEditarGasto = ({ visible, gasto, onClose, onEditar, onEliminar }: Props) => {
  const { tema } = useTema();
  const c = tema.colores;
  const { monedaBase } = useMonedas();
  const { tarjetas } = useTarjetas();

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nota, setNota] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('comida');
  const [fecha, setFecha] = useState(new Date().toISOString());
  const [moneda, setMoneda] = useState(monedaBase?.codigo || '');
  const [tarjetaId, setTarjetaId] = useState<string | undefined>(undefined);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (gasto) {
      setMonto(gasto.monto.toString());
      setDescripcion(gasto.descripcion);
      setNota(gasto.nota || '');
      setCategoriaSeleccionada(gasto.categoria);
      setFecha(gasto.fecha);
      setMoneda(gasto.moneda || monedaBase?.codigo || '');
      setTarjetaId(gasto.tarjetaId);
      setPickerVisible(false);
    }
  }, [gasto]);

  const handleGuardar = () => {
    if (!monto || !descripcion || !gasto) {
      Alert.alert('Error', 'Llena todos los campos');
      return;
    }
    onEditar(gasto.id, parseFloat(monto), descripcion, categoriaSeleccionada, nota.trim(), fecha, moneda, tarjetaId);
    onClose();
  };

  const handleEliminar = () => {
    if (!gasto) return;
    const tipo = gasto.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
    Alert.alert(`Eliminar ${tipo}`, `¿Eliminar este ${tipo.toLowerCase()}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { onEliminar(gasto.id); onClose(); } },
    ]);
  };

  const seleccionarMetodo = (id?: string) => {
    setTarjetaId(id);
    setPickerVisible(false);
  };

  if (!gasto) return null;

  const esGasto = gasto.tipo === 'gasto';
  const tieneTarjetas = esGasto && tarjetas.length > 0;
  const tarjetaActiva = tarjetas.find(t => t.id === tarjetaId);

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={esGasto ? '✏️ Editar Gasto' : '💰 Editar Ingreso'}
      position="center"
      maxHeight="90%"
    >
      <View style={[styles.formulario, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>

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
          placeholder={esGasto ? '¿En qué lo gastaste?' : '¿De dónde viene?'}
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
        <SelectorMoneda monedaSeleccionada={moneda} onSeleccionar={setMoneda} />
        <SelectorCategoria categoriaSeleccionada={categoriaSeleccionada} onSeleccionar={setCategoriaSeleccionada} tipoTransaccion={gasto.tipo} />

        {/* Picker de método de pago */}
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

        {/* Botón guardar — split si hay tarjetas, simple si no */}
        {tieneTarjetas ? (
          <View style={styles.botonRow}>
            <TouchableOpacity
              style={[styles.botonPrincipal, { backgroundColor: c.acento, borderColor: c.primario }]}
              onPress={handleGuardar}
            >
              <Text style={[styles.botonTexto, { color: c.primarioClaro }]}>💾 Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonMetodo, { backgroundColor: c.acento, borderColor: c.primario, borderLeftColor: c.primario + '50' }]}
              onPress={() => setPickerVisible(v => !v)}
            >
              {tarjetaActiva
                ? <View style={[styles.metodoDot, { backgroundColor: tarjetaActiva.color }]} />
                : <Text style={styles.metodoEfectivoIcon}>💵</Text>
              }
              <Text style={[styles.metodoFlecha, { color: c.primarioClaro }]}>▾</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.botonSimple, { backgroundColor: c.acento, borderColor: c.primario }]}
            onPress={handleGuardar}
          >
            <Text style={[styles.botonTexto, { color: c.primarioClaro }]}>💾 Guardar Cambios</Text>
          </TouchableOpacity>
        )}

        {tieneTarjetas && !pickerVisible && (
          <Text style={[styles.metodoHint, { color: c.textoSecundario }]}>
            {tarjetaActiva ? `💳 ${tarjetaActiva.nombre}` : '💵 Efectivo'}
          </Text>
        )}

        <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
          <Text style={styles.botonEliminarTexto}>
            🗑️ Eliminar {esGasto ? 'Gasto' : 'Ingreso'}
          </Text>
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
    marginTop: 12,
    marginBottom: 6,
  },
  botonPrincipal: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderRightWidth: 0,
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
    minWidth: 58,
  },
  botonSimple: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 12,
    marginBottom: 6,
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
  metodoEfectivoIcon: { fontSize: 15 },
  metodoFlecha: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metodoHint: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  botonEliminar: {
    backgroundColor: '#8b0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
    marginTop: 4,
  },
  botonEliminarTexto: {
    color: '#ffcccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
