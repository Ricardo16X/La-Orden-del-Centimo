/**
 * Hook para programar notificaciones automáticas de tarjetas de crédito.
 * Programa notificaciones para la fecha de pago de cada tarjeta activa:
 * - 3 días antes: "Tu tarjeta X vence en 3 días"
 * - 1 día antes: "Tu tarjeta X vence mañana"
 * - El día del pago: "¡Hoy es el último día para pagar X!"
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useTarjetas } from '../context/TarjetasContext';

const CANAL_TARJETAS = 'tarjetas';

export const useNotificacionesTarjetas = () => {
  const { tarjetas, obtenerEstadoTarjeta } = useTarjetas();
  const notifIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CANAL_TARJETAS, {
        name: 'Tarjetas de crédito',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  useEffect(() => {
    programarNotificacionesTarjetas();
  }, [tarjetas]);

  const programarNotificacionesTarjetas = async () => {
    // Cancelar notificaciones anteriores de tarjetas
    for (const id of notifIdsRef.current) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (_) {}
    }
    notifIdsRef.current = [];

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const ahora = new Date();
    const nuevosIds: string[] = [];

    for (const tarjeta of tarjetas) {
      const estado = obtenerEstadoTarjeta(tarjeta);
      const { diasParaPago } = estado;

      // Programar notificaciones para 3, 1 y 0 días antes del pago
      const alertas = [
        { dias: 3, titulo: `💳 Pago próximo: ${tarjeta.nombre}`, cuerpo: `Tu tarjeta ${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos} vence en 3 días.` },
        { dias: 1, titulo: `⚠️ Pago mañana: ${tarjeta.nombre}`, cuerpo: `Tu tarjeta ${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos} vence mañana.` },
        { dias: 0, titulo: `🚨 ¡Último día de pago!`, cuerpo: `Hoy vence el pago de ${tarjeta.nombre} (${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos}).` },
      ];

      for (const alerta of alertas) {
        if (diasParaPago >= alerta.dias) {
          const fechaNotif = new Date(ahora);
          fechaNotif.setDate(ahora.getDate() + (diasParaPago - alerta.dias));
          fechaNotif.setHours(9, 0, 0, 0);

          if (fechaNotif.getTime() - ahora.getTime() < 60000) continue;

          try {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title: alerta.titulo,
                body: alerta.cuerpo,
                sound: true,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fechaNotif.getTime(),
              },
            });
            nuevosIds.push(id);
          } catch (_) {}
        }
      }
    }

    notifIdsRef.current = nuevosIds;
  };
};
