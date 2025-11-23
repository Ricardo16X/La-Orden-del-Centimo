/**
 * Context para gestión de gastos
 * Maneja el estado global de gastos y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gasto, NuevoGasto, ActualizacionGasto } from '../types';
import { cargarGastos, guardarGastos } from '../services/storage';
import { generarId, getFechaActual } from '../utils';

interface GastosContextType {
  gastos: Gasto[];
  agregarGasto: (gasto: NuevoGasto) => void;
  editarGasto: (id: string, gastoActualizado: ActualizacionGasto) => void;
  eliminarGasto: (id: string) => void;
  totalGastado: number;
  ultimoGastoAgregado: Gasto | null;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export const GastosProvider = ({ children }: { children: ReactNode }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ultimoGastoAgregado, setUltimoGastoAgregado] = useState<Gasto | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cargado && gastos.length >= 0) {
      guardarGastos(gastos);
    }
  }, [gastos, cargado]);

  const cargarDatos = async () => {
    const gastosGuardados = await cargarGastos();
    setGastos(gastosGuardados);
    setCargado(true);
  };

  const agregarGasto = (gasto: NuevoGasto) => {
    const nuevoGasto: Gasto = {
      id: generarId(),
      fecha: getFechaActual(),
      tipo: 'gasto',
      ...gasto,
    };
    setGastos(prev => {
      const nuevos = [nuevoGasto, ...prev];
      return nuevos;
    });
    setUltimoGastoAgregado(nuevoGasto);
  };

  const editarGasto = async (id: string, gastoActualizado: ActualizacionGasto) => {
    const nuevosGastos = gastos.map(gasto => 
      gasto.id === id 
        ? { ...gasto, ...gastoActualizado }
        : gasto
    );
    setGastos(nuevosGastos);
    await guardarGastos(nuevosGastos);
  };

  const eliminarGasto = async (id: string) => {
    const nuevosGastos = gastos.filter(gasto => gasto.id !== id);
    setGastos(nuevosGastos);
    await guardarGastos(nuevosGastos);
  };

  const totalGastado = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  return (
    <GastosContext.Provider
      value={{
        gastos,
        agregarGasto,
        editarGasto,
        eliminarGasto,
        totalGastado,
        ultimoGastoAgregado,
      }}
    >
      {children}
    </GastosContext.Provider>
  );
};

export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe usarse dentro de GastosProvider');
  }
  return context;
};