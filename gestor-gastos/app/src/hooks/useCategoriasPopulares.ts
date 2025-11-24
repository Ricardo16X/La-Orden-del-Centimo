import { useMemo } from 'react';
import { Gasto, Categoria } from '../types';

/**
 * Hook para obtener las categorías más usadas
 * @param gastos - Array de gastos
 * @param categorias - Array de todas las categorías disponibles
 * @param limite - Número de categorías a retornar (default: 5)
 * @returns Array de IDs de categorías ordenadas por uso
 */
export const useCategoriasPopulares = (
  gastos: Gasto[],
  categorias: Categoria[],
  limite: number = 5
): string[] => {
  return useMemo(() => {
    // Contar usos por categoría
    const conteo: Record<string, number> = {};

    gastos.forEach(gasto => {
      conteo[gasto.categoria] = (conteo[gasto.categoria] || 0) + 1;
    });

    // Ordenar categorías por uso (de mayor a menor)
    const categoriasOrdenadas = Object.entries(conteo)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    // Si hay menos gastos que el límite, agregar categorías predeterminadas no usadas
    if (categoriasOrdenadas.length < limite) {
      const categoriasUsadas = new Set(categoriasOrdenadas);
      const categoriasPredeterminadas = categorias
        .filter(c => !c.esPersonalizada && !categoriasUsadas.has(c.id))
        .map(c => c.id);

      return [...categoriasOrdenadas, ...categoriasPredeterminadas].slice(0, limite);
    }

    return categoriasOrdenadas.slice(0, limite);
  }, [gastos, categorias, limite]);
};
