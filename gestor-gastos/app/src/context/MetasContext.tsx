/**
 * Context para gestión de metas de ahorro
 * Maneja el estado global de metas y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meta, NuevaMeta, EstadisticasMeta, EstadoMeta } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { generarId } from '../utils';

interface MetasContextType {
  metas: Meta[];
  agregarMeta: (meta: NuevaMeta) => void;
  editarMeta: (id: string, metaActualizada: Partial<Omit<Meta, 'id'>>) => void;
  eliminarMeta: (id: string) => void;
  aportarAMeta: (id: string, monto: number) => Promise<{ exito: boolean; mensaje?: string }>;
  retirarDeMeta: (id: string, monto: number) => Promise<{ exito: boolean; mensaje?: string }>;
  obtenerEstadisticasMeta: (id: string) => EstadisticasMeta | null;
  actualizarEstadosMetas: () => void;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export const MetasProvider = ({ children }: { children: ReactNode }) => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarMetas();
  }, []);

  useEffect(() => {
    if (!cargado) return;
    const timer = setTimeout(() => guardarMetas(), 500);
    return () => clearTimeout(timer);
  }, [metas, cargado]);

  // Actualizar estados solo una vez al cargar
  useEffect(() => {
    if (cargado && metas.length > 0) {
      actualizarEstadosMetas();
    }
  }, [cargado]);

  const cargarMetas = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.METAS);
      if (data) {
        setMetas(JSON.parse(data));
      }
      setCargado(true);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      setCargado(true);
    }
  };

  const guardarMetas = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(metas));
    } catch (error) {
      console.error('Error al guardar metas:', error);
    }
  };

  const agregarMeta = (meta: NuevaMeta) => {
    const nuevaMeta: Meta = {
      id: generarId(),
      ...meta,
      montoActual: 0,
      estado: 'en_progreso',
    };
    setMetas(prev => [...prev, nuevaMeta]);
  };

  const editarMeta = (id: string, metaActualizada: Partial<Omit<Meta, 'id'>>) => {
    setMetas(prev =>
      prev.map(m => (m.id === id ? { ...m, ...metaActualizada } : m))
    );
  };

  const eliminarMeta = (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id));
  };

  const aportarAMeta = async (id: string, monto: number): Promise<{ exito: boolean; mensaje?: string }> => {
    if (monto <= 0) {
      return { exito: false, mensaje: 'El monto debe ser mayor a 0' };
    }

    const meta = metas.find(m => m.id === id);
    if (!meta) {
      return { exito: false, mensaje: 'Meta no encontrada' };
    }

    if (meta.estado === 'completada' && meta.montoActual >= meta.montoObjetivo) {
      return { exito: false, mensaje: 'Esta meta ya está completada' };
    }

    const disponible = meta.montoObjetivo - meta.montoActual;
    if (monto > disponible) {
      return { exito: false, mensaje: `El máximo que puedes aportar es ${disponible.toFixed(2)}` };
    }

    setMetas(prev =>
      prev.map(m => {
        if (m.id !== id) return m;

        const nuevoMontoActual = Math.min(m.montoActual + monto, m.montoObjetivo);
        const completada = nuevoMontoActual >= m.montoObjetivo;

        return {
          ...m,
          montoActual: nuevoMontoActual,
          estado: completada ? 'completada' as EstadoMeta : m.estado,
        };
      })
    );

    return { exito: true };
  };

  const retirarDeMeta = async (id: string, monto: number): Promise<{ exito: boolean; mensaje?: string }> => {
    if (monto <= 0) {
      return { exito: false, mensaje: 'El monto debe ser mayor a 0' };
    }

    const meta = metas.find(m => m.id === id);
    if (!meta) {
      return { exito: false, mensaje: 'Meta no encontrada' };
    }

    if (monto > meta.montoActual) {
      return { exito: false, mensaje: 'No puedes retirar más de lo que has aportado' };
    }

    setMetas(prev =>
      prev.map(m => {
        if (m.id !== id) return m;

        const nuevoMontoActual = m.montoActual - monto;

        return {
          ...m,
          montoActual: nuevoMontoActual,
          estado: m.estado === 'completada' ? 'completada' : 'en_progreso',
        };
      })
    );

    return { exito: true };
  };

  const obtenerEstadisticasMeta = (id: string): EstadisticasMeta | null => {
    const meta = metas.find(m => m.id === id);
    if (!meta) return null;

    const porcentajeCompletado = (meta.montoActual / meta.montoObjetivo) * 100;
    const montoFaltante = meta.montoObjetivo - meta.montoActual;

    // Fondo abierto: sin fecha límite
    if (!meta.fechaLimite) {
      return {
        porcentajeCompletado,
        montoFaltante,
        diasRestantes: null,
        ahorroRequeridoDiario: null,
        ahorroRequeridoSemanal: null,
        ahorroRequeridoMensual: null,
        enTiempo: true,
      };
    }

    const ahora = new Date();
    const fechaLimite = new Date(meta.fechaLimite);
    const fechaInicio = new Date(meta.fechaInicio);

    const diasTranscurridos = Math.floor(
      (ahora.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diasRestantes = Math.floor(
      (fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );

    const ahorroRequeridoDiario = diasRestantes > 0 ? montoFaltante / diasRestantes : 0;
    const ahorroRequeridoSemanal = ahorroRequeridoDiario * 7;
    const ahorroRequeridoMensual = ahorroRequeridoDiario * 30;

    const diasTotales = Math.floor(
      (fechaLimite.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const progresoEsperado = (diasTranscurridos / diasTotales) * 100;
    const enTiempo = porcentajeCompletado >= progresoEsperado;

    return {
      porcentajeCompletado,
      montoFaltante,
      diasRestantes,
      ahorroRequeridoDiario,
      ahorroRequeridoSemanal,
      ahorroRequeridoMensual,
      enTiempo,
    };
  };

  const actualizarEstadosMetas = () => {
    const ahora = new Date();

    setMetas(prev =>
      prev.map(meta => {
        if (meta.estado === 'completada') return meta;
        if (!meta.fechaLimite) return meta; // fondos abiertos nunca vencen

        const fechaLimite = new Date(meta.fechaLimite);

        if (ahora > fechaLimite && meta.montoActual < meta.montoObjetivo) {
          return { ...meta, estado: 'vencida' as EstadoMeta };
        }

        return meta;
      })
    );
  };

  return (
    <MetasContext.Provider
      value={{
        metas,
        agregarMeta,
        editarMeta,
        eliminarMeta,
        aportarAMeta,
        retirarDeMeta,
        obtenerEstadisticasMeta,
        actualizarEstadosMetas,
      }}
    >
      {children}
    </MetasContext.Provider>
  );
};

export const useMetas = () => {
  const context = useContext(MetasContext);
  if (!context) {
    throw new Error('useMetas debe usarse dentro de MetasProvider');
  }
  return context;
};
