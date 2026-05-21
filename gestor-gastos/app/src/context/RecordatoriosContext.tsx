/**
 * Context para gestión de recordatorios
 * Maneja el estado global de recordatorios y su persistencia
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Recordatorio, NuevoRecordatorio } from '../types';
import { cargarRecordatorios, guardarRecordatorios } from '../services/storage';
import { generarId } from '../utils';

const cancelarNotificacionesDeRecordatorio = (notificationId?: string) => {
  if (!notificationId) return;
  notificationId.split('|').forEach(id =>
    Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
  );
};

interface RecordatoriosContextType {
  recordatorios: Recordatorio[];
  agregarRecordatorio: (recordatorio: NuevoRecordatorio) => Recordatorio;
  editarRecordatorio: (id: string, datos: Partial<Omit<Recordatorio, 'id'>>) => void;
  eliminarRecordatorio: (id: string) => void;
  toggleRecordatorio: (id: string) => void;
}

const RecordatoriosContext = createContext<RecordatoriosContextType | undefined>(undefined);

export const RecordatoriosProvider = ({ children }: { children: ReactNode }) => {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cargado) {
      guardarRecordatorios(recordatorios);
    }
  }, [recordatorios, cargado]);

  const cargarDatos = async () => {
    const recordatoriosGuardados = await cargarRecordatorios();
    setRecordatorios(recordatoriosGuardados);
    setCargado(true);
  };

  const agregarRecordatorio = (recordatorio: NuevoRecordatorio): Recordatorio => {
    const nuevoRecordatorio: Recordatorio = {
      id: generarId(),
      ...recordatorio,
    };
    setRecordatorios(prev => [...prev, nuevoRecordatorio]);
    return nuevoRecordatorio;
  };

  const editarRecordatorio = (id: string, datos: Partial<Omit<Recordatorio, 'id'>>) => {
    setRecordatorios(prev =>
      prev.map(r => (r.id === id ? { ...r, ...datos } : r))
    );
  };

  const eliminarRecordatorio = (id: string) => {
    const recordatorio = recordatorios.find(r => r.id === id);
    cancelarNotificacionesDeRecordatorio(recordatorio?.notificationId);
    setRecordatorios(prev => prev.filter(r => r.id !== id));
  };

  const toggleRecordatorio = (id: string) => {
    setRecordatorios(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        // Si se está desactivando, cancelar las notificaciones pendientes
        if (r.activo) {
          cancelarNotificacionesDeRecordatorio(r.notificationId);
        }
        return { ...r, activo: !r.activo };
      })
    );
  };

  return (
    <RecordatoriosContext.Provider
      value={{
        recordatorios,
        agregarRecordatorio,
        editarRecordatorio,
        eliminarRecordatorio,
        toggleRecordatorio,
      }}
    >
      {children}
    </RecordatoriosContext.Provider>
  );
};

export const useRecordatorios = () => {
  const context = useContext(RecordatoriosContext);
  if (!context) {
    throw new Error('useRecordatorios debe usarse dentro de RecordatoriosProvider');
  }
  return context;
};
