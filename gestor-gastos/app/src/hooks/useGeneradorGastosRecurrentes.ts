import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useGastos } from '../context/GastosContext';
import { useMonedas } from '../context/MonedasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { GastoRecurrente } from '../types';

function calcularSiguienteFecha(gr: GastoRecurrente): string {
  const fecha = new Date(gr.proximaFecha);

  switch (gr.frecuencia) {
    case 'diario':
      fecha.setDate(fecha.getDate() + 1);
      break;
    case 'semanal':
      fecha.setDate(fecha.getDate() + 7);
      break;
    case 'mensual': {
      const diaObjetivo = gr.diaMes || fecha.getDate();
      fecha.setMonth(fecha.getMonth() + 1);
      const ultimoDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
      fecha.setDate(Math.min(diaObjetivo, ultimoDiaDelMes));
      break;
    }
  }

  return fecha.toISOString();
}

export const useGeneradorGastosRecurrentes = () => {
  const { gastosRecurrentes, actualizarProximaFecha } = useGastosRecurrentes();
  const { agregarGasto } = useGastos();
  const { monedas, monedaBase } = useMonedas();
  const { tarjetas } = useTarjetas();

  useEffect(() => {
    const ejecutar = async () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const { status } = await Notifications.getPermissionsAsync();
      const puedeNotificar = status === 'granted';

      for (const gr of gastosRecurrentes.filter(g => g.activo)) {
        const proximaFecha = new Date(gr.proximaFecha);
        proximaFecha.setHours(0, 0, 0, 0);

        if (proximaFecha <= hoy) {
          agregarGasto({
            monto: gr.monto,
            descripcion: `${gr.descripcion} (recurrente)`,
            categoria: gr.categoriaId,
            tipo: 'gasto',
            moneda: gr.moneda,
            ...(gr.tarjetaId && { tarjetaId: gr.tarjetaId }),
          });

          actualizarProximaFecha(gr.id, calcularSiguienteFecha(gr));

          if (puedeNotificar) {
            const simbolo = monedas.find(m => m.codigo === gr.moneda)?.simbolo
              ?? monedaBase?.simbolo ?? '$';
            const tarjeta = gr.tarjetaId
              ? tarjetas.find(t => t.id === gr.tarjetaId)
              : undefined;
            const cuerpo = tarjeta
              ? `${gr.descripcion} · ${simbolo}${gr.monto.toFixed(2)} en ${tarjeta.nombre}`
              : `${gr.descripcion} · ${simbolo}${gr.monto.toFixed(2)}`;

            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🔁 Gasto registrado',
                body: cuerpo,
                sound: true,
                data: { type: 'gasto_recurrente', gastoRecurrenteId: gr.id },
              },
              trigger: null, // inmediata
            });
          }
        }
      }
    };

    ejecutar();
  }, [gastosRecurrentes]);

  return {};
};
