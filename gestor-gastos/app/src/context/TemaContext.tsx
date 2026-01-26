/**
 * Context para gestión de temas
 * Maneja el tema activo y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Tema } from '../types';
import { TEMAS } from '../constants/temas';
import {
  cargarModoOscuroAuto,
  guardarModoOscuroAuto,
} from '../services/storage';

interface TemaContextType {
  tema: Tema;
  modoOscuroAutomatico: boolean;
  toggleModoOscuroAutomatico: () => void;
  cambiarMoneda: (simbolo: string) => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export const TemaProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [tema, setTema] = useState<Tema>(TEMAS[0]);
  const [modoOscuroAutomatico, setModoOscuroAutomatico] = useState(false);
  const [monedaGuardada, setMonedaGuardada] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Escuchar cambios en el esquema de color del sistema
  useEffect(() => {
    if (modoOscuroAutomatico) {
      aplicarTemaAutomatico();
    }
  }, [colorScheme, modoOscuroAutomatico, monedaGuardada]);

  const cargarDatos = async () => {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const [modoAutoGuardado, monedaCargada] = await Promise.all([
      cargarModoOscuroAuto(),
      AsyncStorage.default.getItem('@moneda'),
    ]);

    // Guardar la moneda en el estado para usarla en otros lugares
    if (monedaCargada) {
      setMonedaGuardada(monedaCargada);
    }

    setModoOscuroAutomatico(modoAutoGuardado);

    // Aplicar tema según configuración
    if (modoAutoGuardado) {
      // Modo automático: aplicar según colorScheme del sistema
      let temaSeleccionado: Tema;
      if (colorScheme === 'dark') {
        temaSeleccionado = TEMAS.find(t => t.id === 'dark') || TEMAS[0];
      } else {
        temaSeleccionado = TEMAS.find(t => t.id === 'light') || TEMAS[0];
      }

      // Aplicar moneda personalizada
      if (monedaCargada) {
        temaSeleccionado = { ...temaSeleccionado, moneda: monedaCargada };
      }

      setTema(temaSeleccionado);
    } else {
      // Primer inicio: usar tema por defecto con moneda personalizada si existe
      let temaInicial = TEMAS[0];
      if (monedaCargada) {
        temaInicial = { ...temaInicial, moneda: monedaCargada };
      }
      setTema(temaInicial);
    }
  };

  const aplicarTemaAutomatico = () => {
    // Si el modo oscuro está activado en el sistema, usar dark
    // De lo contrario, usar light
    let temaSeleccionado: Tema;
    if (colorScheme === 'dark') {
      temaSeleccionado = TEMAS.find(t => t.id === 'dark') || TEMAS[0];
    } else {
      temaSeleccionado = TEMAS.find(t => t.id === 'light') || TEMAS[0];
    }

    // Preservar la moneda guardada si existe
    if (monedaGuardada) {
      temaSeleccionado = { ...temaSeleccionado, moneda: monedaGuardada };
    }

    setTema(temaSeleccionado);
  };

  const toggleModoOscuroAutomatico = async () => {
    const nuevoEstado = !modoOscuroAutomatico;
    setModoOscuroAutomatico(nuevoEstado);
    await guardarModoOscuroAuto(nuevoEstado);

    if (nuevoEstado) {
      aplicarTemaAutomatico();
    } else {
      // Si se desactiva el modo automático, mantener el tema actual
      // El usuario ya está viendo el tema correcto basado en su sistema
    }
  };

  const cambiarMoneda = (simbolo: string) => {
    // Actualizar el estado local de moneda guardada
    setMonedaGuardada(simbolo);

    // Actualizar el tema actual
    setTema(prev => ({
      ...prev,
      moneda: simbolo,
    }));

    // Guardar en AsyncStorage
    guardarMoneda(simbolo);
  };

  const guardarMoneda = async (simbolo: string) => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('@moneda', simbolo);
    } catch (error) {
      console.error('Error al guardar moneda:', error);
    }
  };

  return (
    <TemaContext.Provider
      value={{
        tema,
        modoOscuroAutomatico,
        toggleModoOscuroAutomatico,
        cambiarMoneda,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
};

export const useTema = () => {
  const context = useContext(TemaContext);
  if (!context) {
    throw new Error('useTema debe usarse dentro de TemaProvider');
  }
  return context;
};