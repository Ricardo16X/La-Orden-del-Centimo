/**
 * Context para gestión de tarjetas de crédito
 * Maneja el estado global de tarjetas y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TarjetaCredito, NuevaTarjeta, InfoEstadoTarjeta, EstadoTarjeta } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { generarId } from '../utils';

interface TarjetasContextType {
  tarjetas: TarjetaCredito[];
  agregarTarjeta: (tarjeta: NuevaTarjeta) => void;
  editarTarjeta: (id: string, tarjetaActualizada: Partial<Omit<TarjetaCredito, 'id'>>) => void;
  eliminarTarjeta: (id: string) => void;
  obtenerEstadoTarjeta: (tarjeta: TarjetaCredito) => InfoEstadoTarjeta;
  obtenerTarjetaPorId: (id: string) => TarjetaCredito | undefined;
  obtenerCategoriaTarjeta: (tarjetaId: string) => string;
}

const TarjetasContext = createContext<TarjetasContextType | undefined>(undefined);

export const TarjetasProvider = ({ children }: { children: ReactNode }) => {
  const [tarjetas, setTarjetas] = useState<TarjetaCredito[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarTarjetas();
  }, []);

  useEffect(() => {
    if (cargado) {
      guardarTarjetas();
    }
  }, [tarjetas, cargado]);

  const cargarTarjetas = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TARJETAS);
      if (data) {
        setTarjetas(JSON.parse(data));
      }
      setCargado(true);
    } catch (error) {
      console.error('Error al cargar tarjetas:', error);
      setCargado(true);
    }
  };

  const guardarTarjetas = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TARJETAS, JSON.stringify(tarjetas));
    } catch (error) {
      console.error('Error al guardar tarjetas:', error);
    }
  };

  const agregarTarjeta = (tarjeta: NuevaTarjeta) => {
    const nuevaTarjeta: TarjetaCredito = {
      id: generarId(),
      ...tarjeta,
    };
    setTarjetas(prev => [...prev, nuevaTarjeta]);
  };

  const editarTarjeta = (id: string, tarjetaActualizada: Partial<Omit<TarjetaCredito, 'id'>>) => {
    setTarjetas(prev =>
      prev.map(t => (t.id === id ? { ...t, ...tarjetaActualizada } : t))
    );
  };

  const eliminarTarjeta = (id: string) => {
    setTarjetas(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Calcula el estado actual de una tarjeta basado en las fechas
   *
   * LÓGICA DE TARJETAS (Guatemala):
   * - Día de corte: Es INCLUSIVO. Las compras del día de corte aún entran al estado de cuenta actual.
   *   El nuevo ciclo de facturación comienza el DÍA SIGUIENTE al corte.
   * - Día de pago: Es el ÚLTIMO día para pagar sin caer en mora.
   *
   * Ejemplo: Corte día 20, Pago día 10
   * - Compras del 21 de enero al 20 de febrero → Estado de cuenta de febrero
   * - Pago de ese estado: hasta el 10 de marzo
   */
  const obtenerEstadoTarjeta = (tarjeta: TarjetaCredito): InfoEstadoTarjeta => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    // Calcular próxima fecha de corte
    // El día de corte es inclusivo: compras de HOY aún cuentan si hoy <= diaCorte
    let fechaCorte: Date;
    if (diaActual <= tarjeta.diaCorte) {
      // Aún no ha llegado el corte de este mes
      fechaCorte = new Date(añoActual, mesActual, tarjeta.diaCorte);
    } else {
      // El corte de este mes ya pasó, el próximo es el del siguiente mes
      fechaCorte = new Date(añoActual, mesActual + 1, tarjeta.diaCorte);
    }

    // Calcular próxima fecha de pago
    // El día de pago es el último día para pagar (inclusivo)
    let fechaPago: Date;

    // Caso especial: cuando el día de pago es ANTES del día de corte en el calendario
    // Ejemplo: Corte día 20, Pago día 10 → El pago del 10 de febrero es para el corte del 20 de enero
    if (tarjeta.diaPago < tarjeta.diaCorte) {
      // El pago es en el mes siguiente al corte
      if (diaActual <= tarjeta.diaPago) {
        // Aún no ha llegado el día de pago de este mes
        // Este pago corresponde al corte del mes anterior
        fechaPago = new Date(añoActual, mesActual, tarjeta.diaPago);
      } else if (diaActual <= tarjeta.diaCorte) {
        // Ya pasó el pago de este mes, pero aún no corta
        // El próximo pago es el del siguiente mes (para el corte de este mes)
        fechaPago = new Date(añoActual, mesActual + 1, tarjeta.diaPago);
      } else {
        // Ya pasó el corte de este mes
        // El próximo pago es el del siguiente mes
        fechaPago = new Date(añoActual, mesActual + 1, tarjeta.diaPago);
      }
    } else {
      // Caso normal: día de pago es DESPUÉS del día de corte
      // Ejemplo: Corte día 10, Pago día 25
      if (diaActual <= tarjeta.diaPago) {
        fechaPago = new Date(añoActual, mesActual, tarjeta.diaPago);
      } else {
        fechaPago = new Date(añoActual, mesActual + 1, tarjeta.diaPago);
      }
    }

    // Calcular días restantes
    const diasParaCorte = Math.ceil((fechaCorte.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    const diasParaPago = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    // Determinar estado y mensaje
    let estado: EstadoTarjeta;
    let mensaje: string;
    let color: string;

    // PRIORIDAD 1: Pago urgente (0-3 días para pagar)
    if (diasParaPago >= 0 && diasParaPago <= 3) {
      estado = 'pendiente_pago';
      if (diasParaPago === 0) {
        mensaje = '¡Último día para pagar!';
        color = '#dc2626'; // Rojo intenso
      } else if (diasParaPago === 1) {
        mensaje = 'Pago mañana';
        color = '#ef4444'; // Rojo
      } else {
        mensaje = `Pago en ${diasParaPago} días`;
        color = '#ef4444'; // Rojo
      }
    }
    // PRIORIDAD 2: Cerca del corte (0-5 días)
    else if (diasParaCorte >= 0 && diasParaCorte <= 5) {
      estado = 'cerca_corte';
      if (diasParaCorte === 0) {
        mensaje = 'Corte hoy (último día del ciclo)';
        color = '#d97706'; // Naranja
      } else if (diasParaCorte === 1) {
        mensaje = 'Corte mañana';
        color = '#f59e0b'; // Amarillo
      } else {
        mensaje = `Corte en ${diasParaCorte} días`;
        color = '#f59e0b'; // Amarillo
      }
    }
    // PRIORIDAD 3: Seguro para usar
    else {
      estado = 'seguro';
      mensaje = `${diasParaCorte} días hasta corte`;
      color = '#10b981'; // Verde
    }

    return {
      tarjetaId: tarjeta.id,
      estado,
      diasParaCorte,
      diasParaPago,
      mensaje,
      color,
    };
  };

  /**
   * Obtiene una tarjeta por su ID
   */
  const obtenerTarjetaPorId = (id: string): TarjetaCredito | undefined => {
    return tarjetas.find(t => t.id === id);
  };

  /**
   * Genera el nombre de categoría automática para una tarjeta
   * Formato: "💳 Cuotas - [Nombre Tarjeta]"
   */
  const obtenerCategoriaTarjeta = (tarjetaId: string): string => {
    const tarjeta = obtenerTarjetaPorId(tarjetaId);
    if (!tarjeta) return '💳 Cuotas';
    return `💳 Cuotas - ${tarjeta.nombre}`;
  };

  return (
    <TarjetasContext.Provider
      value={{
        tarjetas,
        agregarTarjeta,
        editarTarjeta,
        eliminarTarjeta,
        obtenerEstadoTarjeta,
        obtenerTarjetaPorId,
        obtenerCategoriaTarjeta,
      }}
    >
      {children}
    </TarjetasContext.Provider>
  );
};

export const useTarjetas = () => {
  const context = useContext(TarjetasContext);
  if (!context) {
    throw new Error('useTarjetas debe usarse dentro de TarjetasProvider');
  }
  return context;
};
