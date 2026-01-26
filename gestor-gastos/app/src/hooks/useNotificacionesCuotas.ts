/**
 * Hook para manejar notificaciones específicas de cuotas
 * Programa notificaciones antes de las fechas de corte de tarjetas
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useCuotas } from '../context/CuotasContext';
import { useTarjetas } from '../context/TarjetasContext';

const CHANNEL_ID_CUOTAS = 'cuotas-recordatorios';

export const useNotificacionesCuotas = () => {
  const { cuotas } = useCuotas();
  const { tarjetas } = useTarjetas();

  useEffect(() => {
    configurarCanalNotificaciones();
    programarNotificacionesCuotas();
  }, [cuotas, tarjetas]);

  const configurarCanalNotificaciones = async () => {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID_CUOTAS, {
      name: 'Recordatorios de Cuotas',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  };

  const programarNotificacionesCuotas = async () => {
    // Cancelar todas las notificaciones programadas de cuotas anteriormente
    const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();
    const notificacionesCuotas = notificacionesProgramadas.filter(n =>
      n.content.data?.type === 'cuota'
    );

    for (const notif of notificacionesCuotas) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // Programar nuevas notificaciones para cuotas activas
    const cuotasActivas = cuotas.filter(c => c.estado === 'activa');

    for (const cuota of cuotasActivas) {
      const tarjeta = tarjetas.find(t => t.id === cuota.tarjetaId);
      if (!tarjeta) continue;

      // Notificación 3 días antes del corte
      await programarNotificacion(
        cuota,
        tarjeta.nombre,
        3,
        'Próximamente vence una cuota'
      );

      // Notificación 1 día antes del corte
      await programarNotificacion(
        cuota,
        tarjeta.nombre,
        1,
        'Mañana vence una cuota'
      );

      // Notificación el día del corte
      await programarNotificacion(
        cuota,
        tarjeta.nombre,
        0,
        'Hoy vence una cuota'
      );
    }
  };

  const programarNotificacion = async (
    cuota: any,
    nombreTarjeta: string,
    diasAntes: number,
    titulo: string
  ) => {
    const fechaProxima = new Date(cuota.fechaProximaCuota);
    fechaProxima.setDate(fechaProxima.getDate() - diasAntes);
    fechaProxima.setHours(9, 0, 0, 0); // 9:00 AM

    // Solo programar si la fecha es futura
    if (fechaProxima <= new Date()) return;

    const cuotaNumero = cuota.cuotasPagadas + 1;
    const mensajeDias = diasAntes === 0
      ? 'hoy'
      : diasAntes === 1
        ? 'mañana'
        : `en ${diasAntes} días`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💳 ${titulo}`,
        body: `Cuota ${cuotaNumero}/${cuota.cantidadCuotas} de "${cuota.descripcion}" (${nombreTarjeta}) vence ${mensajeDias}. Monto: Q${cuota.montoPorCuota.toFixed(2)}`,
        data: {
          type: 'cuota',
          cuotaId: cuota.id,
          tarjetaId: cuota.tarjetaId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: fechaProxima,
        channelId: CHANNEL_ID_CUOTAS,
      },
    });
  };

  const enviarNotificacionInmediata = async (
    titulo: string,
    mensaje: string,
    cuotaId?: string
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: mensaje,
        data: {
          type: 'cuota',
          cuotaId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Inmediata
    });
  };

  return {
    programarNotificacionesCuotas,
    enviarNotificacionInmediata,
  };
};
