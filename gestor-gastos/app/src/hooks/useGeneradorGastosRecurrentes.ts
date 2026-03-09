/**
 * Hook para auto-generar gastos de suscripciones/gastos recurrentes
 * Se ejecuta en cada render y verifica si hay gastos recurrentes que necesitan
 * generar un gasto basado en su próxima fecha programada.
 */

import { useEffect } from 'react';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useGastos } from '../context/GastosContext';
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

  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    gastosRecurrentes
      .filter(gr => gr.activo)
      .forEach(gr => {
        const proximaFecha = new Date(gr.proximaFecha);
        proximaFecha.setHours(0, 0, 0, 0);

        if (proximaFecha <= hoy) {
          // Generar gasto automático
          agregarGasto({
            monto: gr.monto,
            descripcion: `${gr.descripcion} (recurrente)`,
            categoria: gr.categoriaId,
            tipo: 'gasto',
            moneda: gr.moneda,
          });

          // Avanzar a la siguiente fecha (previene duplicados)
          const siguiente = calcularSiguienteFecha(gr);
          actualizarProximaFecha(gr.id, siguiente);
        }
      });
  }, [gastosRecurrentes]);

  return {};
};
