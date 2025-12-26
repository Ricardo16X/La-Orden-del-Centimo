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
      // Parsear la hora
      const [horas, minutos] = recordatorio.hora.split(':').map(Number);

      // Configurar el trigger según la frecuencia
      const trigger = obtenerTrigger(
        recordatorio.frecuencia,
        horas,
        minutos,
        recordatorio.diaSemana,
        recordatorio.diaMes
      );

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

  const cancelarNotificacion = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
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
 * Obtiene el trigger de notificación según la frecuencia
 */
function obtenerTrigger(
  frecuencia: FrecuenciaRecordatorio,
  horas: number,
  minutos: number,
  diaSemana?: number,
  diaMes?: number
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

    case 'mensual':
      // Calcular cuántos segundos faltan hasta el próximo día del mes a la hora especificada
      const ahora = new Date();
      const proximaNotificacion = new Date();
      const diaDelMes = diaMes || 1;

      proximaNotificacion.setDate(diaDelMes);
      proximaNotificacion.setHours(horas, minutos, 0, 0);

      // Si ya pasó este mes, programar para el próximo mes
      if (proximaNotificacion <= ahora) {
        proximaNotificacion.setMonth(proximaNotificacion.getMonth() + 1);
      }

      const segundosHastaNotificacion = Math.floor(
        (proximaNotificacion.getTime() - ahora.getTime()) / 1000
      );

      // Usar intervalo de 30 días como aproximación mensual
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(segundosHastaNotificacion, 60), // Mínimo 60 segundos
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
