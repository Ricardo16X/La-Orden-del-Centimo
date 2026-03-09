/**
 * Context para gestión de gastos recurrentes (suscripciones y gastos fijos)
 * Maneja el estado global de gastos recurrentes y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GastoRecurrente, NuevoGastoRecurrente } from '../types';
import { cargarGastosRecurrentes, guardarGastosRecurrentes } from '../services/storage';
import { generarId } from '../utils';

interface GastosRecurrentesContextType {
  gastosRecurrentes: GastoRecurrente[];
  agregarGastoRecurrente: (gasto: NuevoGastoRecurrente) => GastoRecurrente;
  editarGastoRecurrente: (id: string, datos: Partial<Omit<GastoRecurrente, 'id'>>) => void;
  eliminarGastoRecurrente: (id: string) => void;
  toggleGastoRecurrente: (id: string) => void;
  actualizarProximaFecha: (id: string, nuevaFecha: string) => void;
}

const GastosRecurrentesContext = createContext<GastosRecurrentesContextType | undefined>(undefined);

export const GastosRecurrentesProvider = ({ children }: { children: ReactNode }) => {
  const [gastosRecurrentes, setGastosRecurrentes] = useState<GastoRecurrente[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cargado) {
      guardarGastosRecurrentes(gastosRecurrentes);
    }
  }, [gastosRecurrentes, cargado]);

  const cargarDatos = async () => {
    const datos = await cargarGastosRecurrentes();
    setGastosRecurrentes(datos);
    setCargado(true);
  };

  const agregarGastoRecurrente = (gasto: NuevoGastoRecurrente): GastoRecurrente => {
    const nuevo: GastoRecurrente = {
      id: generarId(),
      fechaCreacion: new Date().toISOString(),
      ...gasto,
    };
    setGastosRecurrentes(prev => [...prev, nuevo]);
    return nuevo;
  };

  const editarGastoRecurrente = (id: string, datos: Partial<Omit<GastoRecurrente, 'id'>>) => {
    setGastosRecurrentes(prev =>
      prev.map(gr => (gr.id === id ? { ...gr, ...datos } : gr))
    );
  };

  const eliminarGastoRecurrente = (id: string) => {
    setGastosRecurrentes(prev => prev.filter(gr => gr.id !== id));
  };

  const toggleGastoRecurrente = (id: string) => {
    setGastosRecurrentes(prev =>
      prev.map(gr => (gr.id === id ? { ...gr, activo: !gr.activo } : gr))
    );
  };

  const actualizarProximaFecha = (id: string, nuevaFecha: string) => {
    setGastosRecurrentes(prev =>
      prev.map(gr => (gr.id === id ? { ...gr, proximaFecha: nuevaFecha } : gr))
    );
  };

  return (
    <GastosRecurrentesContext.Provider
      value={{
        gastosRecurrentes,
        agregarGastoRecurrente,
        editarGastoRecurrente,
        eliminarGastoRecurrente,
        toggleGastoRecurrente,
        actualizarProximaFecha,
      }}
    >
      {children}
    </GastosRecurrentesContext.Provider>
  );
};

export const useGastosRecurrentes = () => {
  const context = useContext(GastosRecurrentesContext);
  if (!context) {
    throw new Error('useGastosRecurrentes debe usarse dentro de GastosRecurrentesProvider');
  }
  return context;
};
