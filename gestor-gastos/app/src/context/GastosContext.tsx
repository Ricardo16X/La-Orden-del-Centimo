/**
 * Context para gestión de gastos
 * Maneja el estado global de gastos y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Gasto, NuevoGasto, ActualizacionGasto } from '../types';
import { cargarGastos, guardarGastos } from '../services/storage';
import { generarId, getFechaActual } from '../utils';
import { useMonedas } from './MonedasContext';
import { useToast } from './ToastContext';

interface GastosContextType {
  gastos: Gasto[];
  agregarGasto: (gasto: NuevoGasto) => void;
  editarGasto: (id: string, gastoActualizado: ActualizacionGasto) => void;
  eliminarGasto: (id: string) => void;
  totalGastado: number;
  totalIngresos: number;
  balance: number;
  ultimoGastoAgregado: Gasto | null;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export const GastosProvider = ({ children }: { children: ReactNode }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ultimoGastoAgregado, setUltimoGastoAgregado] = useState<Gasto | null>(null);
  const [cargado, setCargado] = useState(false);
  const { monedaBase, obtenerMoneda } = useMonedas();
  const { showToast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!cargado) return;
    const timer = setTimeout(() => guardarGastos(gastos), 500);
    return () => clearTimeout(timer);
  }, [gastos, cargado]);

  const cargarDatos = async () => {
    try {
      const gastosGuardados = await cargarGastos();
      setGastos(gastosGuardados);
    } catch {
      showToast('Error al cargar tus gastos. Reinicia la app.', 'error');
    } finally {
      setCargado(true);
    }
  };

  const agregarGasto = (gasto: NuevoGasto) => {
    // Si no se especificó moneda, usar la moneda base
    const codigoMoneda = gasto.moneda || monedaBase?.codigo || 'GTQ';
    const moneda = obtenerMoneda(codigoMoneda);

    // Calcular el tipo de cambio y monto en moneda base
    const tipoCambio = moneda?.tipoCambio || 1.0;
    const montoEnMonedaBase = gasto.monto * tipoCambio;

    const nuevoGasto: Gasto = {
      id: generarId(),
      fecha: getFechaActual(),
      tipo: 'gasto',
      ...gasto,
      moneda: codigoMoneda,
      tipoCambio,
      montoEnMonedaBase,
    };
    setGastos(prev => {
      const nuevos = [nuevoGasto, ...prev];
      return nuevos;
    });
    setUltimoGastoAgregado(nuevoGasto);
  };

  const editarGasto = (id: string, gastoActualizado: ActualizacionGasto) => {
    const nuevosGastos = gastos.map(gasto => {
      if (gasto.id !== id) return gasto;

      const actualizado = { ...gasto, ...gastoActualizado };

      if (gastoActualizado.monto !== undefined || gastoActualizado.moneda !== undefined) {
        const codigoMoneda = actualizado.moneda || monedaBase?.codigo || 'GTQ';
        const moneda = obtenerMoneda(codigoMoneda);
        actualizado.tipoCambio = moneda?.tipoCambio ?? 1.0;
        actualizado.montoEnMonedaBase = actualizado.monto * actualizado.tipoCambio;
      }

      return actualizado;
    });
    setGastos(nuevosGastos);
  };

  const eliminarGasto = (id: string) => {
    setGastos(prev => prev.filter(gasto => gasto.id !== id));
  };

  const totalGastado = useMemo(
    () => gastos.filter(g => g.tipo === 'gasto').reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0),
    [gastos]
  );

  const totalIngresos = useMemo(
    () => gastos.filter(g => g.tipo === 'ingreso').reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0),
    [gastos]
  );

  const balance = useMemo(() => totalIngresos - totalGastado, [totalIngresos, totalGastado]);

  return (
    <GastosContext.Provider
      value={{
        gastos,
        agregarGasto,
        editarGasto,
        eliminarGasto,
        totalGastado,
        totalIngresos,
        balance,
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