/**
 * Hook para manejar alertas de tarjetas de crédito
 * Detecta tarjetas con pago próximo o cerca del corte
 */

import { useMemo } from 'react';
import { useTarjetas } from '../context/TarjetasContext';
import { TarjetaCredito, InfoEstadoTarjeta } from '../types';

interface AlertaTarjeta extends InfoEstadoTarjeta {
  tarjeta: TarjetaCredito;
}

export const useAlertasTarjetas = () => {
  const { tarjetas, obtenerEstadoTarjeta } = useTarjetas();

  const alertas = useMemo((): AlertaTarjeta[] => {
    const alertasActivas: AlertaTarjeta[] = [];

    tarjetas.forEach(tarjeta => {
      const estado = obtenerEstadoTarjeta(tarjeta);

      // Solo mostrar alertas para tarjetas pendientes de pago o cerca del corte
      if (estado.estado === 'pendiente_pago' || estado.estado === 'cerca_corte') {
        alertasActivas.push({
          ...estado,
          tarjeta,
        });
      }
    });

    // Ordenar: primero las pendientes de pago, luego las cercanas al corte
    return alertasActivas.sort((a, b) => {
      if (a.estado === 'pendiente_pago' && b.estado !== 'pendiente_pago') return -1;
      if (a.estado !== 'pendiente_pago' && b.estado === 'pendiente_pago') return 1;

      // Si son del mismo tipo, ordenar por días restantes
      if (a.estado === 'pendiente_pago') {
        return a.diasParaPago - b.diasParaPago;
      } else {
        return a.diasParaCorte - b.diasParaCorte;
      }
    });
  }, [tarjetas, obtenerEstadoTarjeta]);

  const tarjetasSeguras = useMemo(() => {
    return tarjetas.filter(tarjeta => {
      const estado = obtenerEstadoTarjeta(tarjeta);
      return estado.estado === 'seguro';
    }).map(tarjeta => ({
      tarjeta,
      estado: obtenerEstadoTarjeta(tarjeta),
    }));
  }, [tarjetas, obtenerEstadoTarjeta]);

  return {
    alertas,
    tarjetasSeguras,
    tieneAlertas: alertas.length > 0,
    cantidadAlertas: alertas.length,
    tieneTarjetasSeguras: tarjetasSeguras.length > 0,
  };
};
