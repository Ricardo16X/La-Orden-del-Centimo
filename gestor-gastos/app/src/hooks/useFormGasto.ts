import { useState } from 'react';
import { Alert } from 'react-native';
import { validarGasto, sanitizarMonto } from '../utils';

/**
 * Hook personalizado para manejar el formulario de gastos
 */
export const useFormGasto = (
  onSubmit: (monto: number, descripcion: string, categoria: string, nota: string) => void,
  initialCategoria: string = 'comida'
) => {
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [nota, setNota] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(initialCategoria);

  const handleSubmit = () => {
    const validacion = validarGasto(monto, descripcion);

    if (!validacion.valido) {
      Alert.alert('Error', validacion.error || 'Datos inválidos');
      return false;
    }

    const montoSanitizado = sanitizarMonto(monto);
    onSubmit(montoSanitizado, descripcion.trim(), categoriaSeleccionada, nota.trim());
    return true;
  };

  const resetForm = () => {
    setMonto('');
    setDescripcion('');
    setNota('');
    setCategoriaSeleccionada(initialCategoria);
  };

  return {
    monto,
    setMonto,
    descripcion,
    setDescripcion,
    nota,
    setNota,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    handleSubmit,
    resetForm,
  };
};
