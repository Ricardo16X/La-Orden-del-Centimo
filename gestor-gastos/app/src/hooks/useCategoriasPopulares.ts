import { useMemo } from 'react';
import { Gasto, Categoria, TipoTransaccion } from '../types';

export const useCategoriasPopulares = (
  gastos: Gasto[],
  categorias: Categoria[],
  limite: number = 5,
  tipoTransaccion?: TipoTransaccion,
): string[] => {
  return useMemo(() => {
    const categoriasFiltradas = tipoTransaccion
      ? categorias.filter(c => c.tipo === tipoTransaccion || c.tipo === 'ambos')
      : categorias;

    const gastosFiltrados = tipoTransaccion
      ? gastos.filter(g => g.tipo === tipoTransaccion)
      : gastos;

    const conteo: Record<string, number> = {};
    gastosFiltrados.forEach(g => {
      conteo[g.categoria] = (conteo[g.categoria] || 0) + 1;
    });

    const idsValidos = new Set(categoriasFiltradas.map(c => c.id));
    const ordenadas = Object.entries(conteo)
      .filter(([id]) => idsValidos.has(id))
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    if (ordenadas.length < limite) {
      const usadas = new Set(ordenadas);
      const relleno = categoriasFiltradas
        .filter(c => !c.esPersonalizada && !usadas.has(c.id))
        .map(c => c.id);
      return [...ordenadas, ...relleno].slice(0, limite);
    }

    return ordenadas.slice(0, limite);
  }, [gastos, categorias, limite, tipoTransaccion]);
};
