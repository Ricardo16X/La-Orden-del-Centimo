/**
 * Context para gestión de presupuestos
 * Maneja el estado global de presupuestos por categoría y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Presupuesto, NuevoPresupuesto, EstadisticasPresupuesto } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { generarId } from '../utils';
import { useGastos } from './GastosContext';

interface PresupuestosContextType {
  presupuestos: Presupuesto[];
  agregarPresupuesto: (presupuesto: NuevoPresupuesto) => void;
  editarPresupuesto: (id: string, presupuestoActualizado: Partial<Omit<Presupuesto, 'id'>>) => void;
  eliminarPresupuesto: (id: string) => void;
  obtenerPresupuestoPorCategoria: (categoriaId: string) => Presupuesto | undefined;
  obtenerEstadisticasPresupuesto: (categoriaId: string, periodo: 'semanal' | 'mensual' | 'anual') => EstadisticasPresupuesto | null;
}

const PresupuestosContext = createContext<PresupuestosContextType | undefined>(undefined);

export const PresupuestosProvider = ({ children }: { children: ReactNode }) => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargado, setCargado] = useState(false);
  const { gastos } = useGastos();

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  useEffect(() => {
    if (cargado) {
      guardarPresupuestos();
    }
  }, [presupuestos, cargado]);

  const cargarPresupuestos = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRESUPUESTOS);
      if (data) {
        setPresupuestos(JSON.parse(data));
      }
      setCargado(true);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setCargado(true);
    }
  };

  const guardarPresupuestos = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRESUPUESTOS, JSON.stringify(presupuestos));
    } catch (error) {
      console.error('Error al guardar presupuestos:', error);
    }
  };

  const agregarPresupuesto = (presupuesto: NuevoPresupuesto) => {
    const nuevoPresupuesto: Presupuesto = {
      id: generarId(),
      ...presupuesto,
    };
    setPresupuestos(prev => [...prev, nuevoPresupuesto]);
  };

  const editarPresupuesto = (id: string, presupuestoActualizado: Partial<Omit<Presupuesto, 'id'>>) => {
    setPresupuestos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...presupuestoActualizado } : p))
    );
  };

  const eliminarPresupuesto = (id: string) => {
    setPresupuestos(prev => prev.filter(p => p.id !== id));
  };

  const obtenerPresupuestoPorCategoria = (categoriaId: string): Presupuesto | undefined => {
    return presupuestos.find(p => p.categoriaId === categoriaId);
  };

  const obtenerEstadisticasPresupuesto = (
    categoriaId: string,
    periodo: 'semanal' | 'mensual' | 'anual'
  ): EstadisticasPresupuesto | null => {
    const presupuesto = presupuestos.find(
      p => p.categoriaId === categoriaId && p.periodo === periodo
    );

    if (!presupuesto) return null;

    // Calcular fechas según el período
    const ahora = new Date();
    let fechaInicio = new Date();

    if (periodo === 'semanal') {
      fechaInicio.setDate(ahora.getDate() - 7);
    } else if (periodo === 'mensual') {
      fechaInicio.setMonth(ahora.getMonth() - 1);
    } else if (periodo === 'anual') {
      fechaInicio.setFullYear(ahora.getFullYear() - 1);
    }

    // Calcular total gastado en la categoría en el período
    const gastado = gastos
      .filter(g => {
        if (g.tipo !== 'gasto' || g.categoria !== categoriaId) return false;

        // Parsear la fecha del gasto (formato ISO)
        const fechaGasto = new Date(g.fecha);

        return fechaGasto >= fechaInicio && fechaGasto <= ahora;
      })
      .reduce((sum, g) => sum + g.monto, 0);

    const porcentaje = (gastado / presupuesto.monto) * 100;
    const excedido = gastado > presupuesto.monto;
    const debeAlertar = porcentaje >= presupuesto.alertaEn && !excedido;

    return {
      categoriaId,
      presupuesto: presupuesto.monto,
      gastado,
      porcentaje,
      excedido,
      debeAlertar,
    };
  };

  return (
    <PresupuestosContext.Provider
      value={{
        presupuestos,
        agregarPresupuesto,
        editarPresupuesto,
        eliminarPresupuesto,
        obtenerPresupuestoPorCategoria,
        obtenerEstadisticasPresupuesto,
      }}
    >
      {children}
    </PresupuestosContext.Provider>
  );
};

export const usePresupuestos = () => {
  const context = useContext(PresupuestosContext);
  if (!context) {
    throw new Error('usePresupuestos debe usarse dentro de PresupuestosProvider');
  }
  return context;
};
