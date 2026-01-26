import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useTarjetas } from '../context/TarjetasContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const COLORES_TARJETA = [
  '#000', '#C0C0C0', '#FFD700',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#6366f1', '#06b6d4',
  '#84cc16', '#f97316', '#14b8a6', '#a855f7',
];

export const ModalAgregarTarjeta = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { agregarTarjeta } = useTarjetas();

  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [ultimosCuatro, setUltimosCuatro] = useState('');
  const [diaCorte, setDiaCorte] = useState('');
  const [diaPago, setDiaPago] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('#3b82f6');

  const resetFormulario = () => {
    setNombre('');
    setBanco('');
    setUltimosCuatro('');
    setDiaCorte('');
    setDiaPago('');
    setColorSeleccionado('#3b82f6');
  };

  const handleAgregar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de la tarjeta');
      return;
    }

    if (!banco.trim()) {
      Alert.alert('Error', 'Por favor ingresa el banco');
      return;
    }

    if (ultimosCuatro.length !== 4 || !/^\d+$/.test(ultimosCuatro)) {
      Alert.alert('Error', 'Los últimos 4 dígitos deben ser exactamente 4 números');
      return;
    }

    const corte = parseInt(diaCorte);
    if (isNaN(corte) || corte < 1 || corte > 31) {
      Alert.alert('Error', 'El día de corte debe estar entre 1 y 31');
      return;
    }

    const pago = parseInt(diaPago);
    if (isNaN(pago) || pago < 1 || pago > 31) {
      Alert.alert('Error', 'El día de pago debe estar entre 1 y 31');
      return;
    }

    agregarTarjeta({
      nombre: nombre.trim(),
      banco: banco.trim(),
      ultimosCuatroDigitos: ultimosCuatro,
      diaCorte: corte,
      diaPago: pago,
      color: colorSeleccionado,
    });

    resetFormulario();
    Alert.alert('Éxito', 'Tarjeta agregada correctamente', [
      { text: 'OK', onPress: onClose }
    ]);
  };

  const handleCancelar = () => {
    resetFormulario();
    onClose();
  };

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.modalContainer, { backgroundColor: tema.colores.fondo }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: tema.colores.bordes }]}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              💳 Nueva Tarjeta
            </Text>
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
            {/* Info Básica */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                📋 Información Básica
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>💳 Nombre:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Tarjeta Principal"
                placeholderTextColor={tema.colores.textoSecundario}
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>🏦 Banco:</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Banco Industrial"
                placeholderTextColor={tema.colores.textoSecundario}
                value={banco}
                onChangeText={setBanco}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>
                #️⃣ Últimos 4 dígitos:
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="1234"
                placeholderTextColor={tema.colores.textoSecundario}
                keyboardType="numeric"
                maxLength={4}
                value={ultimosCuatro}
                onChangeText={setUltimosCuatro}
              />
            </View>

            {/* Fechas */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                📅 Fechas Importantes
              </Text>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    📆 Día de corte:
                  </Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="15"
                    placeholderTextColor={tema.colores.textoSecundario}
                    keyboardType="numeric"
                    maxLength={2}
                    value={diaCorte}
                    onChangeText={setDiaCorte}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    💰 Día de pago:
                  </Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="20"
                    placeholderTextColor={tema.colores.textoSecundario}
                    keyboardType="numeric"
                    maxLength={2}
                    value={diaPago}
                    onChangeText={setDiaPago}
                  />
                </View>
              </View>
            </View>

            {/* Color */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.seccionTitulo, { color: tema.colores.primario }]}>
                🎨 Personalización
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Color:</Text>
              <View style={styles.coloresContainer}>
                {COLORES_TARJETA.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setColorSeleccionado(color)}
                    style={[
                      styles.colorChip,
                      {
                        backgroundColor: color,
                        borderColor: colorSeleccionado === color ? tema.colores.primario : 'transparent',
                        borderWidth: colorSeleccionado === color ? 3 : 2,
                      }
                    ]}
                  >
                    {colorSeleccionado === color && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview de la tarjeta */}
              {nombre && (
                <View style={[styles.preview, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
                  <Text style={[styles.previewLabel, { color: tema.colores.textoSecundario }]}>
                    Vista previa:
                  </Text>
                  <View style={[styles.previewCard, { borderLeftColor: colorSeleccionado }]}>
                    <Text style={[styles.previewNombre, { color: tema.colores.texto }]}>
                      {nombre || 'Nombre de la tarjeta'}
                    </Text>
                    <Text style={[styles.previewBanco, { color: tema.colores.textoSecundario }]}>
                      {banco || 'Banco'} {ultimosCuatro && `••${ultimosCuatro}`}
                    </Text>
                    {diaCorte && diaPago && (
                      <Text style={[styles.previewFechas, { color: tema.colores.textoSecundario }]}>
                        Corte: {diaCorte} • Pago: {diaPago}
                      </Text>
                    )}
                  </View>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  coloresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  colorChip: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheck: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  preview: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewCard: {
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  previewNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewBanco: {
    fontSize: 13,
    marginBottom: 4,
  },
  previewFechas: {
    fontSize: 12,
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
