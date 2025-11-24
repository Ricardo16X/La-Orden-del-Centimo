/**
 * Constantes para las keys del AsyncStorage
 * Centralizadas para evitar errores de tipeo
 */

export const STORAGE_KEYS = {
  GASTOS: 'gastos',
  XP_TOTAL: 'xp_total',
  TEMA: 'tema_seleccionado',
  ULTIMA_RACHA: 'ultima_racha',
  DATOS_JUGADOR: 'datos_jugador',
  CATEGORIAS: 'categorias_personalizadas',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
