import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useTema } from '../context/TemaContext';
import { TEMAS } from '../constants/temas';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalPersonalizacion = ({ visible, onClose }: Props) => {
  const { tema, modoOscuroAutomatico, toggleModoOscuroAutomatico, cambiarTema, cambiarMoneda } = useTema();
  const [monedaInput, setMonedaInput] = useState(tema.moneda);

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

            {/* Selector de tema */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                Tema
              </Text>
              <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
                Elige el aspecto visual de la aplicación
              </Text>
              <View style={styles.temasGrid}>
                {TEMAS.map(t => {
                  const activo = tema.id === t.id && !modoOscuroAutomatico;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => cambiarTema(t.id)}
                      style={[
                        styles.temaCard,
                        {
                          backgroundColor: t.colores.fondo,
                          borderColor: activo ? t.colores.primario : tema.colores.bordes,
                          borderWidth: activo ? 2 : 1,
                        },
                      ]}
                    >
                      {/* Franja de color primario */}
                      <View style={[styles.temaFranja, { backgroundColor: t.colores.primario }]} />
                      <View style={styles.temaCardBody}>
                        <Text style={styles.temaCardEmoji}>{t.emoji}</Text>
                        <Text style={[styles.temaCardNombre, { color: t.colores.texto }]}>
                          {t.nombre}
                        </Text>
                        {/* Muestra de paleta */}
                        <View style={styles.temaPaleta}>
                          {[t.colores.primario, t.colores.acento, t.colores.fondoSecundario].map((color, i) => (
                            <View
                              key={i}
                              style={[styles.temaDot, { backgroundColor: color }]}
                            />
                          ))}
                        </View>
                      </View>
                      {activo && (
                        <Text style={[styles.temaActivo, { color: t.colores.primario }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Modo Oscuro Automático */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <View style={styles.opcionConSwitch}>
                <View style={styles.opcionInfo}>
                  <Text style={[styles.subtitulo, { color: tema.colores.primario, marginBottom: 4 }]}>
                    Modo Automático
                  </Text>
                  <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
                    Cambia entre Claro y Oscuro según tu dispositivo
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
  // Selector de temas
  temasGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  temaCard: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 100,
  },
  temaFranja: {
    height: 4,
  },
  temaCardBody: {
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  temaCardEmoji: {
    fontSize: 20,
  },
  temaCardNombre: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  temaPaleta: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  temaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  temaActivo: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modo automático
  opcionConSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opcionInfo: {
    flex: 1,
    marginRight: 12,
  },
  // Moneda
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
});
