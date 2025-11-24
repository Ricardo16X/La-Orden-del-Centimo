/**
 * Lógica del compañero y sus frases según contexto
 */

import { FRASES_KAWAII } from './frasesKawaii';
import { FRASES_MEDIEVAL } from './frasesMedieval';
import { FraseCompanero, TipoFrase } from '../types';

// Re-exportar para backwards compatibility
export type { FraseCompanero, TipoFrase };

export const obtenerFrasesSegunTema = (temaId: string): FraseCompanero[] => {
  switch (temaId) {
    case 'kawaii':
      return FRASES_KAWAII;
    case 'medieval':
      return FRASES_MEDIEVAL;
    default:
      return FRASES_MEDIEVAL;
  }
};

export const obtenerFraseAleatoria = (tipo: TipoFrase, temaId: string = 'medieval'): string => {
  const frases = obtenerFrasesSegunTema(temaId);
  const frasesFiltradas = frases.filter(f => f.tipo === tipo);
  const indiceAleatorio = Math.floor(Math.random() * frasesFiltradas.length);
  return frasesFiltradas[indiceAleatorio]?.texto || "...";
};

export const obtenerFraseSegunMonto = (monto: number, temaId: string = 'medieval', tipo: 'gasto' | 'ingreso' = 'gasto'): string => {
  const tipoBase = tipo === 'ingreso' ? 'ingreso' : 'gasto';

  if (monto > 100) {
    return obtenerFraseAleatoria(`${tipoBase}_alto` as TipoFrase, temaId);
  } else if (monto < 10) {
    return obtenerFraseAleatoria(`${tipoBase}_bajo` as TipoFrase, temaId);
  } else {
    return obtenerFraseAleatoria(`${tipoBase}_agregado` as TipoFrase, temaId);
  }
};