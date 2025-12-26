/**
 * Hook para exportar datos en diferentes formatos
 */

import { Share } from 'react-native';
import { Gasto } from '../types';

export const useExportar = () => {
  /**
   * Genera CSV a partir de gastos
   */
  const generarCSV = (gastos: Gasto[]): string => {
    if (gastos.length === 0) {
      return 'No hay datos para exportar';
    }

    const header = 'Fecha,Tipo,Categoría,Descripción,Monto\n';
    const rows = gastos.map(g => {
      const fecha = new Date(g.fecha).toLocaleDateString();
      const tipo = g.tipo === 'gasto' ? 'Gasto' : 'Ingreso';
      return `${fecha},${tipo},${g.categoria},"${g.descripcion}",${g.monto}`;
    }).join('\n');

    return header + rows;
  };

  /**
   * Genera un resumen de texto para compartir
   */
  const generarResumen = (
    totalIngresos: number,
    totalGastos: number,
    balance: number,
    periodo: string = 'total'
  ): string => {
    return `📊 Resumen de Gastos (${periodo})

💰 Total Ingresos: $${totalIngresos.toFixed(2)}
💸 Total Gastos: $${totalGastos.toFixed(2)}
📈 Balance: $${balance.toFixed(2)}

${balance >= 0 ? '✅ Balance positivo' : '⚠️ Balance negativo'}

🤖 Generado con Gestor de Gastos`;
  };

  /**
   * Comparte CSV vía WhatsApp, Email, etc.
   */
  const compartirCSV = async (gastos: Gasto[]): Promise<void> => {
    try {
      const csv = generarCSV(gastos);
      const resultado = await Share.share({
        message: csv,
        title: 'Exportación de Gastos (CSV)',
      });

      if (resultado.action === Share.sharedAction) {
        console.log('Compartido exitosamente');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      throw new Error('No se pudo compartir el archivo');
    }
  };

  /**
   * Comparte resumen de texto
   */
  const compartirResumen = async (
    totalIngresos: number,
    totalGastos: number,
    balance: number,
    periodo: string = 'total'
  ): Promise<void> => {
    try {
      const resumen = generarResumen(totalIngresos, totalGastos, balance, periodo);
      const resultado = await Share.share({
        message: resumen,
        title: 'Resumen de Gastos',
      });

      if (resultado.action === Share.sharedAction) {
        console.log('Compartido exitosamente');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      throw new Error('No se pudo compartir el resumen');
    }
  };

  return {
    generarCSV,
    generarResumen,
    compartirCSV,
    compartirResumen,
  };
};
