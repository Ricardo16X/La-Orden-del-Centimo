import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTema } from '../context/TemaContext';
import { SelectorTema } from './SelectorTema';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalPersonalizacion = ({ visible, onClose }: Props) => {
  const { tema, modoOscuroAutomatico, toggleModoOscuroAutomatico } = useTema();

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
              🎨 Personalización
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
                    🌙 Modo Oscuro Automático
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

            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                🌈 Tema de la App
              </Text>
              <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
                {modoOscuroAutomatico
                  ? 'El modo automático está activado. Desactívalo para elegir un tema manualmente.'
                  : 'Elige el tema que más te guste. Cada tema tiene su propio compañero, colores y moneda.'}
              </Text>
              <SelectorTema />
            </View>

            {/* Información del tema actual */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📝 Tema Actual: {tema.nombre}
              </Text>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: tema.colores.texto }]}>
                  Compañero:
                </Text>
                <Text style={styles.infoValor}>
                  {tema.companero.avatar} {tema.companero.nombre}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: tema.colores.texto }]}>
                  Moneda:
                </Text>
                <Text style={[styles.infoValor, { color: tema.colores.texto }]}>
                  {tema.moneda}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: tema.colores.texto }]}>
                  Estilo:
                </Text>
                <Text style={[styles.infoValor, { color: tema.colores.texto }]}>
                  {tema.id === 'medieval' ? 'RPG Medieval oscuro' : 'Kawaii japonés claro'}
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValor: {
    fontSize: 14,
  },
});
