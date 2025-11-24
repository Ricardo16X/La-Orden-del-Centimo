import { useState, useEffect, useRef } from 'react';
import { obtenerFraseAleatoria, obtenerFraseSegunMonto } from '../constants/companero';
import { Gasto } from '../types';

/**
 * Hook para manejar los mensajes del compañero
 */
export const useCompaneroMensajes = (
  temaId: string,
  ultimoGastoAgregado: Gasto | null,
  onGastoAgregado?: () => void
) => {
  const [mensajeCompanero, setMensajeCompanero] = useState<string>('');
  const [mostrarCompanero, setMostrarCompanero] = useState<boolean>(false);
  const [contadorMensajes, setContadorMensajes] = useState<number>(0);
  const ultimoGastoIdProcesado = useRef<string | null>(null);

  // Mensaje de bienvenida
  useEffect(() => {
    const timer = setTimeout(() => {
      const fraseBienvenida = obtenerFraseAleatoria('bienvenida', temaId);
      mostrarMensaje(fraseBienvenida);
    }, 500);

    return () => clearTimeout(timer);
  }, [temaId]);

  // Mensaje cuando se agrega un gasto o ingreso
  useEffect(() => {
    if (ultimoGastoAgregado && ultimoGastoAgregado.id !== ultimoGastoIdProcesado.current) {
      ultimoGastoIdProcesado.current = ultimoGastoAgregado.id;

      // Solo otorgar XP si es un gasto (no por ingresos)
      if (ultimoGastoAgregado.tipo === 'gasto' && onGastoAgregado) {
        onGastoAgregado();
      }

      const frase = obtenerFraseSegunMonto(
        ultimoGastoAgregado.monto,
        temaId,
        ultimoGastoAgregado.tipo
      );
      mostrarMensaje(frase);

      // 30% de probabilidad de mensaje extra
      const mostrarExtra = Math.random() > 0.7;
      if (mostrarExtra) {
        setTimeout(() => {
          const tipoExtra = Math.random() > 0.5 ? 'motivacional' : 'consejo';
          mostrarMensaje(obtenerFraseAleatoria(tipoExtra, temaId));
        }, 3800);
      }
    }
  }, [ultimoGastoAgregado, temaId]);

  const mostrarMensaje = (mensaje: string) => {
    setMensajeCompanero(mensaje);
    setMostrarCompanero(true);
    setContadorMensajes(prev => prev + 1);
  };

  return {
    mensajeCompanero,
    mostrarCompanero,
    contadorMensajes,
    mostrarMensaje,
  };
};
