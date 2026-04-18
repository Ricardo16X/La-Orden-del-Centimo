/**
 * Context para gestión de temas
 * Maneja el tema activo y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tema } from '../types';
import { TEMAS } from '../constants/temas';
import {
  cargarModoOscuroAuto,
  guardarModoOscuroAuto,
} from '../services/storage';

const KEY_MONEDA = '@moneda';
const KEY_TEMA_MANUAL = '@tema_manual_id';

interface TemaContextType {
  tema: Tema;
  modoOscuroAutomatico: boolean;
  toggleModoOscuroAutomatico: () => void;
  cambiarTema: (id: string) => void;
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

  // Reaccionar a cambios del sistema solo en modo automático
  useEffect(() => {
    if (modoOscuroAutomatico) {
      aplicarTemaAutomatico();
    }
  }, [colorScheme, modoOscuroAutomatico, monedaGuardada]);

  const cargarDatos = async () => {
    const [modoAutoGuardado, monedaCargada, temaManualId] = await Promise.all([
      cargarModoOscuroAuto(),
      AsyncStorage.getItem(KEY_MONEDA),
      AsyncStorage.getItem(KEY_TEMA_MANUAL),
    ]);

    if (monedaCargada) setMonedaGuardada(monedaCargada);
    setModoOscuroAutomatico(modoAutoGuardado);

    let temaSeleccionado: Tema;

    if (modoAutoGuardado) {
      // Modo automático: light/dark según sistema
      temaSeleccionado = colorScheme === 'dark'
        ? TEMAS.find(t => t.id === 'dark') ?? TEMAS[0]
        : TEMAS.find(t => t.id === 'light') ?? TEMAS[0];
    } else if (temaManualId) {
      // Tema elegido manualmente por el usuario
      temaSeleccionado = TEMAS.find(t => t.id === temaManualId) ?? TEMAS[0];
    } else {
      temaSeleccionado = TEMAS[0];
    }

    if (monedaCargada) {
      temaSeleccionado = { ...temaSeleccionado, moneda: monedaCargada };
    }

    setTema(temaSeleccionado);
  };

  const aplicarTemaAutomatico = () => {
    let temaSeleccionado = colorScheme === 'dark'
      ? TEMAS.find(t => t.id === 'dark') ?? TEMAS[0]
      : TEMAS.find(t => t.id === 'light') ?? TEMAS[0];

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
      // Al activar auto, limpiar la selección manual
      await AsyncStorage.removeItem(KEY_TEMA_MANUAL);
      aplicarTemaAutomatico();
    }
  };

  const cambiarTema = async (id: string) => {
    const temaElegido = TEMAS.find(t => t.id === id) ?? TEMAS[0];
    const temaConMoneda = monedaGuardada
      ? { ...temaElegido, moneda: monedaGuardada }
      : temaElegido;

    setTema(temaConMoneda);

    // Selección manual implica desactivar el modo automático
    setModoOscuroAutomatico(false);
    await Promise.all([
      AsyncStorage.setItem(KEY_TEMA_MANUAL, id),
      guardarModoOscuroAuto(false),
    ]);
  };

  const cambiarMoneda = async (simbolo: string) => {
    setMonedaGuardada(simbolo);
    setTema(prev => ({ ...prev, moneda: simbolo }));
    try {
      await AsyncStorage.setItem(KEY_MONEDA, simbolo);
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
        cambiarTema,
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
