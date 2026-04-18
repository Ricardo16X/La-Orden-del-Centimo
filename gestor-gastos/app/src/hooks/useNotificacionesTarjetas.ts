/**
 * Hook para programar notificaciones automáticas de tarjetas de crédito.
 * Programa notificaciones para la fecha de pago de cada tarjeta activa:
 * - 3 días antes: "Tu tarjeta X vence en 3 días"
 * - 1 día antes: "Tu tarjeta X vence mañana"
 * - El día del pago: "¡Hoy es el último día para pagar X!"
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useTarjetas } from '../context/TarjetasContext';

const CANAL_TARJETAS = 'tarjetas';
const STORAGE_KEY_IDS = '@notif_tarjetas_ids';

/** Detecta si una notificación pendiente fue programada por este hook,
 *  tanto con el tag data.source moderno como con el patrón de título legado. */
const esNotifTarjeta = (n: Notifications.ScheduledNotification): boolean => {
  const data = n.content.data as Record<string, unknown> | null | undefined;
  if (data?.source === 'tarjeta_pago') return true;
  const titulo = n.content.title ?? '';
  return (
    titulo.startsWith('💳 Pago próximo:') ||
    titulo.startsWith('⚠️ Pago mañana:') ||
    titulo === '🚨 ¡Último día de pago!'
  );
};

export const useNotificacionesTarjetas = () => {
  const { tarjetas, obtenerEstadoTarjeta } = useTarjetas();
  const notifIdsRef = useRef<string[]>([]);
  const ejecutandoRef = useRef(false);

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
    // Guard: evita ejecuciones concurrentes si tarjetas cambia rápidamente
    if (ejecutandoRef.current) return;
    ejecutandoRef.current = true;

    try {
      // 1. Cargar IDs guardados en AsyncStorage (sobreviven reinicios de app)
      let idsGuardados: string[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_IDS);
        if (raw) idsGuardados = JSON.parse(raw);
      } catch (_) {}

      // 2. Cancelar notificaciones anteriores usando tres métodos combinados:
      //    a) IDs en memoria del ciclo actual (sesión activa)
      //    b) IDs guardados en AsyncStorage (sesiones anteriores)
      //    c) Búsqueda por título/data.source en la lista del sistema
      //       (captura notificaciones antiguas sin tag, programadas antes del fix)
      const todasPendientes = await Notifications.getAllScheduledNotificationsAsync();
      const idsPorPatron = todasPendientes
        .filter(esNotifTarjeta)
        .map(n => n.identifier);

      const idsACancelar = new Set([
        ...notifIdsRef.current,
        ...idsGuardados,
        ...idsPorPatron,
      ]);

      for (const id of idsACancelar) {
        try { await Notifications.cancelScheduledNotificationAsync(id); } catch (_) {}
      }
      notifIdsRef.current = [];

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      const ahora = new Date();
      const nuevosIds: string[] = [];

      for (const tarjeta of tarjetas) {
        const estado = obtenerEstadoTarjeta(tarjeta);
        const { diasParaPago } = estado;

        const alertas = [
          {
            dias: 3,
            titulo: `💳 Pago próximo: ${tarjeta.nombre}`,
            cuerpo: `Tu tarjeta ${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos} vence en 3 días.`,
          },
          {
            dias: 1,
            titulo: `⚠️ Pago mañana: ${tarjeta.nombre}`,
            cuerpo: `Tu tarjeta ${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos} vence mañana.`,
          },
          {
            dias: 0,
            titulo: `🚨 ¡Último día de pago!`,
            cuerpo: `Hoy vence el pago de ${tarjeta.nombre} (${tarjeta.banco} ••${tarjeta.ultimosCuatroDigitos}).`,
          },
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
                  data: { source: 'tarjeta_pago', tarjetaId: tarjeta.id },
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

      // 3. Persistir nuevos IDs en AsyncStorage para el próximo reinicio
      notifIdsRef.current = nuevosIds;
      try {
        await AsyncStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(nuevosIds));
      } catch (_) {}

    } finally {
      ejecutandoRef.current = false;
    }
  };
};
