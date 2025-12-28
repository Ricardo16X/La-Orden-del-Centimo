import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTema } from '../context/TemaContext';
import { LogroDesbloqueado } from '../types/logros';

interface Props {
  logroDesbloqueado: LogroDesbloqueado | null;
}

export const NotificacionLogro = ({ logroDesbloqueado }: Props) => {
  const { tema } = useTema();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (logroDesbloqueado) {
      setMostrar(true);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Mantener visible 4 segundos
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setMostrar(false);
        });
      }, 4000);
    }
  }, [logroDesbloqueado]);

  if (!mostrar || !logroDesbloqueado) return null;

  const { logro } = logroDesbloqueado;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.acento,
        },
      ]}
    >
      <View style={styles.contenido}>
        <Text style={styles.titulo}>🏆 ¡LOGRO DESBLOQUEADO! 🏆</Text>

        <Text style={styles.icono}>{logro.icono}</Text>

        <Text style={[styles.nombreLogro, { color: tema.colores.primario }]}>
          {logro.nombre}
        </Text>

        <Text style={[styles.descripcion, { color: tema.colores.texto }]}>
          {logro.descripcion}
        </Text>

        <View style={[styles.recompensa, { backgroundColor: tema.colores.acento + '20' }]}>
          <Text style={[styles.recompensaTexto, { color: tema.colores.acento }]}>
            +{logro.xpRecompensa} XP
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 2000,
    borderRadius: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  contenido: {
    padding: 24,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    color: '#FFD700',
  },
  icono: {
    fontSize: 64,
    marginBottom: 12,
  },
  nombreLogro: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  recompensa: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recompensaTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
