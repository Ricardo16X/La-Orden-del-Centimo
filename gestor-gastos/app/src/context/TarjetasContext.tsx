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
   */
  const obtenerEstadoTarjeta = (tarjeta: TarjetaCredito): InfoEstadoTarjeta => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    // Calcular fechas de corte y pago
    let fechaCorte = new Date(añoActual, mesActual, tarjeta.diaCorte);
    let fechaPago = new Date(añoActual, mesActual, tarjeta.diaPago);

    // Si la fecha de corte ya pasó este mes, usar la del próximo mes
    if (diaActual >= tarjeta.diaCorte) {
      fechaCorte = new Date(añoActual, mesActual + 1, tarjeta.diaCorte);
    }

    // Si la fecha de pago ya pasó este mes, usar la del próximo mes
    if (diaActual >= tarjeta.diaPago) {
      fechaPago = new Date(añoActual, mesActual + 1, tarjeta.diaPago);
    }

    // Si el día de pago es antes del día de corte (pago del periodo anterior)
    if (tarjeta.diaPago < tarjeta.diaCorte && diaActual < tarjeta.diaPago) {
      // Estamos en el periodo de pago del mes anterior
      fechaCorte = new Date(añoActual, mesActual + 1, tarjeta.diaCorte);
    }

    const diasParaCorte = Math.ceil((fechaCorte.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    const diasParaPago = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    // Determinar estado
    let estado: EstadoTarjeta;
    let mensaje: string;
    let color: string;

    // Si falta menos de 3 días para pagar
    if (diasParaPago >= 0 && diasParaPago <= 3) {
      estado = 'pendiente_pago';
      mensaje = `Pago en ${diasParaPago} día${diasParaPago !== 1 ? 's' : ''}`;
      color = '#ef4444'; // Rojo
    }
    // Si faltan menos de 15 días para el corte
    else if (diasParaCorte >= 0 && diasParaCorte <= 15) {
      estado = 'cerca_corte';
      mensaje = `Corte en ${diasParaCorte} día${diasParaCorte !== 1 ? 's' : ''}`;
      color = '#f59e0b'; // Amarillo
    }
    // Periodo seguro para usar
    else {
      estado = 'seguro';
      const diasOptimos = Math.max(diasParaCorte, 0);
      mensaje = `Seguro usar (${diasOptimos} días hasta corte)`;
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
