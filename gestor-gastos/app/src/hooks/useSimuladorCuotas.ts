import { useState } from 'react';
import { useCuotas } from '../context/CuotasContext';
import { useGastos } from '../context/GastosContext';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useMonedas } from '../context/MonedasContext';
import { GastoRecurrente } from '../types';

export interface DetalleMensualProyeccion {
  mesLabel: string;
  margenLibre: number;
  cuotasExistentes: number;
  gastosVariables: number;
  gastosRecurrentes: number;
  impactoPorcentaje: number;
  colorIndicador: string;
  estado: 'saludable' | 'precaucion' | 'riesgo';
  cuotasQueFinalizanNombres: string[];
}

export interface ResultadoSimulacion {
  nuevaCuotaMensual: number;
  ingresosPromedio: number;
  totalRecurrentes: number;
  totalCuotasActuales: number;
  gastosVariablesEstimados: number;
  disponibleRealPromedio: number;
  porcentajeDisponiblePromedio: number;
  esSostenible: boolean;
  mensaje: string;
  colorIndicador: string;
  mesCriticoLabel: string;
  mesCriticoMargen: number;
  mesCriticoImpacto: number;
  mesAlivioLabel: string;
  mesAlivioMargen: number;
  proyeccionMensual: DetalleMensualProyeccion[];
  capacidadAhorroComprometida: number;
}

const montoMensualRecurrente = (gr: GastoRecurrente): number => {
  switch (gr.frecuencia) {
    case 'diario':  return gr.monto * 30;
    case 'semanal': return gr.monto * 4;
    default:        return gr.monto;
  }
};

