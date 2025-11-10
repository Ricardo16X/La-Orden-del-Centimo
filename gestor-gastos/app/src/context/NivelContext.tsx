import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatosJugador } from '../types';
import { cargarXP, guardarXP } from '../services/storage';
import { calcularNivel, XP_POR_GASTO } from '../constants/niveles';

interface NivelContextType {
  datosJugador: DatosJugador;
  ganarXP: (cantidad?: number) => Promise<DatosJugador>;
  subisteDeNivel: boolean;
}

const NivelContext = createContext<NivelContextType | undefined>(undefined);

export const NivelProvider = ({ children }: { children: ReactNode }) => {
  const [datosJugador, setDatosJugador] = useState<DatosJugador>({
    nivel: 1,
    xp: 0,
    xpParaSiguienteNivel: 50,
    titulo: "Novato",
  });
  const [subisteDeNivel, setSubisteDeNivel] = useState<boolean>(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const xpGuardado = await cargarXP();
    const datos = calcularNivel(xpGuardado);
    setDatosJugador(datos);
  };

  const ganarXP = async (cantidad: number = XP_POR_GASTO) => {
    const nivelAnterior = datosJugador.nivel;
    const nuevoXP = datosJugador.xp + cantidad;
    const nuevosDatos = calcularNivel(nuevoXP);
    
    setDatosJugador(nuevosDatos);
    await guardarXP(nuevoXP);

    if (nuevosDatos.nivel > nivelAnterior) {
      setSubisteDeNivel(true);
      setTimeout(() => setSubisteDeNivel(false), 4000);
    }

    return nuevosDatos;
  };

  return (
    <NivelContext.Provider
      value={{
        datosJugador,
        ganarXP,
        subisteDeNivel,
      }}
    >
      {children}
    </NivelContext.Provider>
  );
};

export const useNivel = () => {
  const context = useContext(NivelContext);
  if (!context) {
    throw new Error('useNivel debe usarse dentro de NivelProvider');
  }
  return context;
};