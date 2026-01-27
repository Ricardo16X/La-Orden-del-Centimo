/**
 * Context para gestión del balance financiero global
 * Calcula automáticamente ingresos, gastos y dinero reservado en metas
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Balance, ResumenBalance } from '../types';
import { useGastos } from './GastosContext';
import { useMetas } from './MetasContext';

interface BalanceContextType {
  balance: Balance;
  resumen: ResumenBalance;
  tieneBalanceDisponible: (monto: number) => boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { gastos } = useGastos();
  const { metas } = useMetas();

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
    const totalReservado = metas
      .filter(m => m.estado === 'en_progreso' || m.estado === 'completada')
      .reduce((sum, m) => sum + m.montoActual, 0);

    const balanceTotal = totalIngresos - totalGastos;
    const balanceDisponible = balanceTotal - totalReservado;

    return {
      totalIngresos,
      totalGastos,
      totalReservado,
      balanceTotal,
      balanceDisponible,
    };
  }, [gastos, metas]);

  // Calcular resumen con tendencia
  const resumen = useMemo((): ResumenBalance => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    // Calcular balance del mes anterior
    const gastosDelMesAnterior = gastos.filter(g => {
      const fecha = new Date(g.fecha);
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();

      // Mes anterior
      const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
      const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

      return mes === mesAnterior && anio === anioAnterior;
    });

    const ingresosAnterior = gastosDelMesAnterior
      .filter(g => g.tipo === 'ingreso')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const gastosAnterior = gastosDelMesAnterior
      .filter(g => g.tipo === 'gasto')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const balanceAnterior = ingresosAnterior - gastosAnterior;

    // Calcular cambio porcentual
    let cambioMensual = 0;
    if (balanceAnterior !== 0) {
      cambioMensual = ((balance.balanceTotal - balanceAnterior) / Math.abs(balanceAnterior)) * 100;
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
