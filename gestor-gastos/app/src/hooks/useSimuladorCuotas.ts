import { useState } from 'react';
import { useCuotas } from '../context/CuotasContext';
import { useGastos } from '../context/GastosContext';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useMonedas } from '../context/MonedasContext';
import { GastoRecurrente } from '../types';

export interface ResultadoSimulacion {
  nuevaCuotaMensual: number;
  ingresosBrutos: number;
  totalRecurrentes: number;
  totalCuotasActuales: number;
  disponibleReal: number;
  porcentajeDisponible: number;
  esSostenible: boolean;
  mensaje: string;
  colorIndicador: string;
}

const montoMensualRecurrente = (gr: GastoRecurrente): number => {
  switch (gr.frecuencia) {
    case 'diario':  return gr.monto * 30;
    case 'semanal': return gr.monto * 4;
    default:        return gr.monto;
  }
};

export const useSimuladorCuotas = () => {
  const { obtenerTotalCuotasMensual } = useCuotas();
  const { gastos } = useGastos();
  const { gastosRecurrentes } = useGastosRecurrentes();
  const { obtenerMoneda } = useMonedas();

  const [montoProducto, setMontoProducto] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);

  const simular = () => {
    const monto = parseFloat(montoProducto);
    const cuotas = parseInt(cantidadCuotas);
    if (isNaN(monto) || isNaN(cuotas) || monto <= 0 || cuotas <= 0) return;

    const nuevaCuotaMensual = monto / cuotas;

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ingresosBrutos = gastos
      .filter(g => !g.esTransferencia && g.tipo === 'ingreso' && new Date(g.fecha) >= inicioMes)
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);

    const totalRecurrentes = gastosRecurrentes
      .filter(gr => gr.activo)
      .reduce((sum, gr) => {
        const tipoCambio = obtenerMoneda(gr.moneda)?.tipoCambio ?? 1;
        return sum + montoMensualRecurrente(gr) * tipoCambio;
      }, 0);

    const totalCuotasActuales = obtenerTotalCuotasMensual();
    const disponibleReal = ingresosBrutos - totalRecurrentes - totalCuotasActuales;
    const porcentajeDisponible = disponibleReal > 0 ? (nuevaCuotaMensual / disponibleReal) * 100 : Infinity;

    let esSostenible = true;
    let mensaje = '';
    let colorIndicador = '#22c55e';

    if (disponibleReal <= 0) {
      esSostenible = false;
      mensaje = 'Riesgo alto: Tus gastos fijos y cuotas ya superan tus ingresos';
      colorIndicador = '#ef4444';
    } else if (porcentajeDisponible > 50) {
      esSostenible = false;
      mensaje = 'Riesgo alto: La nueva cuota consumiría más del 50% de tu margen libre';
      colorIndicador = '#ef4444';
    } else if (porcentajeDisponible > 30) {
      esSostenible = false;
      mensaje = 'Precaución: La nueva cuota ocuparía entre el 30% y 50% de tu margen libre';
      colorIndicador = '#f59e0b';
    } else {
      mensaje = 'Sostenible: La nueva cuota cabe dentro de tu margen libre';
      colorIndicador = '#22c55e';
    }

    setResultado({ nuevaCuotaMensual, ingresosBrutos, totalRecurrentes, totalCuotasActuales, disponibleReal, porcentajeDisponible, esSostenible, mensaje, colorIndicador });
  };

  const limpiar = () => {
    setMontoProducto('');
    setCantidadCuotas('');
    setResultado(null);
  };

  return { montoProducto, setMontoProducto, cantidadCuotas, setCantidadCuotas, resultado, simular, limpiar };
};
