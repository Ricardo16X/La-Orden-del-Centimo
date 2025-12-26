/**
 * Context para gestión de temas
 * Maneja el tema activo y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Tema } from '../types';
import { obtenerTema, TEMAS } from '../constants/temas';
import {
  cargarTema as cargarTemaStorage,
  guardarTema as guardarTemaStorage,
  cargarModoOscuroAuto,
  guardarModoOscuroAuto,
} from '../services/storage';

interface TemaContextType {
  tema: Tema;
  cambiarTema: (temaId: string) => void;
  temasDisponibles: Tema[];
  modoOscuroAutomatico: boolean;
  toggleModoOscuroAutomatico: () => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export const TemaProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [tema, setTema] = useState<Tema>(TEMAS[0]);
  const [modoOscuroAutomatico, setModoOscuroAutomatico] = useState(false);
  const [temaManual, setTemaManual] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Escuchar cambios en el esquema de color del sistema
  useEffect(() => {
    if (modoOscuroAutomatico) {
      aplicarTemaAutomatico();
    }
  }, [colorScheme, modoOscuroAutomatico]);

  const cargarDatos = async () => {
    const [temaGuardado, modoAutoGuardado] = await Promise.all([
      cargarTemaStorage(),
      cargarModoOscuroAuto(),
    ]);

    setModoOscuroAutomatico(modoAutoGuardado);

    if (temaGuardado) {
      setTemaManual(temaGuardado);
      if (!modoAutoGuardado) {
        setTema(obtenerTema(temaGuardado));
      }
    }

    if (modoAutoGuardado) {
      aplicarTemaAutomatico();
    }
  };

  const aplicarTemaAutomatico = () => {
    // Si el modo oscuro está activado en el sistema, usar un tema oscuro
    // De lo contrario, usar el tema manual guardado o el primero
    if (colorScheme === 'dark') {
      // Buscar un tema con tonos oscuros (puedes ajustar esto según tus temas)
      const temaOscuro = TEMAS.find(t => t.id === 'cyberpunk') || TEMAS[0];
      setTema(temaOscuro);
    } else {
      // Usar el tema manual si existe, o el primero
      const temaClaro = temaManual ? obtenerTema(temaManual) : TEMAS[0];
      setTema(temaClaro);
    }
  };

  const cambiarTema = async (temaId: string) => {
    const nuevoTema = obtenerTema(temaId);
    setTema(nuevoTema);
    setTemaManual(temaId);
    await guardarTemaStorage(temaId);

    // Si está en modo automático, desactivarlo al cambiar manualmente
    if (modoOscuroAutomatico) {
      setModoOscuroAutomatico(false);
      await guardarModoOscuroAuto(false);
    }
  };

  const toggleModoOscuroAutomatico = async () => {
    const nuevoEstado = !modoOscuroAutomatico;
    setModoOscuroAutomatico(nuevoEstado);
    await guardarModoOscuroAuto(nuevoEstado);

    if (nuevoEstado) {
      aplicarTemaAutomatico();
    } else if (temaManual) {
      setTema(obtenerTema(temaManual));
    }
  };

  return (
    <TemaContext.Provider
      value={{
        tema,
        cambiarTema,
        temasDisponibles: TEMAS,
        modoOscuroAutomatico,
        toggleModoOscuroAutomatico,
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