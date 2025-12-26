/**
 * Utilidades para manejo de fechas
 */

/**
 * Obtiene la fecha actual en formato ISO
 * @returns Fecha en formato ISO string
 */
export const getFechaActual = (): string => {
  return new Date().toISOString();
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

/**
 * Formatea el tiempo restante en días, meses o años de forma inteligente
 */
export const formatearTiempoRestante = (dias: number): string => {
  if (dias < 0) return '0 días';

  if (dias === 0) return 'Hoy';
  if (dias === 1) return '1 día';

  // Menos de 60 días: mostrar en días
  if (dias < 60) {
    return `${dias} días`;
  }

  // Entre 60 días y 2 años: mostrar en meses
  if (dias < 730) {
    const meses = Math.floor(dias / 30);
    const diasRestantes = dias % 30;

    if (diasRestantes === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }

    if (meses === 0) {
      return `${diasRestantes} días`;
    }

    return `${meses} ${meses === 1 ? 'mes' : 'meses'} y ${diasRestantes} días`;
  }

  // Más de 2 años: mostrar en años
  const anos = Math.floor(dias / 365);
  const mesesRestantes = Math.floor((dias % 365) / 30);

  if (mesesRestantes === 0) {
    return `${anos} ${anos === 1 ? 'año' : 'años'}`;
  }

  return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
};

/**
 * Formatea el ahorro requerido según el período
 * Para metas a largo plazo, muestra el ahorro mensual en vez del diario
 */
export const formatearAhorroRequerido = (diasRestantes: number, ahorroRequeridoDiario: number, ahorroRequeridoMensual: number): string => {
  if (diasRestantes < 60) {
    return `$${ahorroRequeridoDiario.toFixed(2)}/día`;
  }

  return `$${ahorroRequeridoMensual.toFixed(2)}/mes`;
};

/**
 * Obtiene una descripción del período de la meta
 */
export const obtenerDescripcionPeriodo = (fechaInicio: string, fechaLimite: string): string => {
  const inicio = new Date(fechaInicio);
  const limite = new Date(fechaLimite);

  const dias = Math.floor((limite.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

  return formatearTiempoRestante(dias);
};
