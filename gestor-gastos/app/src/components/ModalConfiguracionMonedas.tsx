/**
 * Modal para configurar monedas del usuario
 * Permite agregar, editar y eliminar monedas, cambiar moneda base
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { MONEDAS_DISPONIBLES, obtenerMonedaPorCodigo } from '../constants/monedas';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalConfiguracionMonedas = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const {
    monedas,
    monedaBase,
    agregarMoneda,
    eliminarMoneda,
    actualizarTipoCambio,
    cambiarMonedaBase,
  } = useMonedas();

  const [modoAgregar, setModoAgregar] = useState(false);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [tipoCambioInput, setTipoCambioInput] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoTipoCambio, setNuevoTipoCambio] = useState('');

  const monedasDisponiblesParaAgregar = MONEDAS_DISPONIBLES.filter(
    m => !monedas.find(mon => mon.codigo === m.codigo)
  );

  const handleAgregarMoneda = async () => {
    if (!codigoSeleccionado) {
      Alert.alert('Error', 'Selecciona una moneda');
      return;
    }

    const tipoCambio = parseFloat(tipoCambioInput);
    if (isNaN(tipoCambio) || tipoCambio <= 0) {
      Alert.alert('Error', 'Ingresa un tipo de cambio válido');
      return;
    }

    try {
      await agregarMoneda(codigoSeleccionado, tipoCambio);
      setModoAgregar(false);
      setCodigoSeleccionado('');
      setTipoCambioInput('');
      Alert.alert('Éxito', 'Moneda agregada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEliminarMoneda = (codigo: string) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar ${codigo}? Esto no afectará tus gastos existentes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMoneda(codigo);
              Alert.alert('Éxito', 'Moneda eliminada');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleActualizarTipoCambio = async (codigo: string) => {
    const tipoCambio = parseFloat(nuevoTipoCambio);
    if (isNaN(tipoCambio) || tipoCambio <= 0) {
      Alert.alert('Error', 'Ingresa un tipo de cambio válido');
      return;
    }

    try {
      await actualizarTipoCambio(codigo, tipoCambio);
      setEditando(null);
      setNuevoTipoCambio('');
      Alert.alert('Éxito', 'Tipo de cambio actualizado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCambiarMonedaBase = (codigo: string) => {
    Alert.alert(
      'Cambiar moneda base',
      `¿Cambiar a ${codigo} como moneda base? Todos los tipos de cambio se recalcularán.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              await cambiarMonedaBase(codigo);
              Alert.alert('Éxito', `${codigo} es ahora tu moneda base`);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.texto }]}>
              💱 Configuración de Monedas
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.primario }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contenido}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info */}
            <View style={[styles.infoBox, { backgroundColor: tema.colores.fondoSecundario }]}>
              <Text style={[styles.infoTexto, { color: tema.colores.textoSecundario }]}>
                Configura hasta 5 monedas. La moneda base sirve para convertir todas tus
                transacciones y mostrar balances consolidados.
              </Text>
            </View>

            {/* Monedas configuradas */}
            <Text style={[styles.subtitulo, { color: tema.colores.texto }]}>
              Tus Monedas
            </Text>

            {monedas.map(moneda => {
              const info = obtenerMonedaPorCodigo(moneda.codigo);
              const estaEditando = editando === moneda.codigo;

              return (
                <View
                  key={moneda.codigo}
                  style={[
                    styles.monedaCard,
                    {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: moneda.esMonedaBase
                        ? tema.colores.primario
                        : tema.colores.bordes,
                      borderWidth: moneda.esMonedaBase ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.monedaInfo}>
                    <Text style={styles.monedaEmoji}>{info?.emoji}</Text>
                    <View style={styles.monedaTextos}>
                      <Text style={[styles.monedaNombre, { color: tema.colores.texto }]}>
                        {moneda.codigo} - {moneda.nombre}
                      </Text>
                      {moneda.esMonedaBase ? (
                        <Text
                          style={[
                            styles.monedaBase,
                            { color: tema.colores.primario },
                          ]}
                        >
                          ⭐ Moneda Base
                        </Text>
                      ) : estaEditando ? (
                        <View style={styles.editarContainer}>
                          <TextInput
                            style={[
                              styles.inputTipoCambio,
                              {
                                color: tema.colores.texto,
                                borderColor: tema.colores.bordes,
                              },
                            ]}
                            value={nuevoTipoCambio}
                            onChangeText={setNuevoTipoCambio}
                            keyboardType="numeric"
                            placeholder={moneda.tipoCambio.toString()}
                            placeholderTextColor={tema.colores.textoSecundario}
                          />
                          <TouchableOpacity
                            onPress={() => handleActualizarTipoCambio(moneda.codigo)}
                            style={[
                              styles.botonGuardar,
                              { backgroundColor: tema.colores.primario },
                            ]}
                          >
                            <Text style={styles.botonGuardarTexto}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEditando(null);
                              setNuevoTipoCambio('');
                            }}
                            style={[
                              styles.botonCancelar,
                              { backgroundColor: tema.colores.bordes },
                            ]}
                          >
                            <Text style={styles.botonCancelarTexto}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.monedaTipoCambio,
                            { color: tema.colores.textoSecundario },
                          ]}
                        >
                          1 {moneda.codigo} = {moneda.tipoCambio.toFixed(4)}{' '}
                          {monedaBase?.codigo}
                        </Text>
                      )}
                    </View>
                  </View>

                  {!moneda.esMonedaBase && (
                    <View style={styles.monedaAcciones}>
                      <TouchableOpacity
                        onPress={() => {
                          if (estaEditando) {
                            setEditando(null);
                            setNuevoTipoCambio('');
                          } else {
                            setEditando(moneda.codigo);
                            setNuevoTipoCambio(moneda.tipoCambio.toString());
                          }
                        }}
                      >
                        <Text style={styles.accionTexto}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleCambiarMonedaBase(moneda.codigo)}
                      >
                        <Text style={styles.accionTexto}>⭐</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEliminarMoneda(moneda.codigo)}
                      >
                        <Text style={styles.accionTexto}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Botón agregar */}
            {monedas.length < 5 && !modoAgregar && (
              <TouchableOpacity
                style={[
                  styles.botonAgregar,
                  {
                    backgroundColor: tema.colores.primario,
                  },
                ]}
                onPress={() => setModoAgregar(true)}
              >
                <Text style={styles.botonAgregarTexto}>+ Agregar Moneda</Text>
              </TouchableOpacity>
            )}

            {/* Formulario agregar */}
            {modoAgregar && (
              <View
                style={[
                  styles.formularioAgregar,
                  { backgroundColor: tema.colores.fondoSecundario },
                ]}
              >
                <Text style={[styles.subtitulo, { color: tema.colores.texto }]}>
                  Agregar Nueva Moneda
                </Text>

                {/* Selector de moneda */}
                <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
                  Moneda:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.selectorMonedas}
                >
                  {monedasDisponiblesParaAgregar.map(m => (
                    <TouchableOpacity
                      key={m.codigo}
                      style={[
                        styles.monedaOpcion,
                        {
                          backgroundColor:
                            codigoSeleccionado === m.codigo
                              ? tema.colores.primario
                              : tema.colores.fondo,
                          borderColor: tema.colores.bordes,
                        },
                      ]}
                      onPress={() => setCodigoSeleccionado(m.codigo)}
                    >
                      <Text style={styles.monedaOpcionEmoji}>{m.emoji}</Text>
                      <Text
                        style={[
                          styles.monedaOpcionTexto,
                          {
                            color:
                              codigoSeleccionado === m.codigo
                                ? '#fff'
                                : tema.colores.texto,
                          },
                        ]}
                      >
                        {m.codigo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Input tipo de cambio */}
                <Text style={[styles.label, { color: tema.colores.textoSecundario }]}>
                  Tipo de cambio (1 {codigoSeleccionado || '___'} = ? {monedaBase?.codigo}
                  ):
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: tema.colores.texto,
                      borderColor: tema.colores.bordes,
                      backgroundColor: tema.colores.fondo,
                    },
                  ]}
                  value={tipoCambioInput}
                  onChangeText={setTipoCambioInput}
                  keyboardType="numeric"
                  placeholder="7.80"
                  placeholderTextColor={tema.colores.textoSecundario}
                />

                <View style={styles.botonesFormulario}>
                  <TouchableOpacity
                    style={[
                      styles.botonFormulario,
                      { backgroundColor: tema.colores.bordes },
                    ]}
                    onPress={() => {
                      setModoAgregar(false);
                      setCodigoSeleccionado('');
                      setTipoCambioInput('');
                    }}
                  >
                    <Text style={[styles.botonFormularioTexto, { color: tema.colores.texto }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.botonFormulario,
                      { backgroundColor: tema.colores.primario },
                    ]}
                    onPress={handleAgregarMoneda}
                  >
                    <Text style={styles.botonFormularioTexto}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {monedas.length >= 5 && (
              <Text style={[styles.limiteTexto, { color: tema.colores.textoSecundario }]}>
                Has alcanzado el límite de 5 monedas
              </Text>
            )}
          </ScrollView>
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
  modal: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  contenido: {
    flex: 1,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTexto: {
    fontSize: 13,
    lineHeight: 18,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  monedaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  monedaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monedaEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  monedaTextos: {
    flex: 1,
  },
  monedaNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  monedaBase: {
    fontSize: 13,
    fontWeight: '600',
  },
  monedaTipoCambio: {
    fontSize: 13,
  },
  editarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  inputTipoCambio: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    fontSize: 13,
    marginRight: 8,
  },
  botonGuardar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCancelar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCancelarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  monedaAcciones: {
    flexDirection: 'row',
    gap: 12,
  },
  accionTexto: {
    fontSize: 20,
  },
  botonAgregar: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formularioAgregar: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  selectorMonedas: {
    marginBottom: 8,
  },
  monedaOpcion: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  monedaOpcionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  monedaOpcionTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  botonFormulario: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonFormularioTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  limiteTexto: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
