import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from '../context/TemaContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalPersonalizacion = ({ visible, onClose }: Props) => {
  const { tema, modoOscuroAutomatico, toggleModoOscuroAutomatico, cambiarMoneda } = useTema();
  const [monedaInput, setMonedaInput] = useState(tema.moneda);

  // Sincronizar el input local cuando cambie el tema
  useEffect(() => {
    setMonedaInput(tema.moneda);
  }, [tema.moneda]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              Personalización
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Modo Oscuro Automático */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <View style={styles.opcionConSwitch}>
                <View style={styles.opcionInfo}>
                  <Text style={[styles.subtitulo, { color: tema.colores.primario, marginBottom: 4 }]}>
                    Modo Oscuro Automático
                  </Text>
                  <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
                    El tema se ajustará según la configuración de tu dispositivo
                  </Text>
                </View>
                <Switch
                  value={modoOscuroAutomatico}
                  onValueChange={toggleModoOscuroAutomatico}
                  trackColor={{ false: tema.colores.bordes, true: tema.colores.primarioClaro }}
                  thumbColor={modoOscuroAutomatico ? tema.colores.primario : tema.colores.texto}
                />
              </View>
            </View>

            {/* Símbolo de Moneda */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                Símbolo de Moneda
              </Text>
              <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
                Personaliza el símbolo que se muestra junto a los montos
              </Text>

              <View style={styles.monedaRow}>
                <TextInput
                  style={[
                    styles.inputMoneda,
                    {
                      color: tema.colores.texto,
                      borderColor: tema.colores.bordes,
                      backgroundColor: tema.colores.fondo,
                    }
                  ]}
                  value={monedaInput}
                  onChangeText={setMonedaInput}
                  onBlur={() => {
                    const monedaLimpia = monedaInput.trim();
                    if (monedaLimpia) {
                      cambiarMoneda(monedaLimpia);
                    } else {
                      setMonedaInput(tema.moneda);
                    }
                  }}
                  placeholder="$"
                  placeholderTextColor={tema.colores.textoSecundario}
                  maxLength={5}
                />
                <Text style={[styles.ejemploMoneda, { color: tema.colores.textoSecundario }]}>
                  Ejemplo: {monedaInput}100.00
                </Text>
              </View>
            </View>

            {/* Información del tema */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                Tema Actual
              </Text>
              <View style={styles.temaInfo}>
                <Text style={[styles.temaEmoji]}>{tema.emoji}</Text>
                <Text style={[styles.temaNombre, { color: tema.colores.texto }]}>
                  {tema.nombre}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  seccion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  opcionConSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opcionInfo: {
    flex: 1,
    marginRight: 12,
  },
  monedaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputMoneda: {
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    textAlign: 'center',
  },
  ejemploMoneda: {
    fontSize: 14,
  },
  temaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  temaEmoji: {
    fontSize: 24,
  },
  temaNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
});
