/**
 * Hook para generar sugerencias de presupuesto dinámico
 * Analiza el promedio de los últimos meses (no solo el mes pasado, para no
 * heredar la distorsión de un mes atípico) y propone montos basados en:
 * - Proporciones históricas de gasto por categoría (solo categorías reales)
 * - Ingresos promedio mensual del período analizado
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

const MESES_ANALIZAR = 3;
const MIN_TRANSACCIONES_POR_MES = 5;

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

    const monedaBaseId = monedaBase?.codigo || '';
    const monedaBaseSimbolo = monedaBase?.simbolo || '$';
    const mesSugeridoLabel = `${NOMBRES_MES[hoy.getMonth()]} ${hoy.getFullYear()}`;

    // Ventana de los últimos N meses completos anteriores al actual (el mes en curso
    // queda excluido por estar incompleto y distorsionar el promedio)
    const ventanaMeses = Array.from({ length: MESES_ANALIZAR }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (i + 1), 1);
      return { mes: fecha.getMonth(), anio: fecha.getFullYear() };
    });
    const masAntiguo = ventanaMeses[ventanaMeses.length - 1];
    const masReciente = ventanaMeses[0];
    const mesAnalizadoLabel = masAntiguo.anio === masReciente.anio
      ? `${NOMBRES_MES[masAntiguo.mes]}–${NOMBRES_MES[masReciente.mes]} ${masReciente.anio}`
      : `${NOMBRES_MES[masAntiguo.mes]} ${masAntiguo.anio} – ${NOMBRES_MES[masReciente.mes]} ${masReciente.anio}`;

    // IDs de categorías reales (las que existen en el catálogo del usuario)
    const idsCategorias = new Set(categorias.map(c => c.id));
    // IDs de categorías con presupuesto mensual ya configurado
    const idsConPresupuesto = new Set(
      presupuestos.filter(p => p.periodo === 'mensual').map(p => p.categoriaId)
    );

    // Gastos de la ventana analizada: sin transferencias, sin categorías excluidas,
    // solo categorías que existen actualmente en el catálogo
    const gastosDelPeriodo = gastos.filter(g => {
      if (g.esTransferencia) return false;
      if (CATEGORIAS_EXCLUIDAS.includes(g.categoria)) return false;
      const f = new Date(g.fecha);
      return ventanaMeses.some(v => f.getMonth() === v.mes && f.getFullYear() === v.anio);
    });

    // Cuántos meses de la ventana tienen al menos un movimiento real (evita diluir
    // el promedio con meses previos a que el usuario empezara a usar la app)
    const mesesConDatos = new Set(
      gastosDelPeriodo.map(g => {
        const f = new Date(g.fecha);
        return `${f.getFullYear()}-${f.getMonth()}`;
      })
    ).size || 1;

    // Gastos sin transferencias, recurrentes ni cuotas para aislar el gasto variable puro
    const transacciones = gastosDelPeriodo.filter(g =>
      g.tipo === 'gasto' &&
      idsCategorias.has(g.categoria) &&
      !g.descripcion.toLowerCase().includes('(recurrente)') &&
      !g.descripcion.toLowerCase().includes('cuota')
    );
    const totalTransacciones = transacciones.length;
    const minTransacciones = MIN_TRANSACCIONES_POR_MES * mesesConDatos;
    const suficientesDatos = totalTransacciones >= minTransacciones;

    // Ingresos promedio mensual del período, en moneda base
    const ingresosMes = gastosDelPeriodo
      .filter(g => g.tipo === 'ingreso')
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0) / mesesConDatos;

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

    // Gastos históricos VARIABLES por categoría real (en moneda base)
    const porCategoria: Record<string, number> = {};
    transacciones.forEach(g => {
      const monto = g.montoEnMonedaBase ?? g.monto;
      porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + monto;
    });

    const totalGastado = Object.values(porCategoria).reduce((sum, v) => sum + v, 0);

    const sugerencias: SugerenciaCategoria[] = categorias
      .map(categoria => {
        const categoriaId = categoria.id;
        const montoHistoricoTotal = porCategoria[categoriaId] ?? 0;
        // Promedio mensual para mostrar (la proporción, en cambio, usa el total de la
        // ventana ya que el promedio se cancela igual entre numerador y denominador)
        const montoHistorico = montoHistoricoTotal / mesesConDatos;

        const proporcion = totalGastado > 0 ? montoHistoricoTotal / totalGastado : 0;
        const montoSugeridoVariable = totalGastado > 0
          ? Math.round(proporcion * disponible)
          : 0;

        // Calcular recurrentes activos mensuales de esta categoría
        const recurrentesDeCategoria = gastosRecurrentes
          .filter(gr => gr.activo && gr.categoriaId === categoriaId)
          .reduce((sum, gr) => {
            const montoBase = convertirAMonedaBase(gr.monto, gr.moneda);
            if (gr.frecuencia === 'mensual') return sum + montoBase;
            if (gr.frecuencia === 'semanal') return sum + montoBase * 52 / 12;
            if (gr.frecuencia === 'diario') return sum + montoBase * 30;
            return sum;
          }, 0);

        // El presupuesto sugerido final es la suma de la parte variable asignada más los gastos fijos recurrentes de esa categoría
        const montoSugerido = montoSugeridoVariable + recurrentesDeCategoria;

        return {
          categoriaId,
          montoHistorico,
          proporcion,
          montoSugerido,
          tienePresupuesto: idsConPresupuesto.has(categoriaId),
        };
      })
      .filter(s => s.montoSugerido > 0)
      // Ordenar: primero las que ya tienen presupuesto, luego por el monto final sugerido de mayor a menor
      .sort((a, b) => {
        if (a.tienePresupuesto !== b.tienePresupuesto) {
          return a.tienePresupuesto ? -1 : 1;
        }
        return b.montoSugerido - a.montoSugerido;
      });

    return {
      suficientesDatos,
      totalTransacciones,
      minTransacciones,
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
