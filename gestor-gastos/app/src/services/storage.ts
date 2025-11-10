import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gasto } from '../types';

const STORAGE_KEY_GASTOS = 'gastos';
const STORAGE_KEY_XP = 'xp_total';

export const cargarGastos = async (): Promise<Gasto[]> => {
  try {
    const gastosGuardados = await AsyncStorage.getItem(STORAGE_KEY_GASTOS);
    return gastosGuardados ? JSON.parse(gastosGuardados) : [];
  } catch (error) {
    console.error('Error cargando datos:', error);
    return [];
  }
};

export const guardarGastos = async (gastos: Gasto[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_GASTOS, JSON.stringify(gastos));
  } catch (error) {
    console.error('Error guardando datos:', error);
  }
};

export const cargarXP = async (): Promise<number> => {
  try {
    const xpGuardado = await AsyncStorage.getItem(STORAGE_KEY_XP);
    return xpGuardado ? parseInt(xpGuardado, 10) : 0;
  } catch (error) {
    console.error('Error cargando XP:', error);
    return 0;
  }
};

export const guardarXP = async (xp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_XP, xp.toString());
  } catch (error) {
    console.error('Error guardando XP:', error);
  }
};