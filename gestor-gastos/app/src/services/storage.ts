/**
 * Servicio de almacenamiento usando AsyncStorage
 * Centraliza todas las operaciones de persistencia de datos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gasto } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';

/**
 * Carga los gastos desde AsyncStorage
 * @returns Array de gastos guardados
 */
export const cargarGastos = async (): Promise<Gasto[]> => {
  try {
    const gastosGuardados = await AsyncStorage.getItem(STORAGE_KEYS.GASTOS);
    return gastosGuardados ? JSON.parse(gastosGuardados) : [];
  } catch (error) {
    console.error('Error cargando gastos:', error);
    return [];
  }
};

/**
 * Guarda los gastos en AsyncStorage
 * @param gastos - Array de gastos a guardar
 */
export const guardarGastos = async (gastos: Gasto[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(gastos));
  } catch (error) {
    console.error('Error guardando gastos:', error);
  }
};

/**
 * Carga el XP total desde AsyncStorage
 * @returns XP total del jugador
 */
export const cargarXP = async (): Promise<number> => {
  try {
    const xpGuardado = await AsyncStorage.getItem(STORAGE_KEYS.XP_TOTAL);
    return xpGuardado ? parseInt(xpGuardado, 10) : 0;
  } catch (error) {
    console.error('Error cargando XP:', error);
    return 0;
  }
};

/**
 * Guarda el XP total en AsyncStorage
 * @param xp - XP total a guardar
 */
export const guardarXP = async (xp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.XP_TOTAL, xp.toString());
  } catch (error) {
    console.error('Error guardando XP:', error);
  }
};

/**
 * Carga el tema seleccionado desde AsyncStorage
 * @returns ID del tema seleccionado o null
 */
export const cargarTema = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TEMA);
  } catch (error) {
    console.error('Error cargando tema:', error);
    return null;
  }
};

/**
 * Guarda el tema seleccionado en AsyncStorage
 * @param temaId - ID del tema a guardar
 */
export const guardarTema = async (temaId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TEMA, temaId);
  } catch (error) {
    console.error('Error guardando tema:', error);
  }
};

/**
 * Limpia todos los datos almacenados (útil para reset)
 */
export const limpiarDatos = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GASTOS,
      STORAGE_KEYS.XP_TOTAL,
      STORAGE_KEYS.TEMA,
    ]);
  } catch (error) {
    console.error('Error limpiando datos:', error);
  }
};