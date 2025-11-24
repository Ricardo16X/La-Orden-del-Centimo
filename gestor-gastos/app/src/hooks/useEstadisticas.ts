import { useMemo } from 'react';
import { Gasto, Categoria } from '../types';

interface EstadisticasCategoria extends Categoria {
  cantidad: number;
  total: number;
}

/**
 * Hook para calcular estadísticas de gastos
 */
export const useEstadisticas = (gastos: Gasto[], categorias: Categoria[]) => {
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

  return {
    gastosPorCategoria,
    totalGastos,
    promedioGastos,
    gastoMayorCategoria,
  };
};
