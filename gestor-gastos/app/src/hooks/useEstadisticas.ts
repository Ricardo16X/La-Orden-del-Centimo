import { useMemo } from 'react';
import { Gasto, Categoria } from '../types';

interface EstadisticasCategoria extends Categoria {
  cantidad: number;
  total: number;
}

interface ResumenMes {
  ingresos: number;
  gastos: number;
  ahorro: number;
  cambioVsMesAnterior: number;
}

interface PromedioDiario {
  actual: number;
  mesAnterior: number;
}

interface TendenciaMensual {
  mes: string;
  ingresos: number;
  gastos: number;
}

/**
 * Hook para calcular estadísticas de gastos
 */
export const useEstadisticas = (gastosOriginales: Gasto[], categorias: Categoria[]) => {
  // Excluir transferencias entre monedas de todas las estadísticas
  const gastos = useMemo(() => gastosOriginales.filter(g => !g.esTransferencia), [gastosOriginales]);

  const gastosPorCategoria = useMemo<EstadisticasCategoria[]>(() => {
    return categorias
      .map(categoria => {
        const gastosCategoria = gastos.filter(g => g.categoria === categoria.id);
        const total = gastosCategoria.reduce((sum, g) => sum + g.monto, 0);
        return {
          ...categoria,
          cantidad: gastosCategoria.length,
          total,
        };
      })
      .filter(c => c.cantidad > 0)
      .sort((a, b) => b.total - a.total); // Ordenar por total descendente
  }, [gastos, categorias]);

  const totalGastos = useMemo(() => gastos.length, [gastos]);

  const promedioGastos = useMemo(() => {
    if (gastos.length === 0) return 0;
    const total = gastos.reduce((sum, g) => sum + g.monto, 0);
    return total / gastos.length;
  }, [gastos]);

  const gastoMayorCategoria = useMemo(() => {
    if (gastosPorCategoria.length === 0) return null;
    return gastosPorCategoria[0];
  }, [gastosPorCategoria]);

  // Resumen del mes actual vs mes anterior
  const resumenMes = useMemo<ResumenMes>(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

    const gastosMesActual = gastos.filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });

    const gastosMesAnterior = gastos.filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mesAnterior && f.getFullYear() === anioMesAnterior;
    });

    const ingresos = gastosMesActual
      .filter(g => g.tipo === 'ingreso')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);
    const gastosTotal = gastosMesActual
      .filter(g => g.tipo === 'gasto')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);
    const ahorro = ingresos - gastosTotal;

    const gastosAnteriorTotal = gastosMesAnterior
      .filter(g => g.tipo === 'gasto')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const cambioVsMesAnterior = gastosAnteriorTotal > 0
      ? ((gastosTotal - gastosAnteriorTotal) / gastosAnteriorTotal) * 100
      : 0;

    return { ingresos, gastos: gastosTotal, ahorro, cambioVsMesAnterior };
  }, [gastos]);

  // Promedio diario del mes actual vs mes anterior
  const promedioDiario = useMemo<PromedioDiario>(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    const diasTranscurridos = hoy.getDate();

    const totalActual = gastos
      .filter(g => {
        const f = new Date(g.fecha);
        return f.getMonth() === mesActual && f.getFullYear() === anioActual && g.tipo === 'gasto';
      })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const actual = diasTranscurridos > 0 ? totalActual / diasTranscurridos : 0;

    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;
    const diasMesAnterior = new Date(anioMesAnterior, mesAnterior + 1, 0).getDate();

    const totalAnterior = gastos
      .filter(g => {
        const f = new Date(g.fecha);
        return f.getMonth() === mesAnterior && f.getFullYear() === anioMesAnterior && g.tipo === 'gasto';
      })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

    const mesAnteriorPromedio = diasMesAnterior > 0 ? totalAnterior / diasMesAnterior : 0;

    return { actual, mesAnterior: mesAnteriorPromedio };
  }, [gastos]);

  // Top 5 gastos más grandes del mes actual
  const topGastos = useMemo<Gasto[]>(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    return gastos
      .filter(g => {
        const f = new Date(g.fecha);
        return g.tipo === 'gasto' && f.getMonth() === mesActual && f.getFullYear() === anioActual;
      })
      .sort((a, b) => (b.montoEnMonedaBase || b.monto) - (a.montoEnMonedaBase || a.monto))
      .slice(0, 5);
  }, [gastos]);

  // Tendencia de los últimos 6 meses (ingresos vs gastos)
  const tendenciaMensual = useMemo<TendenciaMensual[]>(() => {
    const hoy = new Date();
    const resultado: TendenciaMensual[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();

      const gastosMes = gastos.filter(g => {
        const f = new Date(g.fecha);
        return f.getMonth() === mes && f.getFullYear() === anio;
      });

      const ingresos = gastosMes
        .filter(g => g.tipo === 'ingreso')
        .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);
      const gastosTotal = gastosMes
        .filter(g => g.tipo === 'gasto')
        .reduce((sum, g) => sum + (g.montoEnMonedaBase || g.monto), 0);

      const nombreMes = fecha.toLocaleDateString('es', { month: 'short' });
      resultado.push({ mes: nombreMes, ingresos, gastos: gastosTotal });
    }

    return resultado;
  }, [gastos]);

  return {
    gastosPorCategoria,
    totalGastos,
    promedioGastos,
    gastoMayorCategoria,
    resumenMes,
    promedioDiario,
    topGastos,
    tendenciaMensual,
  };
};
