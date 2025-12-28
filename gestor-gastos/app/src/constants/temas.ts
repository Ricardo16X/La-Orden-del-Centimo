/**
 * Configuración de temas de la aplicación
 */

import { Tema } from '../types';

export const TEMAS: Tema[] = [
  {
    id: 'medieval',
    nombre: 'Reino Medieval',
    emoji: '⚔️',
    colores: {
      fondo: '#2c2416',
      fondoSecundario: '#3d2f1f',
      primario: '#d4af37',
      primarioClaro: '#ffd700',
      acento: '#8b4513',
      bordes: '#9d8463',
      texto: '#f5deb3',
      textoSecundario: '#d4af37',
    },
    companero: {
      avatar: '🐉',
      nombre: 'Dragón del Tesoro',
    },
    moneda: 'Monedas de Oro',
    categorias: {
      comida: '🍖',
      transporte: '🐴',
      equipo: '⚔️',
      pociones: '🧪',
      vivienda: '🏰',
      entrenamiento: '🎯',
      otros: '📦',
    },
  },
  {
    id: 'kawaii',
    nombre: 'Mundo Kawaii',
    emoji: '🌸',
    colores: {
      fondo: '#fff0f5',
      fondoSecundario: '#ffe4e1',
      primario: '#ff69b4',
      primarioClaro: '#ffb6c1',
      acento: '#ff1493',
      bordes: '#ff85b3',
      texto: '#6d3673',
      textoSecundario: '#9d4b9d',
    },
    companero: {
      avatar: '🐱',
      nombre: 'Michi Ahorrador',
    },
    moneda: 'Estrellitas',
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
  {
    id: 'minimal-light',
    nombre: 'Minimalista Día',
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
    companero: {
      avatar: '📊',
      nombre: 'Asistente Financiero',
    },
    moneda: 'USD',
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
    id: 'minimal-dark',
    nombre: 'Minimalista Noche',
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
    companero: {
      avatar: '📊',
      nombre: 'Asistente Financiero',
    },
    moneda: 'USD',
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