export const useSimuladorCuotas = () => {
  const { obtenerTotalCuotasMensual, obtenerProyeccionCuotas } = useCuotas();
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
    const actualKey = `${hoy.getFullYear()}-${hoy.getMonth()}`;

    // 1. Agrupar transacciones por mes para calcular históricos
    const ingresosPorMes = new Map<string, number>();
    const gastosPorMes = new Map<string, number>();
    const cuotasPorMes = new Map<string, number>();
    const recurrentesPorMes = new Map<string, number>();

    const gastosFiltrados = gastos.filter(g => !g.esTransferencia);

    gastosFiltrados.forEach(g => {
      const fecha = new Date(g.fecha);
      const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      if (key === actualKey) return; // Excluir el mes actual porque está incompleto

      const valor = g.montoEnMonedaBase ?? g.monto;
      if (g.tipo === 'ingreso') {
        ingresosPorMes.set(key, (ingresosPorMes.get(key) ?? 0) + valor);
      } else if (g.tipo === 'gasto') {
        gastosPorMes.set(key, (gastosPorMes.get(key) ?? 0) + valor);
        const descLower = g.descripcion.toLowerCase();
        if (descLower.includes('cuota')) {
          cuotasPorMes.set(key, (cuotasPorMes.get(key) ?? 0) + valor);
        } else if (descLower.includes('(recurrente)')) {
          recurrentesPorMes.set(key, (recurrentesPorMes.get(key) ?? 0) + valor);
        }
      }
    });

    // Claves de meses con transacciones ordenados cronológicamente
    const todasLasClaves = Array.from(new Set([
      ...ingresosPorMes.keys(),
      ...gastosPorMes.keys()
    ])).sort((a, b) => {
      const [aAnio, aMes] = a.split('-').map(Number);
      const [bAnio, bMes] = b.split('-').map(Number);
      return aAnio !== bAnio ? aAnio - bAnio : aMes - bMes;
    });

    const ultimasClaves = todasLasClaves.slice(-3);
    const cantMeses = ultimasClaves.length;

    let ingresosPromedio = 0;
    let recurrentesPromedio = 0;
    let cuotasPromedio = 0;
    let variablesPromedio = 0;

    if (cantMeses > 0) {
      let sumaIngresos = 0;
      let sumaRecurrentes = 0;
      let sumaCuotas = 0;
      let sumaVariables = 0;

      ultimasClaves.forEach(key => {
        const ing = ingresosPorMes.get(key) ?? 0;
        const gas = gastosPorMes.get(key) ?? 0;
        const cuo = cuotasPorMes.get(key) ?? 0;
        const rec = recurrentesPorMes.get(key) ?? 0;
        const varG = Math.max(0, gas - cuo - rec);

        sumaIngresos += ing;
        sumaRecurrentes += rec;
        sumaCuotas += cuo;
        sumaVariables += varG;
      });

      ingresosPromedio = sumaIngresos / cantMeses;
      recurrentesPromedio = sumaRecurrentes / cantMeses;
      cuotasPromedio = sumaCuotas / cantMeses;
      variablesPromedio = sumaVariables / cantMeses;
    } else {
      // Fallback si no hay meses anteriores completos: usar mes actual
      const ingresosActual = gastosFiltrados
        .filter(g => g.tipo === 'ingreso' && `${new Date(g.fecha).getFullYear()}-${new Date(g.fecha).getMonth()}` === actualKey)
        .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);

      const recurrentesActual = gastosRecurrentes
        .filter(gr => gr.activo)
        .reduce((sum, gr) => {
          const tipoCambio = obtenerMoneda(gr.moneda)?.tipoCambio ?? 1;
          return sum + montoMensualRecurrente(gr) * tipoCambio;
        }, 0);

      ingresosPromedio = ingresosActual;
      recurrentesPromedio = recurrentesActual;
      cuotasPromedio = obtenerTotalCuotasMensual();
      variablesPromedio = 0;
    }

    // 2. Obtener gastos recurrentes actuales (mejor usar los actuales reales)
    const recurrentesActuales = gastosRecurrentes
      .filter(gr => gr.activo)
      .reduce((sum, gr) => {
        const tipoCambio = obtenerMoneda(gr.moneda)?.tipoCambio ?? 1;
        return sum + montoMensualRecurrente(gr) * tipoCambio;
      }, 0);

    // 3. Proyectar cuotas existentes para los próximos C meses
    const proyeccionCuotasExistentes = obtenerProyeccionCuotas(cuotas);

    // 4. Construir proyección mensual de flujo de caja
    const proyeccionMensual: DetalleMensualProyeccion[] = [];
    let sumaDisponible = 0;

    for (let i = 0; i < cuotas; i++) {
      const proy = proyeccionCuotasExistentes[i];
      const mesLabel = proy ? proy.mes : `Mes ${i + 1}`;
      const cuotasExistentes = proy ? proy.totalCuotas : 0;
      const cuotasQueFinalizanNombres = proy ? proy.cuotasQueFinal.map(c => c.descripcion) : [];

      const gastosTotalesMes = variablesPromedio + recurrentesActuales + cuotasExistentes;
      const margenLibre = Math.max(-99999, ingresosPromedio - gastosTotalesMes);
      sumaDisponible += margenLibre;

      const impactoPorcentaje = margenLibre > 0 ? (nuevaCuotaMensual / margenLibre) * 100 : Infinity;

      let estado: 'saludable' | 'precaucion' | 'riesgo' = 'saludable';
      let colorIndicador = '#22c55e';

      if (margenLibre <= 0 || impactoPorcentaje > 50) {
        estado = 'riesgo';
        colorIndicador = '#ef4444';
      } else if (impactoPorcentaje > 30) {
        estado = 'precaucion';
        colorIndicador = '#f59e0b';
      }

      proyeccionMensual.push({
        mesLabel,
        margenLibre,
        cuotasExistentes,
        gastosVariables: variablesPromedio,
        gastosRecurrentes: recurrentesActuales,
        impactoPorcentaje,
        colorIndicador,
        estado,
        cuotasQueFinalizanNombres,
      });
    }

    // 5. Métricas Consolidadas
    const disponibleRealPromedio = sumaDisponible / cuotas;
    const porcentajeDisponiblePromedio = disponibleRealPromedio > 0 ? (nuevaCuotaMensual / disponibleRealPromedio) * 100 : Infinity;

    // Capacidad de ahorro comprometida (antes de cuotas existentes)
    const capacidadAhorro = ingresosPromedio - recurrentesActuales - variablesPromedio;
    const capacidadAhorroComprometida = capacidadAhorro > 0 ? (nuevaCuotaMensual / capacidadAhorro) * 100 : Infinity;

    // Encontrar mes crítico (menor margen libre)
    let minMargen = Infinity;
    let mesCriticoIdx = 0;
    proyeccionMensual.forEach((m, idx) => {
      if (m.margenLibre < minMargen) {
        minMargen = m.margenLibre;
        mesCriticoIdx = idx;
      }
    });
    const mesCritico = proyeccionMensual[mesCriticoIdx];

    // Encontrar primer mes de alivio (donde expira alguna cuota)
    let mesAlivioLabel = '';
    let mesAlivioMargen = 0;
    const mesAlivioObj = proyeccionMensual.find((m, idx) => idx > 0 && proyeccionCuotasExistentes[idx]?.cuotasQueFinal.length > 0);
    if (mesAlivioObj) {
      mesAlivioLabel = mesAlivioObj.mesLabel;
      mesAlivioMargen = mesAlivioObj.margenLibre;
    }

    // Evaluación de Sostenibilidad Global
    let esSostenible = true;
    let mensaje = 'Sostenible: La nueva cuota cabe cómodamente dentro de tu presupuesto proyectado';
    let colorIndicador = '#22c55e';

    const tieneRiesgo = proyeccionMensual.some(m => m.estado === 'riesgo');
    const tienePrecaucion = proyeccionMensual.some(m => m.estado === 'precaucion');

    if (tieneRiesgo) {
      esSostenible = false;
      mensaje = 'Riesgo alto: Esta cuota causará estrés financiero severo en algunos meses';
      colorIndicador = '#ef4444';
    } else if (tienePrecaucion) {
      esSostenible = false;
      mensaje = 'Precaución: La cuota consumirá más del 30% de tu disponible en tus meses más ajustados';
      colorIndicador = '#f59e0b';
    }

    setResultado({
      nuevaCuotaMensual,
      ingresosPromedio,
      totalRecurrentes: recurrentesActuales,
      totalCuotasActuales: proyeccionCuotasExistentes[0]?.totalCuotas ?? 0,
      gastosVariablesEstimados: variablesPromedio,
      disponibleRealPromedio,
      porcentajeDisponiblePromedio,
      esSostenible,
      mensaje,
      colorIndicador,
      mesCriticoLabel: mesCritico.mesLabel,
      mesCriticoMargen: mesCritico.margenLibre,
      mesCriticoImpacto: mesCritico.impactoPorcentaje,
      mesAlivioLabel,
      mesAlivioMargen,
      proyeccionMensual,
      capacidadAhorroComprometida,
    });
  };

  const limpiar = () => {
    setMontoProducto('');
    setCantidadCuotas('');
    setResultado(null);
  };

  return { montoProducto, setMontoProducto, cantidadCuotas, setCantidadCuotas, resultado, simular, limpiar };
};
