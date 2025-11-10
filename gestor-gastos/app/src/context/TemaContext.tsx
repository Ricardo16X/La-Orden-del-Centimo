import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tema, obtenerTema, TEMAS } from '../constants/temas';

interface TemaContextType {
  tema: Tema;
  cambiarTema: (temaId: string) => void;
  temasDisponibles: Tema[];
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

const STORAGE_KEY_TEMA = 'tema_seleccionado';

export const TemaProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(TEMAS[0]);

  useEffect(() => {
    cargarTema();
  }, []);

  const cargarTema = async () => {
    try {
      const temaGuardado = await AsyncStorage.getItem(STORAGE_KEY_TEMA);
      if (temaGuardado) {
        setTema(obtenerTema(temaGuardado));
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  };

  const cambiarTema = async (temaId: string) => {
    const nuevoTema = obtenerTema(temaId);
    setTema(nuevoTema);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TEMA, temaId);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  return (
    <TemaContext.Provider
      value={{
        tema,
        cambiarTema,
        temasDisponibles: TEMAS,
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