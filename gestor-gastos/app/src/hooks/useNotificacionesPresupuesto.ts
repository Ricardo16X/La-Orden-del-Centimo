/**
 * Hook para notificar en el momento en que un gasto hace cruzar a un
 * presupuesto su porcentaje de alerta o su límite.
 *
 * A diferencia de useAlertasPresupuesto (que solo calcula el estado actual
 * para mostrarlo en pantalla), este hook dispara una notificación push
 * inmediata la primera vez que ocurre cada cruce dentro de un período dado,
 * para que el aviso llegue en el momento en que todavía se puede reaccionar
 * y no solo al abrir la app más tarde.
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useCategorias } from '../context/CategoriasContext';
import { useGastos } from '../context/GastosContext';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { Presupuesto } from '../types';

const CANAL_PRESUPUESTOS = 'presupuestos';

const NOMBRE_PERIODO: Record<Presupuesto['periodo'], string> = {
  semanal: 'semana',
  mensual: 'mes',
  anual: 'año',
};

/** Identifica la instancia actual del período (semana/mes/año) para poder
 *  notificar una sola vez por cruce y volver a notificar cuando el período reinicie. */
function obtenerClavePeriodo(periodo: Presupuesto['periodo'], fecha: Date): string {
  if (periodo === 'anual') return `${fecha.getFullYear()}`;
  if (periodo === 'mensual') return `${fecha.getFullYear()}-${fecha.getMonth()}`;
  const diaSemana = fecha.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - diasDesdeLunes);
  return `${lunes.getFullYear()}-${lunes.getMonth()}-${lunes.getDate()}`;
}

export const useNotificacionesPresupuesto = () => {
  const { presupuestos, obtenerEstadisticasPresupuesto } = usePresupuestos();
  const { categorias } = useCategorias();
  const { gastos } = useGastos();

  const alertadosRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CANAL_PRESUPUESTOS, {
        name: 'Presupuestos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  useEffect(() => {
    const evaluar = async () => {
      if (!alertadosRef.current) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRESUPUESTOS_ALERTADOS);
          alertadosRef.current = new Set(raw ? JSON.parse(raw) : []);
        } catch (_) {
          alertadosRef.current = new Set();
        }
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      const alertados = alertadosRef.current;
      const ahora = new Date();
      let huboCambios = false;

      for (const presupuesto of presupuestos) {
        const stats = obtenerEstadisticasPresupuesto(presupuesto.categoriaId, presupuesto.periodo);
        if (!stats) continue;

        const clavePeriodo = obtenerClavePeriodo(presupuesto.periodo, ahora);
        const categoria = categorias.find(c => c.id === presupuesto.categoriaId);
        const nombreCategoria = categoria?.nombre ?? 'tu categoría';
        const emoji = categoria?.emoji ?? '💸';
        const etiquetaPeriodo = NOMBRE_PERIODO[presupuesto.periodo];

        const claveExcedido = `${presupuesto.id}-${clavePeriodo}-excedido`;
        const claveAlerta = `${presupuesto.id}-${clavePeriodo}-alerta`;

        if (stats.excedido && !alertados.has(claveExcedido)) {
          alertados.add(claveExcedido);
          huboCambios = true;
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `🚨 Presupuesto excedido: ${nombreCategoria}`,
                body: `${emoji} Superaste tu límite de ${nombreCategoria} para este ${etiquetaPeriodo}.`,
                sound: true,
                data: { source: 'presupuesto_excedido', presupuestoId: presupuesto.id },
              },
              trigger: null,
            });
          } catch (_) {}
        } else if (stats.debeAlertar && !alertados.has(claveAlerta)) {
          alertados.add(claveAlerta);
          huboCambios = true;
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `⚠️ Cerca del límite: ${nombreCategoria}`,
                body: `${emoji} Ya usaste ${Math.round(stats.porcentaje)}% de tu presupuesto de ${nombreCategoria} este ${etiquetaPeriodo}.`,
                sound: true,
                data: { source: 'presupuesto_alerta', presupuestoId: presupuesto.id },
              },
              trigger: null,
            });
          } catch (_) {}
        }
      }

      if (huboCambios) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.PRESUPUESTOS_ALERTADOS, JSON.stringify([...alertados]));
        } catch (_) {}
      }
    };

    evaluar();
  }, [gastos, presupuestos, obtenerEstadisticasPresupuesto, categorias]);
};
