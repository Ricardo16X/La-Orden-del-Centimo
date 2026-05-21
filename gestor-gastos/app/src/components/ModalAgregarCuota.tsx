import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useCuotas } from '../context/CuotasContext';
import { useMonedas } from '../context/MonedasContext';
import { useToast } from '../context/ToastContext';
import { useCategorias } from '../context/CategoriasContext';
import { SelectorFecha } from './SelectorFecha';
import { SelectorMoneda } from './SelectorMoneda';

interface Props {
  visible: boolean;
  onClose: () => void;
  tarjetaId: string;
  nombreTarjeta: string;
}

const CATEGORIAS_EXCLUIDAS = ['ahorro_metas', 'transferencia'];
const CUOTAS_RAPIDAS = [3, 6, 12, 24, 36, 60];

export const ModalAgregarCuota = ({ visible, onClose, tarjetaId, nombreTarjeta }: Props) => {
  const { tema } = useTema();
  const c = tema.colores;
  const { agregarCuota } = useCuotas();
  const { monedaBase } = useMonedas();
  const { showToast } = useToast();
  const { obtenerCategoriasPorTipo } = useCategorias();

  const simbolo = monedaBase?.simbolo ?? 'Q';
  const categorias = obtenerCategoriasPorTipo('gasto').filter(cat => !CATEGORIAS_EXCLUIDAS.includes(cat.id));

  const [descripcion, setDescripcion] = useState('');
  const [comercio, setComercio] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString());
  const [moneda, setMoneda] = useState(monedaBase?.codigo ?? '');
  const [mostrarCuotasPagadas, setMostrarCuotasPagadas] = useState(false);
  const [cuotasPagadas, setCuotasPagadas] = useState('0');
  const [cuotasPersonalizado, setCuotasPersonalizado] = useState(false);

  const resetFormulario = () => {
    setDescripcion('');
    setComercio('');
    setMontoTotal('');
    setCantidadCuotas('');
    setCategoriaSeleccionada('');
    setFecha(new Date().toISOString());
    setMoneda(monedaBase?.codigo ?? '');
    setMostrarCuotasPagadas(false);
    setCuotasPagadas('0');
    setCuotasPersonalizado(false);
  };

  const handleAgregar = () => {
    if (!descripcion.trim()) {
      showToast('Ingresa una descripción de la compra', 'error');
      return;
    }

    const monto = parseFloat(montoTotal);
    if (isNaN(monto) || monto <= 0) {
      showToast('Ingresa un monto válido', 'error');
      return;
    }

    const cuotas = parseInt(cantidadCuotas);
    if (isNaN(cuotas) || cuotas < 2 || cuotas > 60) {
      showToast('El número de cuotas debe ser entre 2 y 60', 'error');
      return;
    }

    const pagadas = mostrarCuotasPagadas ? parseInt(cuotasPagadas) : 0;
    if (isNaN(pagadas) || pagadas < 0 || pagadas >= cuotas) {
      showToast(`Las cuotas pagadas deben estar entre 0 y ${cuotas - 1}`, 'error');
      return;
    }

    agregarCuota({
      tarjetaId,
      descripcion: descripcion.trim(),
      comercio: comercio.trim() || undefined,
      montoTotal: monto,
      cantidadCuotas: cuotas,
      cuotasPagadas: pagadas,
      fechaCompra: fecha,
      categoria: categoriaSeleccionada || undefined,
      moneda: moneda || undefined,
    });

    const cuotaMensual = (monto / cuotas).toFixed(2);
    resetFormulario();
    showToast(`Compra agregada · ${simbolo}${cuotaMensual}/mes`);
    onClose();
  };

  const handleCancelar = () => {
    resetFormulario();
    onClose();
  };

  const monto = parseFloat(montoTotal);
  const cuotas = parseInt(cantidadCuotas);
  const pagadas = mostrarCuotasPagadas ? parseInt(cuotasPagadas) || 0 : 0;
  const calcValido = !isNaN(monto) && !isNaN(cuotas) && monto > 0 && cuotas > 1;
  const montoPorCuota = calcValido ? monto / cuotas : 0;
  const cuotasRestantes = calcValido ? cuotas - pagadas : 0;
  const montoPendiente = calcValido ? montoPorCuota * cuotasRestantes : 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancelar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContainer, { backgroundColor: c.fondo }]}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.bordes }]}>
            <View>
              <Text style={[styles.titulo, { color: c.primario }]}>
                📦 Nueva Compra a Cuotas
              </Text>
              <Text style={[styles.subtitulo, { color: c.textoSecundario }]}>
                💳 {nombreTarjeta}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.cerrar, { color: c.textoSecundario }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Información de la compra */}
            <View style={[styles.seccion, { borderColor: c.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: c.primario }]}>
                🛒 Información de la Compra
              </Text>

              <Text style={[styles.label, { color: c.texto }]}>Descripción:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: iPhone 15 Pro"
                placeholderTextColor={c.textoSecundario}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <Text style={[styles.label, { color: c.texto }]}>Comercio (opcional):</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                placeholder="Ej: Apple Store"
                placeholderTextColor={c.textoSecundario}
                value={comercio}
                onChangeText={setComercio}
              />

              <Text style={[styles.label, { color: c.texto }]}>Fecha de compra:</Text>
              <SelectorFecha fecha={fecha} onChange={setFecha} />

              <Text style={[styles.label, { color: c.texto }]}>Categoría (opcional):</Text>
              <View style={styles.categoriasContainer}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoriaSeleccionada(cat.id === categoriaSeleccionada ? '' : cat.id)}
                    style={[
                      styles.categoriaChip,
                      {
                        backgroundColor: cat.id === categoriaSeleccionada ? c.primario : c.fondoSecundario,
                        borderColor: c.bordes,
                      }
                    ]}
                  >
                    <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoriaNombre, { color: cat.id === categoriaSeleccionada ? '#fff' : c.texto }]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalles financieros */}
            <View style={[styles.seccion, { borderColor: c.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: c.primario }]}>
                💰 Detalles Financieros
              </Text>

              <Text style={[styles.label, { color: c.texto }]}>Monto Total:</Text>
              <View style={styles.inputConPrefijo}>
                <Text style={[styles.prefijo, { color: c.texto }]}>{simbolo}</Text>
                <TextInput
                  style={[styles.inputNumerico, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                  placeholder="10000.00"
                  placeholderTextColor={c.textoSecundario}
                  keyboardType="decimal-pad"
                  value={montoTotal}
                  onChangeText={setMontoTotal}
                />
              </View>

              <Text style={[styles.label, { color: c.texto }]}>Moneda:</Text>
              <SelectorMoneda monedaSeleccionada={moneda} onSeleccionar={setMoneda} />

              <Text style={[styles.label, { color: c.texto }]}>Cantidad de Cuotas:</Text>
              <View style={styles.chipsContainer}>
                {CUOTAS_RAPIDAS.map(n => {
                  const activo = !cuotasPersonalizado && cantidadCuotas === String(n);
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[styles.chip, { backgroundColor: activo ? c.primario : c.fondoSecundario, borderColor: activo ? c.primario : c.bordes }]}
                      onPress={() => { setCantidadCuotas(String(n)); setCuotasPersonalizado(false); }}
                    >
                      <Text style={[styles.chipTexto, { color: activo ? '#fff' : c.texto }]}>{n}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: cuotasPersonalizado ? c.primario : c.fondoSecundario, borderColor: cuotasPersonalizado ? c.primario : c.bordes }]}
                  onPress={() => { setCuotasPersonalizado(true); setCantidadCuotas(''); }}
                >
                  <Text style={[styles.chipTexto, { color: cuotasPersonalizado ? '#fff' : c.texto }]}>otro</Text>
                </TouchableOpacity>
              </View>

              {cuotasPersonalizado && (
                <TextInput
                  style={[styles.input, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto, marginTop: 8 }]}
                  placeholder="Ej: 48"
                  placeholderTextColor={c.textoSecundario}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={cantidadCuotas}
                  onChangeText={setCantidadCuotas}
                  autoFocus
                />
              )}

              {/* Preview — visible en cuanto hay monto y cuotas */}
              {calcValido && (
                <View style={[styles.preview, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
                  <View style={styles.previewFila}>
                    <Text style={[styles.previewLabel, { color: c.textoSecundario }]}>Cuota mensual</Text>
                    <Text style={[styles.previewValorDestacado, { color: c.primario }]}>
                      {simbolo}{montoPorCuota.toFixed(2)}
                    </Text>
                  </View>
                  {pagadas > 0 && (
                    <View style={[styles.previewFila, styles.previewFilaBorde, { borderTopColor: c.bordes }]}>
                      <Text style={[styles.previewLabel, { color: c.textoSecundario }]}>Cuotas restantes</Text>
                      <Text style={[styles.previewValor, { color: c.texto }]}>{cuotasRestantes} de {cuotas}</Text>
                    </View>
                  )}
                  <View style={[styles.previewFila, styles.previewFilaBorde, { borderTopColor: c.bordes }]}>
                    <Text style={[styles.previewLabel, { color: c.textoSecundario }]}>Total a pagar</Text>
                    <Text style={[styles.previewValor, { color: c.texto }]}>{simbolo}{montoPendiente.toFixed(2)}</Text>
                  </View>
                </View>
              )}

              {/* Toggle cuotas ya pagadas — solo para registros retroactivos */}
              <TouchableOpacity
                style={[styles.toggleRetroactivo, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}
                onPress={() => {
                  setMostrarCuotasPagadas(v => !v);
                  if (mostrarCuotasPagadas) setCuotasPagadas('0');
                }}
              >
                <Text style={[styles.toggleEmoji]}>{mostrarCuotasPagadas ? '☑️' : '☐'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleLabel, { color: c.texto }]}>¿Ya pagaste alguna cuota?</Text>
                  <Text style={[styles.toggleHint, { color: c.textoSecundario }]}>
                    Activa esto si estás registrando una compra que ya hiciste
                  </Text>
                </View>
              </TouchableOpacity>

              {mostrarCuotasPagadas && (
                <>
                  <Text style={[styles.label, { color: c.texto }]}>Cuotas ya pagadas:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.fondoSecundario, borderColor: c.bordes, color: c.texto }]}
                    placeholder="0"
                    placeholderTextColor={c.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={cuotasPagadas}
                    onChangeText={setCuotasPagadas}
                  />
                </>
              )}

            </View>
          </ScrollView>

          {/* Botones */}
          <View style={[styles.botones, { borderTopColor: c.bordes }]}>
            <TouchableOpacity
              onPress={handleCancelar}
              style={[styles.boton, styles.botonCancelar, { borderColor: c.bordes }]}
            >
              <Text style={[styles.botonTexto, { color: c.textoSecundario }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAgregar}
              style={[styles.boton, styles.botonAgregar, { backgroundColor: c.primario }]}
            >
              <Text style={[styles.botonTexto, { color: '#fff' }]}>Agregar</Text>
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
    maxHeight: '92%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
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
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
  },
  inputConPrefijo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefijo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputNumerico: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
  },
  categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  categoriaEmoji: {
    fontSize: 15,
  },
  categoriaNombre: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRetroactivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  toggleEmoji: {
    fontSize: 18,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleHint: {
    fontSize: 11,
    marginTop: 2,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 2,
  },
  previewFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  previewFilaBorde: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 9,
  },
  previewLabel: {
    fontSize: 12,
  },
  previewValorDestacado: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  previewValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  boton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    borderWidth: 1.5,
  },
  botonAgregar: {
    // backgroundColor viene del tema vía inline style
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
