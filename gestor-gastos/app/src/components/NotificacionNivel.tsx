import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTema } from '../context/TemaContext';
import { obtenerNivel } from '../constants/niveles';

interface Props {
  visible: boolean;
  nivel: number;
}

export const NotificacionNivel = ({ visible, nivel }: Props) => {
  const { tema } = useTema();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (visible) {
      setMostrar(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setMostrar(false));
      }, 3500);
    }
  }, [visible, nivel]);

  if (!mostrar) return null;

  const datosNivel = obtenerNivel(nivel);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.primario,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <Text style={styles.emoji}>🎉</Text>
      <Text style={[styles.titulo, { color: tema.colores.primarioClaro }]}>
        ¡SUBISTE DE NIVEL!
      </Text>
      <Text style={[styles.nivel, { color: tema.colores.primario }]}>
        Nivel {nivel}
      </Text>
      <Text style={[styles.tituloNuevo, { color: tema.colores.texto }]}>
        {datosNivel.titulo}
      </Text>
      <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
        {datosNivel.descripcion}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 2000,
    padding: 25,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nivel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tituloNuevo: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 14,
    textAlign: 'center',
  },
});