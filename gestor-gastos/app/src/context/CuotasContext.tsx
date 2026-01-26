/**
 * Context para gestión de cuotas sin intereses
 * Maneja el estado global de compras a cuotas y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CuotaSinIntereses, NuevaCuota, EstadisticasCuotasTarjeta, ProyeccionCuotas } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { generarId } from '../utils';

interface CuotasContextType {
  cuotas: CuotaSinIntereses[];
  agregarCuota: (cuota: NuevaCuota) => void;
  editarCuota: (id: string, cuotaActualizada: Partial<Omit<CuotaSinIntereses, 'id'>>) => void;
  eliminarCuota: (id: string) => void;
  registrarPagoCuota: (id: string) => void;
  obtenerCuotasPorTarjeta: (tarjetaId: string) => CuotaSinIntereses[];
  obtenerEstadisticasTarjeta: (tarjetaId: string) => EstadisticasCuotasTarjeta;
  obtenerTotalCuotasMensual: () => number;
  calcularProximaFechaCuota: (tarjetaId: string, fechaCompra: string) => string;
  obtenerProyeccionCuotas: (mesesAdelante?: number) => ProyeccionCuotas[];
}

const CuotasContext = createContext<CuotasContextType | undefined>(undefined);

export const CuotasProvider = ({ children }: { children: ReactNode }) => {
  const [cuotas, setCuotas] = useState<CuotaSinIntereses[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarCuotas();
  }, []);

  useEffect(() => {
    if (cargado) {
      guardarCuotas();
    }
  }, [cuotas, cargado]);

  const cargarCuotas = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUOTAS);
      if (data) {
        setCuotas(JSON.parse(data));
      }
      setCargado(true);
    } catch (error) {
      console.error('Error al cargar cuotas:', error);
      setCargado(true);
    }
  };

  const guardarCuotas = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUOTAS, JSON.stringify(cuotas));
    } catch (error) {
      console.error('Error al guardar cuotas:', error);
    }
  };

  /**
   * Calcula la fecha de la próxima cuota basándose en el día de corte de la tarjeta
   * Para la Fase 1, simplificamos asumiendo que es el próximo mes desde la fecha de compra
   */
  const calcularProximaFechaCuota = (tarjetaId: string, fechaCompra: string): string => {
    const fecha = new Date(fechaCompra);
    // Por ahora, la próxima cuota es un mes después de la compra
    // En Fase 2 esto se integrará con la fecha de corte de la tarjeta
    fecha.setMonth(fecha.getMonth() + 1);
    return fecha.toISOString();
  };

  const agregarCuota = (cuota: NuevaCuota) => {
    const montoPorCuota = Number((cuota.montoTotal / cuota.cantidadCuotas).toFixed(2));
    const fechaProximaCuota = calcularProximaFechaCuota(cuota.tarjetaId, cuota.fechaCompra);
    const cuotasPagadas = cuota.cuotasPagadas ?? 0; // Usar el valor proporcionado o 0 por defecto

    const nuevaCuota: CuotaSinIntereses = {
      id: generarId(),
      ...cuota,
      montoPorCuota,
      cuotasPagadas,
      fechaProximaCuota,
      estado: cuotasPagadas >= cuota.cantidadCuotas ? 'completada' : 'activa',
    };

    setCuotas(prev => [...prev, nuevaCuota]);
  };

  const editarCuota = (id: string, cuotaActualizada: Partial<Omit<CuotaSinIntereses, 'id'>>) => {
    setCuotas(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const actualizada = { ...c, ...cuotaActualizada };

        // Recalcular montoPorCuota si cambió el monto total o cantidad de cuotas
        if (cuotaActualizada.montoTotal !== undefined || cuotaActualizada.cantidadCuotas !== undefined) {
          actualizada.montoPorCuota = Number((actualizada.montoTotal / actualizada.cantidadCuotas).toFixed(2));
        }

        return actualizada;
      })
    );
  };

  const eliminarCuota = (id: string) => {
    setCuotas(prev => prev.filter(c => c.id !== id));
  };

  /**
   * Registra el pago de una cuota mensual
   * Incrementa el contador de cuotas pagadas y actualiza la próxima fecha
   */
  const registrarPagoCuota = (id: string) => {
    setCuotas(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const nuevasCuotasPagadas = c.cuotasPagadas + 1;
        const estaCompleta = nuevasCuotasPagadas >= c.cantidadCuotas;

        // Calcular próxima fecha (un mes adelante)
        const proximaFecha = new Date(c.fechaProximaCuota);
        proximaFecha.setMonth(proximaFecha.getMonth() + 1);

        return {
          ...c,
          cuotasPagadas: nuevasCuotasPagadas,
          fechaProximaCuota: estaCompleta ? c.fechaProximaCuota : proximaFecha.toISOString(),
          estado: estaCompleta ? 'completada' : 'activa',
        };
      })
    );
  };

  /**
   * Obtiene todas las cuotas de una tarjeta específica
   */
  const obtenerCuotasPorTarjeta = (tarjetaId: string): CuotaSinIntereses[] => {
    return cuotas.filter(c => c.tarjetaId === tarjetaId && c.estado === 'activa');
  };

  /**
   * Calcula estadísticas de cuotas para una tarjeta
   */
  const obtenerEstadisticasTarjeta = (tarjetaId: string): EstadisticasCuotasTarjeta => {
    const cuotasTarjeta = obtenerCuotasPorTarjeta(tarjetaId);
    const cuotasActivas = cuotasTarjeta.length;
    const totalMensual = cuotasTarjeta.reduce((sum, c) => sum + c.montoPorCuota, 0);
    const totalPendiente = cuotasTarjeta.reduce(
      (sum, c) => sum + (c.montoTotal - c.montoPorCuota * c.cuotasPagadas),
      0
    );

    return {
      tarjetaId,
      cuotasActivas,
      totalMensual: Number(totalMensual.toFixed(2)),
      totalPendiente: Number(totalPendiente.toFixed(2)),
      cuotas: cuotasTarjeta,
    };
  };

  /**
   * Calcula el total mensual de todas las cuotas activas
   */
  const obtenerTotalCuotasMensual = (): number => {
    const total = cuotas
      .filter(c => c.estado === 'activa')
      .reduce((sum, c) => sum + c.montoPorCuota, 0);

    return Number(total.toFixed(2));
  };

  /**
   * Genera proyección de cuotas para los próximos N meses
   * Muestra cuánto se pagará cada mes y qué compras finalizan
   */
  const obtenerProyeccionCuotas = (mesesAdelante: number = 6): ProyeccionCuotas[] => {
    const proyecciones: ProyeccionCuotas[] = [];
    const hoy = new Date();
    const cuotasActivas = cuotas.filter(c => c.estado === 'activa');

    // Generar proyección para cada mes
    for (let i = 0; i < mesesAdelante; i++) {
      const fechaMes = new Date(hoy);
      fechaMes.setMonth(hoy.getMonth() + i);
      fechaMes.setDate(1); // Primer día del mes
      fechaMes.setHours(0, 0, 0, 0);

      const ultimoDiaMes = new Date(fechaMes);
      ultimoDiaMes.setMonth(fechaMes.getMonth() + 1);
      ultimoDiaMes.setDate(0); // Último día del mes
      ultimoDiaMes.setHours(23, 59, 59, 999);

      // Nombre del mes
      const nombreMes = fechaMes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

      let totalMes = 0;
      const cuotasQueFinalizan: CuotaSinIntereses[] = [];

      // Calcular cuotas activas en este mes
      cuotasActivas.forEach(cuota => {
        // Calcular cuántas cuotas quedan por pagar
        const cuotasPendientes = cuota.cantidadCuotas - cuota.cuotasPagadas;

        if (cuotasPendientes > 0) {
          // Verificar si esta cuota todavía estará activa en este mes
          // Calculamos en qué mes se pagará la última cuota
          const fechaProxima = new Date(cuota.fechaProximaCuota);
          const mesesHastaPrimeraCuota = i;
          const cuotasQuePagaraEnFuturo = cuotasPendientes;

          // Si esta cuota seguirá activa en este mes
          if (mesesHastaPrimeraCuota < cuotasQuePagaraEnFuturo) {
            totalMes += cuota.montoPorCuota;

            // Verificar si esta es la última cuota que se pagará en este mes
            if (mesesHastaPrimeraCuota === cuotasQuePagaraEnFuturo - 1) {
              cuotasQueFinalizan.push(cuota);
            }
          }
        }
      });

      proyecciones.push({
        mes: mesCapitalizado,
        totalCuotas: Number(totalMes.toFixed(2)),
        cuotasQueFinal: cuotasQueFinalizan,
      });
    }

    return proyecciones;
  };

  return (
    <CuotasContext.Provider
      value={{
        cuotas,
        agregarCuota,
        editarCuota,
        eliminarCuota,
        registrarPagoCuota,
        obtenerCuotasPorTarjeta,
        obtenerEstadisticasTarjeta,
        obtenerTotalCuotasMensual,
        calcularProximaFechaCuota,
        obtenerProyeccionCuotas,
      }}
    >
      {children}
    </CuotasContext.Provider>
  );
};

export const useCuotas = () => {
  const context = useContext(CuotasContext);
  if (!context) {
    throw new Error('useCuotas debe usarse dentro de CuotasProvider');
  }
  return context;
};
