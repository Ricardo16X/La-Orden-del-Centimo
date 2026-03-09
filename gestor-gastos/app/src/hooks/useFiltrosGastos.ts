/**
 * Hook para filtrar gastos por diferentes criterios
 */

import { useState, useMemo } from 'react';
import { Gasto } from '../types';

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const useFiltrosGastos = (gastos: Gasto[]) => {
  const hoy = new Date();
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [mesAnio, setMesAnio] = useState({ mes: hoy.getMonth(), anio: hoy.getFullYear() });
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'gasto' | 'ingreso'>('todos');

  const esMesActual =
    mesAnio.mes === hoy.getMonth() && mesAnio.anio === hoy.getFullYear();

  const irMesAnterior = () => {
    setMesAnio(prev =>
      prev.mes === 0
        ? { mes: 11, anio: prev.anio - 1 }
        : { mes: prev.mes - 1, anio: prev.anio }
    );
  };

  const irMesSiguiente = () => {
    if (esMesActual) return;
    setMesAnio(prev =>
      prev.mes === 11
        ? { mes: 0, anio: prev.anio + 1 }
        : { mes: prev.mes + 1, anio: prev.anio }
    );
  };

  const irMesActual = () => {
    setMesAnio({ mes: hoy.getMonth(), anio: hoy.getFullYear() });
  };

  const etiquetaMes = `${NOMBRES_MES[mesAnio.mes]} ${mesAnio.anio}`;

  const gastosFiltrados = useMemo(() => {
    // Excluir transferencias entre monedas de la lista principal
    let resultado = gastos.filter(g => !g.esTransferencia);

    // Filtrar por mes/año seleccionado
    resultado = resultado.filter(g => {
      const f = new Date(g.fecha);
      return f.getMonth() === mesAnio.mes && f.getFullYear() === mesAnio.anio;
    });

    // Filtrar por texto de búsqueda
    if (textoBusqueda.trim()) {
      const busqueda = textoBusqueda.toLowerCase();
      resultado = resultado.filter(
        g => g.descripcion.toLowerCase().includes(busqueda) ||
          (g.nota && g.nota.toLowerCase().includes(busqueda))
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

    // Ordenar por fecha más reciente
    return resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [gastos, textoBusqueda, mesAnio, categoriaFiltro, tipoFiltro]);

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    setCategoriaFiltro(null);
    setTipoFiltro('todos');
  };

  const hayFiltrosActivos = !!(textoBusqueda || categoriaFiltro !== null || tipoFiltro !== 'todos');

  return {
    gastosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    mesAnio,
    etiquetaMes,
    esMesActual,
    irMesAnterior,
    irMesSiguiente,
    irMesActual,
    categoriaFiltro,
    setCategoriaFiltro,
    tipoFiltro,
    setTipoFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    totalFiltrados: gastosFiltrados.length,
  };
};
