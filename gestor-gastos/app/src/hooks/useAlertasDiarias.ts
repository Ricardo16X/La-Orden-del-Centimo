/**
 * Hook para manejar la lógica de alertas diarias
 * Controla cuándo mostrar y cuándo ocultar el modal de alertas
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage-keys';

export const useAlertasDiarias = () => {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    verificarSiMostrarAlertas();
  }, []);

  /**
   * Verifica si se deben mostrar las alertas hoy
   * Compara la fecha actual con la última vez que se descartaron
   */
  const verificarSiMostrarAlertas = async () => {
    try {
      const ultimaDescartadaStr = await AsyncStorage.getItem(STORAGE_KEYS.ULTIMA_ALERTA_DESCARTADA);

      if (!ultimaDescartadaStr) {
        // Primera vez, mostrar alertas
        setModalVisible(true);
        return;
      }

      const ultimaDescartada = new Date(ultimaDescartadaStr);
      const hoy = new Date();

      // Resetear horas para comparar solo fechas
      ultimaDescartada.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);

      // Si es un día diferente, mostrar alertas
      if (hoy.getTime() > ultimaDescartada.getTime()) {
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error al verificar alertas:', error);
      // En caso de error, mostrar alertas por seguridad
      setModalVisible(true);
    }
  };

  /**
   * Descarta las alertas y guarda la fecha actual
   * Las alertas no se mostrarán hasta mañana
   */
  const descartarAlertas = async () => {
    try {
      const hoy = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.ULTIMA_ALERTA_DESCARTADA, hoy);
      setModalVisible(false);
    } catch (error) {
      console.error('Error al descartar alertas:', error);
      // Cerrar modal aunque falle el guardado
      setModalVisible(false);
    }
  };

  /**
   * Fuerza mostrar el modal de alertas
   * Útil para testing o botón manual
   */
  const mostrarAlertas = () => {
    setModalVisible(true);
  };

  return {
    modalVisible,
    descartarAlertas,
    mostrarAlertas,
  };
};
