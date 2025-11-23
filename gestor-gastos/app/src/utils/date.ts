/**
 * Utilidades para manejo de fechas
 */

/**
 * Obtiene la fecha actual en formato localizado
 * @returns Fecha en formato string local
 */
export const getFechaActual = (): string => {
  return new Date().toLocaleDateString();
};

/**
 * Formatea una fecha a formato legible
 * @param fecha - Fecha en string o Date
 * @returns Fecha formateada
 */
export const formatearFecha = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Verifica si una fecha es de hoy
 * @param fecha - Fecha en string
 * @returns true si es hoy
 */
export const esHoy = (fecha: string): boolean => {
  const hoy = new Date().toLocaleDateString();
  return fecha === hoy;
};

/**
 * Obtiene el inicio del día para comparaciones
 * @param fecha - Fecha opcional (default: hoy)
 * @returns Timestamp del inicio del día
 */
export const getInicioDia = (fecha?: Date): number => {
  const date = fecha || new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Genera un ID único basado en timestamp
 * @returns ID único como string
 */
export const generarId = (): string => {
  return Date.now().toString();
};
