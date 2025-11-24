/**
 * Configuración de temas de la aplicación
 */

import { Tema } from '../types';

export const TEMAS: Tema[] = [
  {
    id: 'medieval',
    nombre: 'Medieval',
    emoji: '⚔️',
    colores: {
      fondo: '#2c2416',
      fondoSecundario: '#3d2f1f',
      primario: '#d4af37',
      primarioClaro: '#ffd700',
      acento: '#8b4513',
      bordes: '#8b7355',
      texto: '#f5deb3',
      textoSecundario: '#c9b08a',
    },
    companero: {
      avatar: '🐉',
      nombre: 'Dragón Guardián',
    },
    moneda: 'Septims',
    categorias: {
      comida: '🍖',
      transporte: '🐴',
      equipo: '⚔️',
      pociones: '🧪',
      vivienda: '🏠',
      entrenamiento: '🎯',
      otros: '📦',
    },
  },
  {
    id: 'kawaii',
    nombre: 'Kawaii',
    emoji: '🌸',
    colores: {
      fondo: '#fff0f5',
      fondoSecundario: '#ffe4e1',
      primario: '#ff69b4',
      primarioClaro: '#ffb6c1',
      acento: '#ff1493',
      bordes: '#ffc0cb',
      texto: '#8b4789',
      textoSecundario: '#d8bfd8',
    },
    companero: {
      avatar: '🐱',
      nombre: 'Neko-chan',
    },
    moneda: 'Moneditas',
    categorias: {
      comida: '🍥',
      transporte: '🚗',
      equipo: '👗',
      pociones: '🧋',
      vivienda: '🏡',
      entrenamiento: '💪',
      otros: '🛍️',
    },
  },
];

export const obtenerTema = (id: string): Tema => {
  return TEMAS.find(t => t.id === id) || TEMAS[0];
};