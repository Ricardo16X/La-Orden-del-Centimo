/**
 * Utilidades para validación de datos
 */

export interface ValidacionResultado {
  valido: boolean;
  error?: string;
}

/**
 * Valida que un monto sea válido
 * @param monto - Monto a validar
 * @returns Resultado de la validación
 */
export const validarMonto = (monto: string | number): ValidacionResultado => {
  const valor = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (isNaN(valor)) {
    return { valido: false, error: 'El monto debe ser un número válido' };
  }

  if (valor <= 0) {
    return { valido: false, error: 'El monto debe ser mayor a 0' };
  }

  if (valor > 999999) {
    return { valido: false, error: 'El monto es demasiado alto' };
  }

  return { valido: true };
};

/**
 * Valida que una descripción sea válida
 * @param descripcion - Descripción a validar
 * @returns Resultado de la validación
 */
export const validarDescripcion = (descripcion: string): ValidacionResultado => {
  const texto = descripcion.trim();

  if (!texto) {
    return { valido: false, error: 'La descripción no puede estar vacía' };
  }

  if (texto.length < 3) {
    return { valido: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }

  if (texto.length > 100) {
    return { valido: false, error: 'La descripción es demasiado larga (máximo 100 caracteres)' };
  }

  return { valido: true };
};

/**
 * Valida un formulario de gasto completo
 * @param monto - Monto del gasto
 * @param descripcion - Descripción del gasto
 * @returns Resultado de la validación
 */
export const validarGasto = (
  monto: string | number,
  descripcion: string
): ValidacionResultado => {
  const validacionMonto = validarMonto(monto);
  if (!validacionMonto.valido) {
    return validacionMonto;
  }

  const validacionDescripcion = validarDescripcion(descripcion);
  if (!validacionDescripcion.valido) {
    return validacionDescripcion;
  }

  return { valido: true };
};

/**
 * Sanitiza un monto para almacenamiento
 * @param monto - Monto en string
 * @returns Número sanitizado con 2 decimales
 */
export const sanitizarMonto = (monto: string): number => {
  const valor = parseFloat(monto);
  return Math.round(valor * 100) / 100;
};
