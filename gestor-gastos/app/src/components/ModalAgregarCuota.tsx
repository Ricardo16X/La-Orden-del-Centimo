import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useCuotas } from '../context/CuotasContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  tarjetaId: string;
  nombreTarjeta: string;
}

const CATEGORIAS_CUOTAS = [
  { id: 'electronica', nombre: 'Electrónica', emoji: '📱' },
  { id: 'hogar', nombre: 'Hogar', emoji: '🏠' },
  { id: 'ropa', nombre: 'Ropa', emoji: '👕' },
  { id: 'muebles', nombre: 'Muebles', emoji: '🛋️' },
  { id: 'deportes', nombre: 'Deportes', emoji: '⚽' },
  { id: 'otros', nombre: 'Otros', emoji: '📦' },
];

export const ModalAgregarCuota = ({ visible, onClose, tarjetaId, nombreTarjeta }: Props) => {
  const { tema } = useTema();
  const { agregarCuota } = useCuotas();

  const [descripcion, setDescripcion] = useState('');
  const [comercio, setComercio] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [cuotasPagadas, setCuotasPagadas] = useState('0');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const resetFormulario = () => {
    setDescripcion('');
    setComercio('');
    setMontoTotal('');
    setCantidadCuotas('');
    setCuotasPagadas('0');
    setCategoriaSeleccionada('');
  };

  const handleAgregar = () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción de la compra');
      return;
    }

    const monto = parseFloat(montoTotal);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const cuotas = parseInt(cantidadCuotas);
    if (isNaN(cuotas) || cuotas < 2 || cuotas > 60) {
      Alert.alert('Error', 'El número de cuotas debe ser entre 2 y 60');
      return;
    }

    const pagadas = parseInt(cuotasPagadas);
    if (isNaN(pagadas) || pagadas < 0 || pagadas > cuotas) {
      Alert.alert('Error', `Las cuotas pagadas deben estar entre 0 y ${cuotas}`);
      return;
    }

    agregarCuota({
      tarjetaId,
      descripcion: descripcion.trim(),
      comercio: comercio.trim() || undefined,
      montoTotal: monto,
      cantidadCuotas: cuotas,
      cuotasPagadas: pagadas,
      fechaCompra: new Date().toISOString(),
      categoria: categoriaSeleccionada || undefined,
    });

    resetFormulario();
    Alert.alert(
      'Éxito',
      `Compra a cuotas agregada correctamente\n\nPago mensual: ${tema.moneda}${(monto / cuotas).toFixed(2)}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleCancelar = () => {
    resetFormulario();
    onClose();
  };

  const montoPorCuota = montoTotal && cantidadCuotas
    ? (parseFloat(montoTotal) / parseInt(cantidadCuotas)).toFixed(2)
    : '0.00';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancelar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContainer, { backgroundColor: tema.colores.fondo }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: tema.colores.bordes }]}>
            <View>
              <Text style={[styles.titulo, { color: tema.colores.primario }]}>
                📦 Nueva Compra a Cuotas
              </Text>
              <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
                💳 {nombreTarjeta}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.cerrar, { color: tema.colores.textoSecundario }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Info de la Compra */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                🛒 Información de la Compra
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Descripción:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: iPhone 15 Pro"
                placeholderTextColor={tema.colores.textoSecundario}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Comercio (opcional):</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Apple Store"
                placeholderTextColor={tema.colores.textoSecundario}
                value={comercio}
                onChangeText={setComercio}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Categoría (opcional):</Text>
              <View style={styles.categoriasContainer}>
                {CATEGORIAS_CUOTAS.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoriaSeleccionada(cat.id === categoriaSeleccionada ? '' : cat.id)}
                    style={[
                      styles.categoriaChip,
                      {
                        backgroundColor: cat.id === categoriaSeleccionada
                          ? tema.colores.primario
                          : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }
                    ]}
                  >
                    <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                    <Text style={[
                      styles.categoriaNombre,
                      {
                        color: cat.id === categoriaSeleccionada
                          ? '#fff'
                          : tema.colores.texto
                      }
                    ]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalles Financieros */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                💰 Detalles Financieros
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Monto Total:</Text>
              <View style={styles.inputConPrefijo}>
                <Text style={[styles.prefijo, { color: tema.colores.texto }]}>{tema.moneda}</Text>
                <TextInput
                  style={[styles.inputNumerico, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: tema.colores.bordes,
                    color: tema.colores.texto,
                  }]}
                  placeholder="10000.00"
                  placeholderTextColor={tema.colores.textoSecundario}
                  keyboardType="decimal-pad"
                  value={montoTotal}
                  onChangeText={setMontoTotal}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Cantidad de Cuotas:</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="12"
                    placeholderTextColor={tema.colores.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={cantidadCuotas}
                    onChangeText={setCantidadCuotas}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Cuotas Pagadas:</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="0"
                    placeholderTextColor={tema.colores.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={cuotasPagadas}
                    onChangeText={setCuotasPagadas}
                  />
                </View>
              </View>

              {/* Preview del cálculo */}
              {montoTotal && cantidadCuotas && !isNaN(parseFloat(montoTotal)) && !isNaN(parseInt(cantidadCuotas)) && (
                <View style={[styles.preview, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
                  <Text style={[styles.previewLabel, { color: tema.colores.textoSecundario }]}>
                    💳 Pago mensual:
                  </Text>
                  <Text style={[styles.previewMonto, { color: tema.colores.primario }]}>
                    {tema.moneda}{montoPorCuota}
                  </Text>
                  <Text style={[styles.previewDetalle, { color: tema.colores.textoSecundario }]}>
                    Durante {cantidadCuotas} meses
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={[styles.botones, { borderTopColor: tema.colores.bordes }]}>
            <TouchableOpacity
              onPress={handleCancelar}
              style={[styles.boton, styles.botonCancelar, { borderColor: tema.colores.bordes }]}
            >
              <Text style={[styles.botonTexto, { color: tema.colores.textoSecundario }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAgregar}
              style={[styles.boton, styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
            >
              <Text style={[styles.botonTexto, { color: '#fff' }]}>
                ➕ Agregar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 2,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  seccion: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  inputConPrefijo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefijo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  inputNumerico: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  categoriaEmoji: {
    fontSize: 16,
  },
  categoriaNombre: {
    fontSize: 13,
    fontWeight: '600',
  },
  preview: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewMonto: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDetalle: {
    fontSize: 13,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 2,
  },
  boton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    borderWidth: 2,
  },
  botonAgregar: {
    // backgroundColor viene del tema
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
