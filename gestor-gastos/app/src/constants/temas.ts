/**
 * Configuración de temas de la aplicación
 * Solo modo claro y oscuro
 */

import { Tema } from '../types';

export const TEMAS: Tema[] = [
  {
    id: 'light',
    nombre: 'Claro',
    emoji: '☀️',
    colores: {
      fondo: '#ffffff',
      fondoSecundario: '#f8f9fa',
      primario: '#2c3e50',
      primarioClaro: '#34495e',
      acento: '#5a6c7d',
      bordes: '#e1e8ed',
      texto: '#1a1a1a',
      textoSecundario: '#6c757d',
    },
    moneda: '$',
    categorias: {
      comida: '🍽️',
      transporte: '🚘',
      equipo: '🛒',
      pociones: '☕',
      vivienda: '🏠',
      entrenamiento: '🏃',
      otros: '📦',
    },
  },
  {
    id: 'dark',
    nombre: 'Oscuro',
    emoji: '🌙',
    colores: {
      fondo: '#0d1117',
      fondoSecundario: '#161b22',
      primario: '#58a6ff',
      primarioClaro: '#79c0ff',
      acento: '#58a6ff',
      bordes: '#30363d',
      texto: '#f0f6fc',
      textoSecundario: '#8d96a0',
    },
    moneda: '$',
    categorias: {
      comida: '🍽️',
      transporte: '🚘',
      equipo: '🛒',
      pociones: '☕',
      vivienda: '🏠',
      entrenamiento: '🏃',
      otros: '📦',
    },
  },
];

export const obtenerTema = (id: string): Tema => {
  return TEMAS.find(t => t.id === id) || TEMAS[0];
};
