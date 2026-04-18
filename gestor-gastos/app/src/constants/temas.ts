/**
 * Configuración de temas de la aplicación
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
  {
    // "La Orden" — sociedad secreta, control financiero en las sombras.
    // Paleta flat & dark: cobre pulido como único acento cálido sobre pizarra casi negra.
    id: 'orden',
    nombre: 'La Orden',
    emoji: '🜲',
    colores: {
      // Sala de juntas oscura — fondo que no distrae
      fondo: '#121415',
      // Superficie de cards apenas distinguible del fondo, sin romper la oscuridad
      fondoSecundario: '#1A1D1E',
      // Cobre pulido — el único color con vida; botones, saldos, íconos activos
      primario: '#8B4A3C',
      // Cobre ligeramente más claro para estados hover/activo
      primarioClaro: '#D4926E',
      // Mismo cobre como acento (coherencia visual en un sistema de un solo acento)
      acento: '#C87D55',
      // Separadores tan sutiles que no interrumpen la lectura
      bordes: '#2A2D2F',
      // Blanco hueso — nunca blanco puro para no romper la atmósfera
      texto: '#E0E0E0',
      // Gris con toque cobrizo para fechas, categorías y metadatos
      textoSecundario: '#7A7068',
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
  }
];

export const obtenerTema = (id: string): Tema => {
  return TEMAS.find(t => t.id === id) || TEMAS[0];
};
