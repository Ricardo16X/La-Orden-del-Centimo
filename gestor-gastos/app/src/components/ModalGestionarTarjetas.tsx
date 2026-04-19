import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useToast } from '../context/ToastContext';
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

export const ModalGestionarTarjetas = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { showToast } = useToast();
  const { tarjetas, agregarTarjeta, eliminarTarjeta, obtenerEstadoTarjeta } = useTarjetas();

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
      showToast('Por favor ingresa el nombre de la tarjeta', 'error');
      return;
    }

    if (!banco.trim()) {
      showToast('Por favor ingresa el banco', 'error');
      return;
    }

    if (ultimosCuatro.length !== 4 || !/^\d+$/.test(ultimosCuatro)) {
      showToast('Los últimos 4 dígitos deben ser exactamente 4 números', 'error');
      return;
    }

    const corte = parseInt(diaCorte);
    if (isNaN(corte) || corte < 1 || corte > 31) {
      showToast('El día de corte debe estar entre 1 y 31', 'error');
      return;
    }

    const pago = parseInt(diaPago);
    if (isNaN(pago) || pago < 1 || pago > 31) {
      showToast('El día de pago debe estar entre 1 y 31', 'error');
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
    showToast('Tarjeta agregada correctamente');
  };

  const handleEliminar = (id: string, nombreTarjeta: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar la tarjeta ${nombreTarjeta}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarTarjeta(id);
            showToast('Tarjeta eliminada correctamente');
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              💳 Gestionar Tarjetas
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulario */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                ➕ Nueva Tarjeta
              </Text>

              <Text style={[styles.label, { color: tema.colores.texto }]}>Nombre:</Text>
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

              <Text style={[styles.label, { color: tema.colores.texto }]}>Banco:</Text>
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
                Últimos 4 dígitos:
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

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    Día de corte:
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
                    Día de pago:
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
                        borderColor: colorSeleccionado === color ? '#fff' : 'transparent',
                        borderWidth: colorSeleccionado === color ? 3 : 0,
                      }
                    ]}
                  >
                    {colorSeleccionado === color && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleAgregar}
                style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
              >
                <Text style={styles.botonTexto}>➕ Agregar Tarjeta</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de tarjetas */}
            <View style={[styles.seccion, { borderColor: tema.colores.bordes }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📋 Mis Tarjetas
              </Text>

              {tarjetas.length === 0 ? (
                <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
                  No tienes tarjetas registradas
                </Text>
              ) : (
                tarjetas.map(tarjeta => {
                  const estado = obtenerEstadoTarjeta(tarjeta);

                  return (
                    <View
                      key={tarjeta.id}
                      style={[styles.tarjetaItem, {
                        backgroundColor: tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }]}
                    >
                      <View style={[styles.tarjetaBarra, { backgroundColor: tarjeta.color }]} />

                      <View style={styles.tarjetaContenido}>
                        <View style={styles.tarjetaInfo}>
                          <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                            {tarjeta.nombre}
                          </Text>
                          <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                            {`${tarjeta.banco} •••• ${tarjeta.ultimosCuatroDigitos}`}
                          </Text>
                          <Text style={[styles.tarjetaFechas, { color: tema.colores.textoSecundario }]}>
                            {`Corte: ${tarjeta.diaCorte} • Pago: ${tarjeta.diaPago}`}
                          </Text>
                          <Text style={[styles.tarjetaEstado, { color: estado.color }]}>
                            {estado.mensaje}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleEliminar(tarjeta.id, tarjeta.nombre)}
                          style={styles.botonEliminar}
                        >
                          <Text style={styles.botonEliminarTexto}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 20,
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
  seccion: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
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
  botonAgregar: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  tarjetaItem: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tarjetaBarra: {
    height: 6,
  },
  tarjetaContenido: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  tarjetaInfo: {
    flex: 1,
  },
  tarjetaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaBanco: {
    fontSize: 13,
    marginBottom: 4,
  },
  tarjetaFechas: {
    fontSize: 12,
    marginBottom: 6,
  },
  tarjetaEstado: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  botonEliminar: {
    padding: 10,
  },
  botonEliminarTexto: {
    fontSize: 24,
  },
});
