/**
 * Constantes para las keys del AsyncStorage
 * Centralizadas para evitar errores de tipeo
 */

export const STORAGE_KEYS = {
  GASTOS: 'gastos',
  TEMA: 'tema_seleccionado',
  CATEGORIAS: 'categorias_personalizadas',
  PRESUPUESTOS: 'presupuestos',
  TARJETAS: 'tarjetas_credito',
  ULTIMA_ALERTA_DESCARTADA: 'ultima_alerta_descartada',
  FRECUENCIA_ALERTAS: 'frecuencia_alertas',
  RECORDATORIOS: 'recordatorios',
  MODO_OSCURO_AUTO: 'modo_oscuro_automatico',
  METAS: 'metas_ahorro',
  CUOTAS: 'cuotas_sin_intereses',
  MONEDAS: 'configuracion_monedas',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
