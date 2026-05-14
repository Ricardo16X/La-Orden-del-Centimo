/**
 * Context para gestión del balance financiero global
 * Calcula automáticamente ingresos, gastos y dinero reservado en metas
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Balance, ResumenBalance } from '../types';
import { useGastos } from './GastosContext';
import { useMetas } from './MetasContext';
import { useMonedas } from './MonedasContext';

interface BalanceContextType {
  balance: Balance;
  resumen: ResumenBalance;
  tieneBalanceDisponible: (monto: number) => boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { gastos } = useGastos();
  const { metas } = useMetas();
  const { obtenerMoneda } = useMonedas();

  // Calcular balance automáticamente
  // Usa montoEnMonedaBase para considerar conversiones de moneda
  const balance = useMemo((): Balance => {
    const totalIngresos = gastos
      .filter(g => g.tipo === 'ingreso')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const totalGastos = gastos
      .filter(g => g.tipo === 'gasto')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    // Solo contar dinero en metas activas (en progreso o completadas)
    // Convertir a moneda base usando el tipo de cambio de cada meta
    const totalReservado = metas
      .filter(m => m.estado === 'en_progreso' || m.estado === 'completada')
      .reduce((sum, m) => {
        const moneda = obtenerMoneda(m.monedaId);
        const tipoCambio = moneda?.tipoCambio || 1.0;
        return sum + (m.montoActual * tipoCambio);
      }, 0);

    const balanceTotal = totalIngresos - totalGastos;
    const balanceDisponible = balanceTotal - totalReservado;

    return {
      totalIngresos,
      totalGastos,
      totalReservado,
      balanceTotal,
      balanceDisponible,
    };
  }, [gastos, metas, obtenerMoneda]);

  // Calcular resumen con tendencia
  const resumen = useMemo((): ResumenBalance => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

    const sumarBalance = (lista: typeof gastos) => {
      const ing = lista.filter(g => g.tipo === 'ingreso').reduce((s, g) => s + (g.montoEnMonedaBase || g.monto), 0);
      const gas = lista.filter(g => g.tipo === 'gasto').reduce((s, g) => s + (g.montoEnMonedaBase || g.monto), 0);
      return ing - gas;
    };

    // Balance generado solo en el mes actual y en el mes anterior (mes vs mes)
    const delMesActual = gastos.filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });
    const delMesAnterior = gastos.filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mesAnterior && f.getFullYear() === anioAnterior;
    });

    const balanceMesActual = sumarBalance(delMesActual);
    const balanceMesAnterior = sumarBalance(delMesAnterior);

    // Cambio porcentual entre el resultado neto de cada mes
    let cambioMensual = 0;
    if (balanceMesAnterior !== 0) {
      cambioMensual = ((balanceMesActual - balanceMesAnterior) / Math.abs(balanceMesAnterior)) * 100;
    }

    // Determinar tendencia
    let tendencia: 'positiva' | 'negativa' | 'neutral' = 'neutral';
    if (cambioMensual > 5) tendencia = 'positiva';
    else if (cambioMensual < -5) tendencia = 'negativa';

    return {
      balance,
      tendencia,
      cambioMensual,
    };
  }, [balance, gastos]);

  // Verificar si hay balance disponible suficiente
  const tieneBalanceDisponible = (monto: number): boolean => {
    return balance.balanceDisponible >= monto;
  };

  return (
    <BalanceContext.Provider
      value={{
        balance,
        resumen,
        tieneBalanceDisponible,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance debe usarse dentro de BalanceProvider');
  }
  return context;
};
