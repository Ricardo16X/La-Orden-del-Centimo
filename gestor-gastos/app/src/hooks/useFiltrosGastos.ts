/**
 * Hook para filtrar gastos por diferentes criterios
 */

import { useState, useMemo } from 'react';
import { Gasto } from '../types';

export type PeriodoFiltro = 'hoy' | 'semana' | 'mes' | 'año' | 'todos';

export const useFiltrosGastos = (gastos: Gasto[]) => {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'gasto' | 'ingreso'>('todos');

  const gastosFiltrados = useMemo(() => {
    let resultado = [...gastos];

    // Filtrar por texto de búsqueda
    if (textoBusqueda.trim()) {
      const busqueda = textoBusqueda.toLowerCase();
      resultado = resultado.filter(
        g => g.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtrar por categoría
    if (categoriaFiltro) {
      resultado = resultado.filter(g => g.categoria === categoriaFiltro);
    }

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(g => g.tipo === tipoFiltro);
    }

    // Filtrar por periodo
    if (periodo !== 'todos') {
      const ahora = new Date();
      const añoActual = ahora.getFullYear();
      const mesActual = ahora.getMonth();
      const diaActual = ahora.getDate();

      resultado = resultado.filter(g => {
        const fechaGasto = new Date(g.fecha);
        const añoGasto = fechaGasto.getFullYear();
        const mesGasto = fechaGasto.getMonth();
        const diaGasto = fechaGasto.getDate();

        switch (periodo) {
          case 'hoy':
            return (
              diaGasto === diaActual &&
              mesGasto === mesActual &&
              añoGasto === añoActual
            );

          case 'semana': {
            // Calcular el inicio de la semana (domingo = 0)
            const haceUnaSemana = new Date(ahora);
            haceUnaSemana.setDate(diaActual - 7);
            return fechaGasto >= haceUnaSemana && fechaGasto <= ahora;
          }

          case 'mes':
            return mesGasto === mesActual && añoGasto === añoActual;

          case 'año':
            return añoGasto === añoActual;

          default:
            return true;
        }
      });
    }

    // Ordenar por fecha más reciente
    return resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [gastos, textoBusqueda, periodo, categoriaFiltro, tipoFiltro]);

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    setPeriodo('todos');
    setCategoriaFiltro(null);
    setTipoFiltro('todos');
  };

  const hayFiltrosActivos = !!(textoBusqueda || periodo !== 'todos' || categoriaFiltro !== null || tipoFiltro !== 'todos');

  return {
    gastosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    periodo,
    setPeriodo,
    categoriaFiltro,
    setCategoriaFiltro,
    tipoFiltro,
    setTipoFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    totalFiltrados: gastosFiltrados.length,
  };
};
