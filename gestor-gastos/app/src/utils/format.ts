/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un número como moneda
 * @param monto - Cantidad a formatear
 * @param simbolo - Símbolo de moneda (opcional)
 * @returns Monto formateado
 */
export const formatearMoneda = (monto: number, simbolo: string = ''): string => {
  const montoFormateado = monto.toFixed(2);
  return simbolo ? `${montoFormateado} ${simbolo}` : montoFormateado;
};

/**
 * Formatea un número con separadores de miles
 * @param numero - Número a formatear
 * @returns Número formateado con comas
 */
export const formatearNumero = (numero: number): string => {
  return numero.toLocaleString('es-ES');
};

/**
 * Trunca un texto si excede la longitud máxima
 * @param texto - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con "..." si es necesario
 */
export const truncarTexto = (texto: string, maxLength: number = 50): string => {
  if (texto.length <= maxLength) {
    return texto;
  }
  return texto.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza la primera letra de un string
 * @param texto - Texto a capitalizar
 * @returns Texto capitalizado
 */
export const capitalizarPrimeraLetra = (texto: string): string => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Formatea un porcentaje
 * @param valor - Valor entre 0 y 1
 * @param decimales - Número de decimales (default: 0)
 * @returns Porcentaje formateado
 */
export const formatearPorcentaje = (valor: number, decimales: number = 0): string => {
  return `${(valor * 100).toFixed(decimales)}%`;
};
