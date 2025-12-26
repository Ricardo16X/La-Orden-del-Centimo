import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useNivel } from '../context/NivelContext';
import { BarraNivel } from './BarraNivel';
import { NIVELES } from '../constants/niveles';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalProgreso = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { datosJugador } = useNivel();

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
              ⭐ Tu Progreso
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nivel Actual */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                🎯 Nivel Actual
              </Text>
              <BarraNivel datosJugador={datosJugador} />
            </View>

            {/* Todos los Niveles */}
            <View style={[styles.seccion, {
              backgroundColor: tema.colores.fondoSecundario,
              borderColor: tema.colores.bordes,
            }]}>
              <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                📜 Todos los Niveles
              </Text>

              {NIVELES.map((nivel) => {
                const alcanzado = datosJugador.nivel >= nivel.nivel;
                const actual = datosJugador.nivel === nivel.nivel;

                return (
                  <View
                    key={nivel.nivel}
                    style={[
                      styles.nivelItem,
                      {
                        backgroundColor: actual ? tema.colores.primario + '20' : 'transparent',
                        borderColor: actual ? tema.colores.primario : tema.colores.bordes,
                      }
                    ]}
                  >
                    <View style={styles.nivelHeader}>
                      <Text style={styles.nivelNumero}>
                        {alcanzado ? '✓' : nivel.nivel}
                      </Text>
                      <View style={styles.nivelInfo}>
                        <Text style={[
                          styles.nivelTitulo,
                          {
                            color: alcanzado ? tema.colores.primario : tema.colores.textoSecundario,
                            fontWeight: actual ? 'bold' : '600',
                          }
                        ]}>
                          {nivel.titulo}
                        </Text>
                        <Text style={[styles.nivelDescripcion, { color: tema.colores.textoSecundario }]}>
                          {nivel.descripcion}
                        </Text>
                        <Text style={[styles.nivelXP, { color: tema.colores.texto }]}>
                          {nivel.xpRequerido} XP necesario
                        </Text>
                      </View>
                      {actual && (
                        <Text style={styles.actualBadge}>ACTUAL</Text>
                      )}
                    </View>
                  </View>
                );
              })}
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
    marginBottom: 15,
  },
  nivelItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  nivelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nivelNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  nivelInfo: {
    flex: 1,
  },
  nivelTitulo: {
    fontSize: 16,
    marginBottom: 4,
  },
  nivelDescripcion: {
    fontSize: 12,
    marginBottom: 4,
  },
  nivelXP: {
    fontSize: 11,
    fontWeight: '600',
  },
  actualBadge: {
    backgroundColor: '#4ade80',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
