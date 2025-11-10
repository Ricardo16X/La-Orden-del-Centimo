import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  mensaje: string;
  visible: boolean;
}

export const Companero = ({ mensaje, visible }: Props) => {
  const { tema } = useTema();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (visible && mensaje) {
      setMostrar(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMostrar(false);
      });
    }
  }, [visible, mensaje]);

  if (!mostrar) return null;

  return (
    <Animated.View style={[
      styles.container, 
      { 
        opacity: fadeAnim,
        backgroundColor: tema.colores.fondoSecundario,
        borderColor: tema.colores.primario,
      }
    ]}>
      <Text style={styles.avatar}>{tema.companero.avatar}</Text>
      <View style={styles.bocadillo}>
        <Text style={[styles.texto, { color: tema.colores.texto }]}>
          {mensaje}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    fontSize: 40,
    marginRight: 15,
  },
  bocadillo: {
    flex: 1,
  },
  texto: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});