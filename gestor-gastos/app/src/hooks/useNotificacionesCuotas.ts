/**
 * Hook para manejar notificaciones específicas de cuotas
 * Programa notificaciones antes de las fechas de corte de tarjetas
 *
 * NOTA: Las notificaciones se programan solo una vez al día para evitar
 * reprogramación excesiva al entrar/salir de pantallas.
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCuotas } from '../context/CuotasContext';
import { useTarjetas } from '../context/TarjetasContext';

const CHANNEL_ID_CUOTAS = 'cuotas-recordatorios';
const STORAGE_KEY_ULTIMA_PROGRAMACION = 'CUOTAS_ULTIMA_PROGRAMACION';

export const useNotificacionesCuotas = () => {
  const { cuotas } = useCuotas();
  const { tarjetas } = useTarjetas();
  const yaProgramado = useRef(false);

  useEffect(() => {
    // Solo programar una vez por sesión
    if (yaProgramado.current) return;

    const verificarYProgramar = async () => {
      // Verificar si ya se programaron notificaciones hoy
      const ultimaProgramacion = await AsyncStorage.getItem(STORAGE_KEY_ULTIMA_PROGRAMACION);
      const hoy = new Date().toDateString();

      if (ultimaProgramacion === hoy) {
        yaProgramado.current = true;
        return;
      }

      await configurarCanalNotificaciones();
      await programarNotificacionesCuotas();

      // Marcar como programado para hoy
      await AsyncStorage.setItem(STORAGE_KEY_ULTIMA_PROGRAMACION, hoy);
      yaProgramado.current = true;
    };

    if (cuotas.length > 0 && tarjetas.length > 0) {
      verificarYProgramar();
    }
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
    // Parsear solo la parte de fecha como hora local para evitar el desfase UTC
    const fechaStr = cuota.fechaProximaCuota.split('T')[0]; // "2026-03-15"
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaProxima = new Date(year, month - 1, day); // medianoche local
    fechaProxima.setDate(fechaProxima.getDate() - diasAntes);
    fechaProxima.setHours(9, 0, 0, 0); // 9:00 AM local

    const ahora = new Date();

    // Solo programar si la fecha es futura (mínimo 60 segundos en el futuro)
    const segundosHastaNotificacion = Math.floor((fechaProxima.getTime() - ahora.getTime()) / 1000);
    if (segundosHastaNotificacion < 60) return;

    const cuotaNumero = cuota.cuotasPagadas + 1;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💳 ${titulo}`,
        body: `Cuota ${cuotaNumero}/${cuota.cantidadCuotas} de "${cuota.descripcion}" (${nombreTarjeta}). Monto: Q${cuota.montoPorCuota.toFixed(2)}`,
        data: {
          type: 'cuota',
          cuotaId: cuota.id,
          tarjetaId: cuota.tarjetaId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fechaProxima.getTime(),
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
