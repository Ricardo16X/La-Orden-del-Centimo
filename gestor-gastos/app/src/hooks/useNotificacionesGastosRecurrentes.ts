import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useTarjetas } from '../context/TarjetasContext';
import { useMonedas } from '../context/MonedasContext';

const CANAL_ID = 'gastos-recurrentes';
const STORAGE_KEY_IDS = '@notif_recurrentes_ids';

export const useNotificacionesGastosRecurrentes = () => {
  const { gastosRecurrentes } = useGastosRecurrentes();
  const { tarjetas } = useTarjetas();
  const { monedas, monedaBase } = useMonedas();
  const ejecutandoRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CANAL_ID, {
        name: 'Gastos Recurrentes',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  // Re-programa cada vez que cambia la lista (se agrega, elimina, pausa o avanza proximaFecha)
  useEffect(() => {
    programar();
  }, [gastosRecurrentes]);

  const programar = async () => {
    if (ejecutandoRef.current) return;
    ejecutandoRef.current = true;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      // 1. Cancelar notificaciones previas (por IDs guardados + tag en data)
      let idsGuardados: string[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_IDS);
        if (raw) idsGuardados = JSON.parse(raw);
      } catch (_) {}

      const pendientes = await Notifications.getAllScheduledNotificationsAsync();
      const idsPorTag = pendientes
        .filter(n => n.content.data?.type === 'gasto_recurrente')
        .map(n => n.identifier);

      for (const id of new Set([...idsGuardados, ...idsPorTag])) {
        try { await Notifications.cancelScheduledNotificationAsync(id); } catch (_) {}
      }

      // 2. Programar una notificación a las 8am del día de proximaFecha para cada activo
      const ahora = new Date();
      const nuevosIds: string[] = [];

      for (const gr of gastosRecurrentes.filter(g => g.activo)) {
        // Parsear la fecha como local para evitar desfase UTC
        const [year, month, day] = gr.proximaFecha.split('T')[0].split('-').map(Number);
        const fechaNotif = new Date(year, month - 1, day, 8, 0, 0, 0);

        // Saltar si ya pasó o está a menos de 60 segundos
        if (fechaNotif.getTime() - ahora.getTime() < 60000) continue;

        const tarjeta = gr.tarjetaId ? tarjetas.find(t => t.id === gr.tarjetaId) : undefined;
        const simbolo = monedas.find(m => m.codigo === gr.moneda)?.simbolo
          ?? monedaBase?.simbolo ?? '$';
        const montoStr = `${simbolo}${gr.monto.toFixed(2)}`;

        const cuerpo = tarjeta
          ? `${gr.descripcion} · ${montoStr} en ${tarjeta.nombre}`
          : `${gr.descripcion} · ${montoStr}`;

        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔁 Hoy se registra',
              body: cuerpo,
              sound: true,
              data: { type: 'gasto_recurrente', gastoRecurrenteId: gr.id },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: fechaNotif.getTime(),
              channelId: CANAL_ID,
            },
          });
          nuevosIds.push(id);
        } catch (_) {}
      }

      // 3. Persistir nuevos IDs para que sobrevivan reinicios de la app
      try {
        await AsyncStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(nuevosIds));
      } catch (_) {}

    } finally {
      ejecutandoRef.current = false;
    }
  };
};
