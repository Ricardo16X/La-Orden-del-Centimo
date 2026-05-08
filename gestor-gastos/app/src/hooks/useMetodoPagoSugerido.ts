import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage-keys';

// { [categoriaId]: { [metodoPago: 'efectivo' | tarjetaId]: count } }
type FrecuenciaMap = Record<string, Record<string, number>>;

export const useMetodoPagoSugerido = () => {
  const [frecuencias, setFrecuencias] = useState<FrecuenciaMap>({});
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.METODO_PAGO_FRECUENCIA)
      .then(data => { if (data) setFrecuencias(JSON.parse(data)); })
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem(STORAGE_KEYS.METODO_PAGO_FRECUENCIA, JSON.stringify(frecuencias));
  }, [frecuencias, cargado]);

  const registrarUso = (categoriaId: string, tarjetaId?: string) => {
    const metodo = tarjetaId ?? 'efectivo';
    setFrecuencias(prev => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [metodo]: (prev[categoriaId]?.[metodo] ?? 0) + 1,
      },
    }));
  };

  // Retorna undefined si el más frecuente es efectivo, o el tarjetaId si es tarjeta
  const obtenerSugerido = (categoriaId: string): string | undefined => {
    const frec = frecuencias[categoriaId];
    if (!frec) return undefined;
    const entries = Object.entries(frec);
    if (entries.length === 0) return undefined;
    const [mejor] = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
    return mejor === 'efectivo' ? undefined : mejor;
  };

  return { registrarUso, obtenerSugerido };
};
