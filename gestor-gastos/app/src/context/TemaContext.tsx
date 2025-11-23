/**
 * Context para gestión de temas
 * Maneja el tema activo y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tema } from '../types';
import { obtenerTema, TEMAS } from '../constants/temas';
import { cargarTema as cargarTemaStorage, guardarTema as guardarTemaStorage } from '../services/storage';

interface TemaContextType {
  tema: Tema;
  cambiarTema: (temaId: string) => void;
  temasDisponibles: Tema[];
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export const TemaProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(TEMAS[0]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const temaGuardado = await cargarTemaStorage();
    if (temaGuardado) {
      setTema(obtenerTema(temaGuardado));
    }
  };

  const cambiarTema = async (temaId: string) => {
    const nuevoTema = obtenerTema(temaId);
    setTema(nuevoTema);
    await guardarTemaStorage(temaId);
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