/**
 * Hook para manejar alertas de presupuesto
 * Detecta cuando una categoría está cerca o ha excedido su presupuesto
 */

import { useMemo } from 'react';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useCategorias } from '../context/CategoriasContext';
import { EstadisticasPresupuesto } from '../types';

interface AlertaPresupuesto extends EstadisticasPresupuesto {
  nombreCategoria: string;
  emojiCategoria: string;
  colorCategoria: string;
}

export const useAlertasPresupuesto = () => {
  const { presupuestos, obtenerEstadisticasPresupuesto } = usePresupuestos();
  const { categorias } = useCategorias();

  const alertas = useMemo((): AlertaPresupuesto[] => {
    const alertasActivas: AlertaPresupuesto[] = [];

    presupuestos.forEach(presupuesto => {
      const stats = obtenerEstadisticasPresupuesto(
        presupuesto.categoriaId,
        presupuesto.periodo
      );

      if (stats && (stats.debeAlertar || stats.excedido)) {
        const categoria = categorias.find(c => c.id === presupuesto.categoriaId);
        if (categoria) {
          alertasActivas.push({
            ...stats,
            nombreCategoria: categoria.nombre,
            emojiCategoria: categoria.emoji,
            colorCategoria: categoria.color,
          });
        }
      }
    });

    return alertasActivas;
  }, [presupuestos, obtenerEstadisticasPresupuesto, categorias]);

  return {
    alertas,
    tieneAlertas: alertas.length > 0,
    cantidadAlertas: alertas.length,
  };
};
