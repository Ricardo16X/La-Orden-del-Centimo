import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logro, LogroDesbloqueado, LOGROS_DISPONIBLES } from '../types/logros';

interface LogrosContextType {
  logros: Logro[];
  logrosDesbloqueados: LogroDesbloqueado[];
  verificarLogro: (idLogro: string) => Promise<boolean>;
  desbloquearLogro: (idLogro: string) => Promise<Logro | null>;
  actualizarProgresoLogro: (idLogro: string, valorActual: number) => Promise<void>;
  obtenerProgreso: (idLogro: string) => number;
  totalLogrosDesbloqueados: number;
  porcentajeCompletado: number;
  ultimoLogroDesbloqueado: LogroDesbloqueado | null;
}

const LogrosContext = createContext<LogrosContextType | undefined>(undefined);

const STORAGE_KEY_LOGROS = '@logros';
const STORAGE_KEY_LOGROS_DESBLOQUEADOS = '@logros_desbloqueados';

export const LogrosProvider = ({ children }: { children: ReactNode }) => {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState<LogroDesbloqueado[]>([]);
  const [ultimoLogroDesbloqueado, setUltimoLogroDesbloqueado] = useState<LogroDesbloqueado | null>(null);

  useEffect(() => {
    cargarLogros();
  }, []);

  useEffect(() => {
    guardarLogros();
  }, [logros, logrosDesbloqueados]);

  const cargarLogros = async () => {
    try {
      const logrosGuardados = await AsyncStorage.getItem(STORAGE_KEY_LOGROS);
      const desbloqueadosGuardados = await AsyncStorage.getItem(STORAGE_KEY_LOGROS_DESBLOQUEADOS);

      if (logrosGuardados) {
        setLogros(JSON.parse(logrosGuardados));
      } else {
        // Inicializar logros desde la definición
        const logrosIniciales: Logro[] = LOGROS_DISPONIBLES.map(l => ({
          ...l,
          desbloqueado: false,
          progreso: 0,
          valorActual: 0,
        }));
        setLogros(logrosIniciales);
      }

      if (desbloqueadosGuardados) {
        setLogrosDesbloqueados(JSON.parse(desbloqueadosGuardados));
      }
    } catch (error) {
      console.error('Error cargando logros:', error);
    }
  };

  const guardarLogros = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LOGROS, JSON.stringify(logros));
      await AsyncStorage.setItem(STORAGE_KEY_LOGROS_DESBLOQUEADOS, JSON.stringify(logrosDesbloqueados));
    } catch (error) {
      console.error('Error guardando logros:', error);
    }
  };

  const verificarLogro = useCallback(async (idLogro: string): Promise<boolean> => {
    const logro = logros.find(l => l.id === idLogro);
    return logro?.desbloqueado || false;
  }, [logros]);

  const desbloquearLogro = useCallback(async (idLogro: string): Promise<Logro | null> => {
    const logro = logros.find(l => l.id === idLogro);

    if (!logro || logro.desbloqueado) {
      return null;
    }

    const logroDesbloqueado: Logro = {
      ...logro,
      desbloqueado: true,
      fechaDesbloqueo: new Date().toISOString(),
      progreso: 100,
    };

    const registroDesbloqueo: LogroDesbloqueado = {
      logro: logroDesbloqueado,
      timestamp: new Date().toISOString(),
    };

    setLogros(prev => prev.map(l => l.id === idLogro ? logroDesbloqueado : l));
    setLogrosDesbloqueados(prev => [...prev, registroDesbloqueo]);
    setUltimoLogroDesbloqueado(registroDesbloqueo);

    // Limpiar el último logro después de 5 segundos
    setTimeout(() => {
      setUltimoLogroDesbloqueado(null);
    }, 5000);

    return logroDesbloqueado;
  }, [logros]);

  const actualizarProgresoLogro = useCallback(async (idLogro: string, valorActual: number): Promise<Logro | null> => {
    const logro = logros.find(l => l.id === idLogro);

    if (!logro || logro.desbloqueado || !logro.meta) {
      return null;
    }

    const progreso = Math.min(100, (valorActual / logro.meta) * 100);

    setLogros(prev => prev.map(l =>
      l.id === idLogro
        ? { ...l, valorActual, progreso }
        : l
    ));

    // Auto-desbloquear si alcanzó la meta
    if (valorActual >= logro.meta) {
      return await desbloquearLogro(idLogro);
    }

    return null;
  }, [logros, desbloquearLogro]);

  const obtenerProgreso = useCallback((idLogro: string): number => {
    const logro = logros.find(l => l.id === idLogro);
    return logro?.progreso || 0;
  }, [logros]);

  const totalLogrosDesbloqueados = logrosDesbloqueados.length;
  const porcentajeCompletado = logros.length > 0
    ? (totalLogrosDesbloqueados / logros.length) * 100
    : 0;

  return (
    <LogrosContext.Provider
      value={{
        logros,
        logrosDesbloqueados,
        verificarLogro,
        desbloquearLogro,
        actualizarProgresoLogro,
        obtenerProgreso,
        totalLogrosDesbloqueados,
        porcentajeCompletado,
        ultimoLogroDesbloqueado,
      }}
    >
      {children}
    </LogrosContext.Provider>
  );
};

export const useLogros = () => {
  const context = useContext(LogrosContext);
  if (!context) {
    throw new Error('useLogros debe usarse dentro de LogrosProvider');
  }
  return context;
};
