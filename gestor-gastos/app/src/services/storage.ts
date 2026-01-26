/**
 * Servicio de almacenamiento usando AsyncStorage
 * Centraliza todas las operaciones de persistencia de datos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gasto, Categoria, Recordatorio } from '../types';
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
 * Carga las categorías desde AsyncStorage
 * @returns Array de categorías guardadas
 */
export const cargarCategorias = async (): Promise<Categoria[]> => {
  try {
    const categoriasGuardadas = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIAS);
    return categoriasGuardadas ? JSON.parse(categoriasGuardadas) : [];
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return [];
  }
};

/**
 * Guarda las categorías en AsyncStorage
 * @param categorias - Array de categorías a guardar
 */
export const guardarCategorias = async (categorias: Categoria[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
  } catch (error) {
    console.error('Error guardando categorías:', error);
  }
};

/**
 * Carga los recordatorios desde AsyncStorage
 * @returns Array de recordatorios guardados
 */
export const cargarRecordatorios = async (): Promise<Recordatorio[]> => {
  try {
    const recordatoriosGuardados = await AsyncStorage.getItem(STORAGE_KEYS.RECORDATORIOS);
    return recordatoriosGuardados ? JSON.parse(recordatoriosGuardados) : [];
  } catch (error) {
    console.error('Error cargando recordatorios:', error);
    return [];
  }
};

/**
 * Guarda los recordatorios en AsyncStorage
 * @param recordatorios - Array de recordatorios a guardar
 */
export const guardarRecordatorios = async (recordatorios: Recordatorio[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDATORIOS, JSON.stringify(recordatorios));
  } catch (error) {
    console.error('Error guardando recordatorios:', error);
  }
};

/**
 * Carga el estado del modo oscuro automático
 * @returns true si está activado, false si no
 */
export const cargarModoOscuroAuto = async (): Promise<boolean> => {
  try {
    const modoGuardado = await AsyncStorage.getItem(STORAGE_KEYS.MODO_OSCURO_AUTO);
    return modoGuardado === 'true';
  } catch (error) {
    console.error('Error cargando modo oscuro auto:', error);
    return false;
  }
};

/**
 * Guarda el estado del modo oscuro automático
 * @param activo - true para activar, false para desactivar
 */
export const guardarModoOscuroAuto = async (activo: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MODO_OSCURO_AUTO, activo.toString());
  } catch (error) {
    console.error('Error guardando modo oscuro auto:', error);
  }
};

/**
 * Limpia todos los datos almacenados (útil para reset)
 */
export const limpiarDatos = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GASTOS,
      STORAGE_KEYS.TEMA,
      STORAGE_KEYS.CATEGORIAS,
    ]);
  } catch (error) {
    console.error('Error limpiando datos:', error);
  }
};