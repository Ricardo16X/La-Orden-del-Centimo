/**
 * Context para gestión de cuotas sin intereses
 * Maneja el estado global de compras a cuotas y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CuotaSinIntereses, NuevaCuota, EstadisticasCuotasTarjeta, ProyeccionCuotas } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { generarId } from '../utils';
import { useTarjetas } from './TarjetasContext';

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
  const { obtenerTarjetaPorId } = useTarjetas();

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
   *
   * LÓGICA (Guatemala):
   * - El día de corte es INCLUSIVO: compras del día de corte aún entran al ciclo actual
   * - El nuevo ciclo empieza el DÍA SIGUIENTE al corte
   * - La primera cuota aparece en el próximo corte DESPUÉS de que la compra entre al sistema
   *
   * Escenarios:
   * 1. Hoy es 12 de enero, corte día 20:
   *    - La compra entra al ciclo de enero (aún no corta)
   *    - Primera cuota: 20 de enero
   *
   * 2. Hoy es 22 de enero, corte día 20:
   *    - El corte de enero ya pasó (nuevo ciclo empezó el 21)
   *    - La compra entra al ciclo de febrero
   *    - Primera cuota: 20 de febrero
   */
  const calcularProximaFechaCuota = (tarjetaId: string, _fechaCompra: string): string => {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    // Obtener el día de corte de la tarjeta
    const tarjeta = obtenerTarjetaPorId(tarjetaId);
    const diaCorte = tarjeta?.diaCorte || 1;

    let mesCuota = mesActual;
    let añoCuota = añoActual;

    // Si el día de corte ya pasó este mes, la cuota va al mes siguiente
    // El día de corte es INCLUSIVO, así que usamos > (no >=)
    if (diaActual > diaCorte) {
      mesCuota += 1;
      if (mesCuota > 11) {
        mesCuota = 0;
        añoCuota += 1;
      }
    }

    // Manejar meses con menos días (ej: día 31 en febrero)
    const ultimoDiaDelMes = new Date(añoCuota, mesCuota + 1, 0).getDate();
    const diaCuotaFinal = Math.min(diaCorte, ultimoDiaDelMes);

    const fechaCuota = new Date(añoCuota, mesCuota, diaCuotaFinal);
    fechaCuota.setHours(12, 0, 0, 0);

    return fechaCuota.toISOString();
  };

  /**
   * Agrega una nueva cuota
   *
   * Si se especifican cuotas ya pagadas, ajusta la fecha de próxima cuota
   * considerando que esas cuotas ya pasaron.
   */
  const agregarCuota = (cuota: NuevaCuota) => {
    const montoPorCuota = Number((cuota.montoTotal / cuota.cantidadCuotas).toFixed(2));
    const cuotasPagadas = cuota.cuotasPagadas ?? 0;

    // Calcular la fecha base de la primera cuota (considerando el día de corte)
    const fechaBaseCuota = calcularProximaFechaCuota(cuota.tarjetaId, cuota.fechaCompra);

    // La fecha de próxima cuota es la base (para cuotas sin pagos previos)
    // Si ya hay cuotas pagadas, la próxima cuota es inmediata desde la base
    // porque estamos registrando una compra existente
    const fechaProximaCuota = fechaBaseCuota;

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
   * Mantiene el día de corte de la tarjeta al avanzar al siguiente mes
   */
  const registrarPagoCuota = (id: string) => {
    setCuotas(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const nuevasCuotasPagadas = c.cuotasPagadas + 1;
        const estaCompleta = nuevasCuotasPagadas >= c.cantidadCuotas;

        // Obtener el día de corte de la tarjeta para mantener consistencia
        const tarjeta = obtenerTarjetaPorId(c.tarjetaId);
        const diaCorte = tarjeta?.diaCorte || new Date(c.fechaProximaCuota).getDate();

        // Calcular próxima fecha manteniendo el día de corte
        const fechaActual = new Date(c.fechaProximaCuota);
        const siguienteMes = fechaActual.getMonth() + 1;
        const siguienteAño = siguienteMes > 11 ? fechaActual.getFullYear() + 1 : fechaActual.getFullYear();
        const mesNormalizado = siguienteMes > 11 ? 0 : siguienteMes;

        // Manejar meses con menos días
        const ultimoDiaDelMes = new Date(siguienteAño, mesNormalizado + 1, 0).getDate();
        const diaCuotaFinal = Math.min(diaCorte, ultimoDiaDelMes);

        const proximaFecha = new Date(siguienteAño, mesNormalizado, diaCuotaFinal, 12, 0, 0, 0);

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
   *
   * LÓGICA:
   * - Usa `fechaProximaCuota` de cada cuota como punto de inicio
   * - Esta fecha ya considera el día de corte de la tarjeta
   * - Calcula cuántos meses desde esa fecha hasta cada mes de proyección
   */
  const obtenerProyeccionCuotas = (mesesAdelante: number = 6): ProyeccionCuotas[] => {
    const proyecciones: ProyeccionCuotas[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const cuotasActivas = cuotas.filter(c => c.estado === 'activa');

    // Generar proyección para cada mes
    for (let i = 0; i < mesesAdelante; i++) {
      const fechaMes = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);

      // Nombre del mes
      const nombreMes = fechaMes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

      let totalMes = 0;
      const cuotasQueFinalizan: CuotaSinIntereses[] = [];

      // Calcular cuotas activas en este mes
      cuotasActivas.forEach(cuota => {
        const cuotasPendientes = cuota.cantidadCuotas - cuota.cuotasPagadas;
        if (cuotasPendientes <= 0) return;

        // Obtener la fecha de la primera cuota pendiente
        const fechaPrimeraCuota = new Date(cuota.fechaProximaCuota);
        fechaPrimeraCuota.setHours(0, 0, 0, 0);

        // Calcular en qué "índice de mes" cae la primera cuota
        // Ejemplo: si hoy es enero y la primera cuota es en febrero, índice = 1
        const mesPrimeraCuota = fechaPrimeraCuota.getMonth();
        const añoPrimeraCuota = fechaPrimeraCuota.getFullYear();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        // Calcular cuántos meses hay desde hoy hasta la primera cuota
        const mesesHastaPrimeraCuota = (añoPrimeraCuota - añoActual) * 12 + (mesPrimeraCuota - mesActual);

        // Calcular el índice de cuota para el mes de proyección actual (i)
        // Si i = 0 (mes actual) y mesesHastaPrimeraCuota = 0, es la primera cuota
        // Si i = 1 y mesesHastaPrimeraCuota = 0, es la segunda cuota
        const indiceCuotaEnEsteMes = i - mesesHastaPrimeraCuota;

        // Verificar si esta cuota debe pagarse en el mes de proyección actual
        // indiceCuotaEnEsteMes >= 0: la primera cuota ya debió haberse cobrado o se cobra este mes
        // indiceCuotaEnEsteMes < cuotasPendientes: aún quedan cuotas por pagar
        if (indiceCuotaEnEsteMes >= 0 && indiceCuotaEnEsteMes < cuotasPendientes) {
          totalMes += cuota.montoPorCuota;

          // Verificar si esta es la última cuota
          if (indiceCuotaEnEsteMes === cuotasPendientes - 1) {
            cuotasQueFinalizan.push(cuota);
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
