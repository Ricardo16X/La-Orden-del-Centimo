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
import { useMonedas } from './MonedasContext';

interface PresupuestosContextType {
  presupuestos: Presupuesto[];
  agregarPresupuesto: (presupuesto: NuevoPresupuesto) => void;
  editarPresupuesto: (id: string, presupuestoActualizado: Partial<Omit<Presupuesto, 'id'>>) => void;
  eliminarPresupuesto: (id: string) => void;
  obtenerPresupuestoPorCategoria: (categoriaId: string, periodo?: 'semanal' | 'mensual' | 'anual') => Presupuesto | undefined;
  obtenerEstadisticasPresupuesto: (categoriaId: string, periodo: 'semanal' | 'mensual' | 'anual') => EstadisticasPresupuesto | null;
}

const PresupuestosContext = createContext<PresupuestosContextType | undefined>(undefined);

export const PresupuestosProvider = ({ children }: { children: ReactNode }) => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargado, setCargado] = useState(false);
  const { gastos } = useGastos();
  const { monedaBase, obtenerMoneda } = useMonedas();

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  useEffect(() => {
    if (!cargado) return;
    const timer = setTimeout(() => guardarPresupuestos(), 500);
    return () => clearTimeout(timer);
  }, [presupuestos, cargado]);

  // Repara duplicados por categoria+periodo dejados por el bug de "Sugerir presupuesto",
  // que agregaba un presupuesto nuevo en vez de actualizar el existente. Conserva el mas reciente.
  useEffect(() => {
    if (!cargado) return;
    setPresupuestos(prev => {
      const vistos = new Set<string>();
      const sinDuplicados: Presupuesto[] = [];
      for (let i = prev.length - 1; i >= 0; i--) {
        const clave = `${prev[i].categoriaId}-${prev[i].periodo}`;
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        sinDuplicados.unshift(prev[i]);
      }
      return sinDuplicados.length === prev.length ? prev : sinDuplicados;
    });
  }, [cargado]);

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

  const obtenerPresupuestoPorCategoria = (
    categoriaId: string,
    periodo?: 'semanal' | 'mensual' | 'anual'
  ): Presupuesto | undefined => {
    return presupuestos.find(p => p.categoriaId === categoriaId && (!periodo || p.periodo === periodo));
  };

  const obtenerEstadisticasPresupuesto = (
    categoriaId: string,
    periodo: 'semanal' | 'mensual' | 'anual'
  ): EstadisticasPresupuesto | null => {
    const presupuesto = presupuestos.find(
      p => p.categoriaId === categoriaId && p.periodo === periodo
    );

    if (!presupuesto) return null;

    // Calcular fechas según el período (usando períodos de calendario)
    const ahora = new Date();
    let fechaInicio = new Date();
    let fechaFin = new Date();

    if (periodo === 'semanal') {
      // Inicio de la semana actual (lunes)
      const diaSemana = ahora.getDay();
      const diasDesdelunes = diaSemana === 0 ? 6 : diaSemana - 1;
      fechaInicio = new Date(ahora);
      fechaInicio.setDate(ahora.getDate() - diasDesdelunes);
      fechaInicio.setHours(0, 0, 0, 0);
      // Fin de semana (domingo)
      fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaInicio.getDate() + 6);
      fechaFin.setHours(23, 59, 59, 999);
    } else if (periodo === 'mensual') {
      // Inicio del mes actual
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
      // Fin del mes actual
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (periodo === 'anual') {
      // Inicio del año actual
      fechaInicio = new Date(ahora.getFullYear(), 0, 1, 0, 0, 0, 0);
      // Fin del año actual
      fechaFin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    // Calcular días restantes del período
    const diasRestantes = Math.max(0, Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)));

    // Normalizar moneda del presupuesto (compatibilidad con datos anteriores sin monedaId)
    const monedaBase_ = monedaBase?.codigo || 'GTQ';
    const monedaPresupuesto = presupuesto.monedaId || monedaBase_;

    // Obtener el tipo de cambio de la moneda del presupuesto para conversión dinámica
    const monedaPresupuestoInfo = obtenerMoneda(monedaPresupuesto);
    const tipoCambioPresupuesto = monedaPresupuestoInfo?.tipoCambio || 1.0;

    // Calcular total gastado en la categoría en el período (con conversión de moneda)
    const gastado = gastos
      .filter(g => {
        if (g.tipo !== 'gasto' || g.categoria !== categoriaId) return false;

        const fechaGasto = new Date(g.fecha);
        return fechaGasto >= fechaInicio && fechaGasto <= ahora;
      })
      .reduce((sum, g) => {
        // Usar el monto en moneda base
        const montoBase = g.montoEnMonedaBase ?? g.monto;
        // Convertir de moneda base a la moneda del presupuesto
        const montoEnMonedaPresupuesto = montoBase / tipoCambioPresupuesto;
        return sum + montoEnMonedaPresupuesto;
      }, 0);

    if (presupuesto.monto <= 0) {
      return {
        categoriaId,
        presupuesto: presupuesto.monto,
        gastado,
        porcentaje: 0,
        excedido: false,
        debeAlertar: false,
        diasRestantes,
      };
    }

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
      diasRestantes,
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
