/**
 * Hook para generar sugerencias de presupuesto dinámico
 * Analiza el mes anterior y propone montos basados en:
 * - Proporciones históricas de gasto por categoría (solo categorías reales)
 * - Ingresos del mes anterior
 * - Ahorro requerido mensual de metas activas
 *
 * Prioridad: categorías con presupuesto ya configurado primero,
 * luego categorías nuevas con gasto histórico.
 */

import { useMemo } from 'react';
import { useGastos } from '../context/GastosContext';
import { useMetas } from '../context/MetasContext';
import { useMonedas } from '../context/MonedasContext';
import { useCategorias } from '../context/CategoriasContext';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';

const MIN_TRANSACCIONES = 5;

// Categorías internas que nunca deben aparecer como sugerencia de presupuesto
const CATEGORIAS_EXCLUIDAS = ['ahorro_metas'];

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export interface SugerenciaCategoria {
  categoriaId: string;
  montoHistorico: number;
  proporcion: number;
  montoSugerido: number;
  tienePresupuesto: boolean; // true = ya tenía presupuesto configurado
}

export interface ResultadoSugerencia {
  suficientesDatos: boolean;
  totalTransacciones: number;
  minTransacciones: number;
  mesAnalizadoLabel: string;
  mesSugeridoLabel: string;
  ingresosMes: number;
  ahorroMetas: number;
  totalRecurrentes: number;
  disponible: number;
  sugerencias: SugerenciaCategoria[];
  monedaBaseId: string;
  monedaBaseSimbolo: string;
}

export const useSugerenciaPresupuesto = (): ResultadoSugerencia => {
  const { gastos } = useGastos();
  const { metas, obtenerEstadisticasMeta } = useMetas();
  const { monedaBase, convertirAMonedaBase } = useMonedas();
  const { categorias } = useCategorias();
  const { presupuestos } = usePresupuestos();
  const { gastosRecurrentes } = useGastosRecurrentes();

  return useMemo(() => {
    const hoy = new Date();
    const mesPasado = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1;
    const anioPasado = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();

    const monedaBaseId = monedaBase?.codigo || '';
    const monedaBaseSimbolo = monedaBase?.simbolo || '$';

    const mesAnalizadoLabel = `${NOMBRES_MES[mesPasado]} ${anioPasado}`;
    const mesSugeridoLabel = `${NOMBRES_MES[hoy.getMonth()]} ${hoy.getFullYear()}`;

    // IDs de categorías reales (las que existen en el catálogo del usuario)
    const idsCategorias = new Set(categorias.map(c => c.id));
    // IDs de categorías con presupuesto mensual ya configurado
    const idsConPresupuesto = new Set(
      presupuestos.filter(p => p.periodo === 'mensual').map(p => p.categoriaId)
    );

    // Gastos del mes anterior: sin transferencias, sin categorías excluidas,
    // solo categorías que existen actualmente en el catálogo
    const gastosDelMes = gastos.filter(g => {
      if (g.esTransferencia) return false;
      if (CATEGORIAS_EXCLUIDAS.includes(g.categoria)) return false;
      const f = new Date(g.fecha);
      return f.getMonth() === mesPasado && f.getFullYear() === anioPasado;
    });

    const transacciones = gastosDelMes.filter(g => g.tipo === 'gasto' && idsCategorias.has(g.categoria));
    const totalTransacciones = transacciones.length;
    const suficientesDatos = totalTransacciones >= MIN_TRANSACCIONES;

    // Ingresos del mes anterior en moneda base
    const ingresosMes = gastosDelMes
      .filter(g => g.tipo === 'ingreso')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);

    // Ahorro requerido mensual de metas activas
    const metasActivas = metas.filter(m => m.estado === 'en_progreso');
    const ahorroMetas = metasActivas.reduce((sum, m) => {
      const stats = obtenerEstadisticasMeta(m.id);
      return sum + (stats?.ahorroRequeridoMensual ?? 0);
    }, 0);

    // Gastos recurrentes activos: equivalente mensual en moneda base
    const totalRecurrentes = gastosRecurrentes
      .filter(gr => gr.activo)
      .reduce((sum, gr) => {
        const montoBase = convertirAMonedaBase(gr.monto, gr.moneda);
        if (gr.frecuencia === 'mensual') return sum + montoBase;
        if (gr.frecuencia === 'semanal') return sum + montoBase * 52 / 12;
        if (gr.frecuencia === 'diario') return sum + montoBase * 30;
        return sum;
      }, 0);

    const disponible = Math.max(0, ingresosMes - ahorroMetas - totalRecurrentes);

    // Gastos históricos por categoría real (en moneda base)
    const porCategoria: Record<string, number> = {};
    transacciones.forEach(g => {
      const monto = g.montoEnMonedaBase ?? g.monto;
      porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + monto;
    });

    const totalGastado = Object.values(porCategoria).reduce((sum, v) => sum + v, 0);

    const sugerencias: SugerenciaCategoria[] = Object.entries(porCategoria)
      .map(([categoriaId, montoHistorico]) => ({
        categoriaId,
        montoHistorico,
        proporcion: totalGastado > 0 ? montoHistorico / totalGastado : 0,
        montoSugerido: totalGastado > 0
          ? Math.round((montoHistorico / totalGastado) * disponible)
          : 0,
        tienePresupuesto: idsConPresupuesto.has(categoriaId),
      }))
      // Ordenar: primero las que ya tienen presupuesto, luego por monto histórico
      .sort((a, b) => {
        if (a.tienePresupuesto !== b.tienePresupuesto) {
          return a.tienePresupuesto ? -1 : 1;
        }
        return b.montoHistorico - a.montoHistorico;
      });

    return {
      suficientesDatos,
      totalTransacciones,
      minTransacciones: MIN_TRANSACCIONES,
      mesAnalizadoLabel,
      mesSugeridoLabel,
      ingresosMes,
      ahorroMetas,
      totalRecurrentes,
      disponible,
      sugerencias,
      monedaBaseId,
      monedaBaseSimbolo,
    };
  }, [gastos, metas, obtenerEstadisticasMeta, monedaBase, convertirAMonedaBase, categorias, presupuestos, gastosRecurrentes]);
};
