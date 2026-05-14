import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { useTema } from '../context/TemaContext';

export interface OpcionMenu {
  emoji: string;
  label: string;
  onPress: () => void;
  destructivo?: boolean;
}

interface Props {
  opciones: OpcionMenu[];
}

export const MenuContextual = ({ opciones }: Props) => {
  const { tema } = useTema();
  const c = tema.colores;
  const btnRef = useRef<View>(null);
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const abrir = () => {
    btnRef.current?.measure((_, __, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      setPos({
        top: pageY + height + 6,
        right: screenWidth - (pageX + width),
      });
      setAbierto(true);
    });
  };

  const cerrar = (fn?: () => void) => {
    setAbierto(false);
    if (fn) setTimeout(fn, 150);
  };

  return (
    <>
      <View ref={btnRef} collapsable={false}>
        <TouchableOpacity
          onPress={abrir}
          hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
          style={styles.btn}
        >
          <Text style={[styles.btnTexto, { color: c.textoSecundario }]}>···</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => cerrar()}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => cerrar()}
          activeOpacity={1}
        >
          <View
            style={[
              styles.menu,
              {
                top: pos.top,
                right: pos.right,
                backgroundColor: c.fondoSecundario,
                borderColor: c.bordes,
              },
            ]}
          >
            {opciones.map((op, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.opcion,
                  i < opciones.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.bordes },
                ]}
                onPress={() => cerrar(op.onPress)}
              >
                <Text style={styles.opcionEmoji}>{op.emoji}</Text>
                <Text style={[styles.opcionLabel, { color: op.destructivo ? '#ef4444' : c.texto }]}>
                  {op.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  btnTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    lineHeight: 20,
  },
  menu: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 170,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  opcionEmoji: { fontSize: 16 },
  opcionLabel: { fontSize: 14, fontWeight: '600' },
});
