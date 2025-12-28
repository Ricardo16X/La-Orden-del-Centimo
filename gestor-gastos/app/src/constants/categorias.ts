import { Categoria } from '../types';

export const CATEGORIAS_BASE: Omit<Categoria, 'nombre'>[] = [
  { id: 'comida', emoji: '🍖', color: '#8b4513' },
  { id: 'transporte', emoji: '🐴', color: '#5c4033' },
  { id: 'equipo', emoji: '⚔️', color: '#708090' },
  { id: 'pociones', emoji: '🧪', color: '#9370db' },
  { id: 'vivienda', emoji: '🏠', color: '#cd853f' },
  { id: 'entrenamiento', emoji: '🎯', color: '#228b22' },
  { id: 'otros', emoji: '💼', color: '#696969' },
];

// Nombres tema Medieval (Skyrim)
const NOMBRES_MEDIEVAL: Record<string, string> = {
  comida: 'Comida y Bebida',
  transporte: 'Transporte',
  equipo: 'Equipo y Armamento',
  pociones: 'Pociones y Alquimia',
  vivienda: 'Vivienda',
  entrenamiento: 'Entrenamiento',
  otros: 'Comercio General',
};

// Nombres tema Kawaii
const NOMBRES_KAWAII: Record<string, string> = {
  comida: 'Comidita Rica',
  transporte: 'Movilidad',
  equipo: 'Ropa y Accesorios',
  pociones: 'Bebidas y Cafecito',
  vivienda: 'Casita',
  entrenamiento: 'Ejercicio',
  otros: 'Compras',
};

// Nombres tema Minimalista
const NOMBRES_MINIMAL: Record<string, string> = {
  comida: 'Alimentación',
  transporte: 'Transporte',
  equipo: 'Compras',
  pociones: 'Café y Bebidas',
  vivienda: 'Hogar',
  entrenamiento: 'Salud y Fitness',
  otros: 'Otros',
};

// Emojis Kawaii alternativos
export const EMOJIS_KAWAII: Record<string, string> = {
  comida: '🍰',
  transporte: '🚗',
  equipo: '👗',
  pociones: '🧋',
  vivienda: '🏡',
  entrenamiento: '💪',
  otros: '🛍️',
};

// Genera categorías según el tema
export const obtenerCategorias = (
  temaId: string = 'medieval',
  categoriasNombres?: Record<string, string>
): Categoria[] => {
  const emojis = temaId === 'kawaii' ? EMOJIS_KAWAII : {};

  let nombresDefault;
  if (temaId === 'kawaii') {
    nombresDefault = NOMBRES_KAWAII;
  } else if (temaId === 'minimal-light' || temaId === 'minimal-dark') {
    nombresDefault = NOMBRES_MINIMAL;
  } else {
    nombresDefault = NOMBRES_MEDIEVAL;
  }

  const nombres = categoriasNombres || nombresDefault;

  return CATEGORIAS_BASE.map(cat => ({
    ...cat,
    emoji: emojis[cat.id] || cat.emoji,
    nombre: nombres[cat.id] || cat.id,
  }));
};

// Esta función ahora tiene valores por defecto seguros
export const obtenerCategoria = (
  categoriaId: string, 
  temaId: string = 'medieval', 
  categoriasNombres?: Record<string, string>
): Categoria => {
  const categorias = obtenerCategorias(temaId, categoriasNombres);
  return categorias.find(cat => cat.id === categoriaId) || categorias[0];
};