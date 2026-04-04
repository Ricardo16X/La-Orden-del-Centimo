/**
 * Hook que, al iniciar la app, detecta recordatorios activos cuyas
 * notificaciones ya no están pendientes (p.ej. tras reinicio del dispositivo)
 * y las vuelve a programar automáticamente.
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRecordatorios } from '../context/RecordatoriosContext';
import { useNotificaciones } from './useNotificaciones';

export const useReprogramarRecordatorios = () => {
  const { recordatorios, editarRecordatorio } = useRecordatorios();
  const { programarNotificacion } = useNotificaciones();
  const yaEjecutado = useRef(false);

  useEffect(() => {
    // Esperar a que los recordatorios se carguen del storage
    if (yaEjecutado.current || recordatorios.length === 0) return;
    yaEjecutado.current = true;

    const reprogramar = async () => {
      try {
        const pendientes = await Notifications.getAllScheduledNotificationsAsync();
        const idsPendientes = new Set(pendientes.map(n => n.identifier));

        for (const recordatorio of recordatorios) {
          if (!recordatorio.activo) continue;

          // Un recordatorio mensual/semanal puede tener múltiples IDs separados por "|"
          const ids = recordatorio.notificationId?.split('|') ?? [];
          const algunaActiva = ids.length > 0 && ids.some(id => idsPendientes.has(id));

          if (!algunaActiva) {
            console.log(`Re-programando recordatorio: ${recordatorio.titulo}`);
            const nuevoId = await programarNotificacion(recordatorio);
            if (nuevoId) {
              editarRecordatorio(recordatorio.id, { notificationId: nuevoId });
            }
          }
        }
      } catch (error) {
        console.error('Error al re-programar recordatorios:', error);
      }
    };

    reprogramar();
  }, [recordatorios]);
};
