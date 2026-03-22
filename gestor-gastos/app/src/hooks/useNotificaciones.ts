/**
 * Hook para manejar notificaciones locales
 */

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Recordatorio, FrecuenciaRecordatorio } from '../types';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificaciones = () => {
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    solicitarPermisos();

    // Listener para cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Listener para cuando el usuario interactúa con la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Respuesta a notificación:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const solicitarPermisos = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permisos de notificación denegados');
      setPermisoConcedido(false);
      return false;
    }

    setPermisoConcedido(true);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  };

  const programarNotificacion = async (recordatorio: Recordatorio): Promise<string | null> => {
    if (!permisoConcedido) {
      const concedido = await solicitarPermisos();
      if (!concedido) return null;
    }

    try {
      const [horas, minutos] = recordatorio.hora.split(':').map(Number);

      // Los recordatorios mensuales se programan como 12 triggers DATE individuales
      // para evitar el desfase de TIME_INTERVAL que no respeta el calendario
      if (recordatorio.frecuencia === 'mensual') {
        return await programarNotificacionMensual(recordatorio.titulo, recordatorio.mensaje, horas, minutos, recordatorio.diaMes || 1);
      }

      const trigger = obtenerTrigger(recordatorio.frecuencia, horas, minutos, recordatorio.diaSemana);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: recordatorio.titulo,
          body: recordatorio.mensaje,
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error programando notificación:', error);
      return null;
    }
  };

  // Programa 12 notificaciones DATE individuales (una por mes) para recordatorios mensuales.
  // Los IDs se almacenan unidos por "|" en un único string.
  const programarNotificacionMensual = async (
    titulo: string,
    mensaje: string,
    horas: number,
    minutos: number,
    diaDelMes: number
  ): Promise<string | null> => {
    const ahora = new Date();
    const ids: string[] = [];

    for (let i = 0; i < 12; i++) {
      // Obtener año/mes objetivo sin desbordamiento
      const ref = new Date(ahora.getFullYear(), ahora.getMonth() + i, 1);
      const targetYear = ref.getFullYear();
      const targetMonth = ref.getMonth();

      // Ajustar al último día si el mes no tiene suficientes días (ej: 31 en Febrero)
      const ultimoDia = new Date(targetYear, targetMonth + 1, 0).getDate();
      const diaReal = Math.min(diaDelMes, ultimoDia);

      const fecha = new Date(targetYear, targetMonth, diaReal, horas, minutos, 0, 0);

      // Saltar fechas pasadas o muy próximas
      if (fecha.getTime() - ahora.getTime() < 60000) continue;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fecha.getTime(),
        },
      });

      ids.push(id);
    }

    return ids.length > 0 ? ids.join('|') : null;
  };

  const cancelarNotificacion = async (notificationId: string) => {
    try {
      // Los recordatorios mensuales guardan múltiples IDs separados por "|"
      const ids = notificationId.split('|');
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (error) {
      console.error('Error cancelando notificación:', error);
    }
  };

  const cancelarTodasLasNotificaciones = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelando todas las notificaciones:', error);
    }
  };

  return {
    permisoConcedido,
    solicitarPermisos,
    programarNotificacion,
    cancelarNotificacion,
    cancelarTodasLasNotificaciones,
  };
};

/**
 * Obtiene el trigger de notificación para frecuencias diaria y semanal.
 * El caso mensual se maneja por separado con triggers DATE individuales.
 */
function obtenerTrigger(
  frecuencia: FrecuenciaRecordatorio,
  horas: number,
  minutos: number,
  diaSemana?: number,
): Notifications.NotificationTriggerInput {
  switch (frecuencia) {
    case 'diario':
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: horas,
        minute: minutos,
        repeats: true,
      };

    case 'semanal':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: diaSemana || 2, // Por defecto Lunes (1=Dom, 2=Lun, ..., 7=Sáb)
        hour: horas,
        minute: minutos,
        repeats: true,
      };

    default:
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: horas,
        minute: minutos,
        repeats: true,
      };
  }
}
