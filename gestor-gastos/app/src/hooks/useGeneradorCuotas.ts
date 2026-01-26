/**
 * Hook para auto-generar gastos de cuotas en fecha de corte
 * Este hook se ejecuta en cada render y verifica si hay cuotas que necesitan
 * generar un gasto mensual basado en la fecha de corte de la tarjeta.
 *
 * NOTA: En Fase 1, esto es una implementación básica.
 * En Fase 2, esto se integrará con notificaciones y recordatorios automáticos.
 */

import { useEffect } from 'react';
import { useCuotas } from '../context/CuotasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { useGastos } from '../context/GastosContext';
import { useNotificacionesCuotas } from './useNotificacionesCuotas';

export const useGeneradorCuotas = () => {
  const { cuotas, registrarPagoCuota } = useCuotas();
  const { obtenerCategoriaTarjeta } = useTarjetas();
  const { agregarGasto } = useGastos();
  const { enviarNotificacionInmediata } = useNotificacionesCuotas();

  useEffect(() => {
    // Verificar cuotas que necesitan generar gasto
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    cuotas
      .filter(cuota => cuota.estado === 'activa')
      .forEach(cuota => {
        const fechaProximaCuota = new Date(cuota.fechaProximaCuota);
        fechaProximaCuota.setHours(0, 0, 0, 0);

        // Si ya llegó la fecha de la próxima cuota
        if (fechaProximaCuota <= hoy) {
          // Generar gasto automático usando categoría de la tarjeta
          // NOTA: Cada tarjeta ahora tiene su propia categoría automática
          agregarGasto({
            monto: cuota.montoPorCuota,
            descripcion: `Cuota ${cuota.cuotasPagadas + 1}/${cuota.cantidadCuotas}: ${cuota.descripcion}`,
            categoria: obtenerCategoriaTarjeta(cuota.tarjetaId),
            tipo: 'gasto',
          });

          // Enviar notificación
          enviarNotificacionInmediata(
            '✅ Cuota registrada automáticamente',
            `Se registró la cuota ${cuota.cuotasPagadas + 1}/${cuota.cantidadCuotas} de "${cuota.descripcion}" por Q${cuota.montoPorCuota.toFixed(2)}`,
            cuota.id
          );

          // Registrar que se pagó esta cuota
          registrarPagoCuota(cuota.id);
        }
      });
  }, [cuotas]); // Se ejecuta cuando cambian las cuotas

  return {
    // En Fase 2, este hook podría retornar información sobre
    // cuotas pendientes de generar, permitiendo al usuario
    // controlar manualmente cuándo se generan los gastos
  };
};
