import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../context/TemaContext';

export const ActualizadorApp = () => {
  const { tema } = useTema();
  const insets = useSafeAreaInsets();
  const { isUpdatePending } = Updates.useUpdates();

  const [mostrar, setMostrar] = useState(false);
  const [ignorado, setIgnorado] = useState(false);

  // Animaciones
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Solo mostrar si hay una actualización pendiente y no ha sido ignorada por el usuario
    if (isUpdatePending && !ignorado) {
      setMostrar(true);
      // Animación de entrada (deslizar hacia abajo y fundido de opacidad)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUpdatePending, ignorado]);

  const aplicarActualizacion = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error al recargar la aplicación:', error);
      cerrarToast();
    }
  };

  const cerrarToast = () => {
    // Animación de salida (deslizar hacia arriba y fundido de opacidad)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMostrar(false);
      setIgnorado(true); // Marcar como ignorado para que no vuelva a aparecer en esta sesión
    });
  };

  if (!mostrar) return null;

  // Ajustar la posición para que quede justo debajo de la barra de estado/notch del S24 Ultra
  const topOffset = Platform.OS === 'ios' ? insets.top + 10 : insets.top + 15;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          top: topOffset,
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.primario,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.contenido}
        onPress={aplicarActualizacion}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>🚀</Text>
        <View style={styles.textoContenedor}>
          <Text style={[styles.titulo, { color: tema.colores.texto }]}>
            Nueva actualización lista
          </Text>
          <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
            Toca aquí para aplicar y reiniciar
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botonCerrar, { borderColor: tema.colores.bordes }]}
        onPress={cerrarToast}
        activeOpacity={0.7}
      >
        <Text style={[styles.textoCerrar, { color: tema.colores.textoSecundario }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999, // Asegura que quede por encima de modales y navegación
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    // Sombra para Android (elevation)
    elevation: 10,
  },
  contenido: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 26,
  },
  textoContenedor: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 12,
    fontWeight: '500',
  },
  botonCerrar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  textoCerrar: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
