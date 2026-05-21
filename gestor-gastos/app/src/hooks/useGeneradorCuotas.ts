/**
 * Hook para auto-generar gastos de cuotas en fecha de corte
 * Este hook se ejecuta en cada render y verifica si hay cuotas que necesitan
 * generar un gasto mensual basado en la fecha de corte de la tarjeta.
 *
 * NOTA: En Fase 1, esto es una implementación básica.
 * En Fase 2, esto se integrará con notificaciones y recordatorios automáticos.
 */

import { useEffect, useRef } from 'react';
import { useCuotas } from '../context/CuotasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { useGastos } from '../context/GastosContext';
import { useNotificacionesCuotas } from './useNotificacionesCuotas';

export const useGeneradorCuotas = () => {
  const { cuotas, registrarPagoCuota } = useCuotas();
  const { obtenerCategoriaTarjeta } = useTarjetas();
  const { agregarGasto } = useGastos();
  const { enviarNotificacionInmediata } = useNotificacionesCuotas();

  // Guard de idempotencia: evita procesar la misma cuota más de una vez por día
  // aunque el efecto se re-ejecute por cambios de estado durante el procesamiento
  const procesadosHoy = useRef<Set<string>>(new Set());
  const ultimaFechaEjecucion = useRef<string>('');

  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaHoy = hoy.toDateString();

    // Resetear el guard si es un nuevo día
    if (ultimaFechaEjecucion.current !== fechaHoy) {
      procesadosHoy.current.clear();
      ultimaFechaEjecucion.current = fechaHoy;
    }

    cuotas
      .filter(cuota => cuota.estado === 'activa' && !procesadosHoy.current.has(cuota.id))
      .forEach(cuota => {
        const fechaProximaCuota = new Date(cuota.fechaProximaCuota);
        fechaProximaCuota.setHours(0, 0, 0, 0);

        if (fechaProximaCuota <= hoy) {
          // Marcar como procesada ANTES de las operaciones async para evitar doble ejecución
          procesadosHoy.current.add(cuota.id);

          agregarGasto({
            monto: cuota.montoPorCuota,
            descripcion: `Cuota ${cuota.cuotasPagadas + 1}/${cuota.cantidadCuotas}: ${cuota.descripcion}`,
            categoria: obtenerCategoriaTarjeta(cuota.tarjetaId),
            tipo: 'gasto',
            tarjetaId: cuota.tarjetaId,
            fecha: cuota.fechaProximaCuota,
            moneda: cuota.moneda,
          });

          enviarNotificacionInmediata(
            '✅ Cuota registrada automáticamente',
            `Se registró la cuota ${cuota.cuotasPagadas + 1}/${cuota.cantidadCuotas} de "${cuota.descripcion}" por Q${cuota.montoPorCuota.toFixed(2)}`,
            cuota.id
          );

          registrarPagoCuota(cuota.id);
        }
      });
  }, [cuotas]);

  return {
    // En Fase 2, este hook podría retornar información sobre
    // cuotas pendientes de generar, permitiendo al usuario
    // controlar manualmente cuándo se generan los gastos
  };
};
