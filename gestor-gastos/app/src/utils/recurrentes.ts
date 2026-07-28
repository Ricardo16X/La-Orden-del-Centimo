import { GastoRecurrente } from '../types';

export function calcularSiguienteFecha(gr: GastoRecurrente): string {
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
