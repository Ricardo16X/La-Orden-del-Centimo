import { Categoria } from '../types';

export const CATEGORIAS_BASE: Omit<Categoria, 'nombre'>[] = [
  { id: 'comida', emoji: '🍽️', color: '#ff6b6b' },
  { id: 'transporte', emoji: '🚘', color: '#4ecdc4' },
  { id: 'equipo', emoji: '🛒', color: '#45b7d1' },
  { id: 'pociones', emoji: '☕', color: '#96ceb4' },
  { id: 'vivienda', emoji: '🏠', color: '#ffeaa7' },
  { id: 'entrenamiento', emoji: '🏃', color: '#dfe6e9' },
  { id: 'otros', emoji: '📦', color: '#b2bec3' },
];

// Nombres profesionales de categorías
const NOMBRES_CATEGORIAS: Record<string, string> = {
  comida: 'Alimentación',
  transporte: 'Transporte',
  equipo: 'Compras',
  pociones: 'Café y Bebidas',
  vivienda: 'Hogar',
  entrenamiento: 'Salud y Fitness',
  otros: 'Otros',
};

// Genera categorías con nombres profesionales
export const obtenerCategorias = (
  categoriasNombres?: Record<string, string>
): Categoria[] => {
  const nombres = categoriasNombres || NOMBRES_CATEGORIAS;

  return CATEGORIAS_BASE.map(cat => ({
    ...cat,
    nombre: nombres[cat.id] || cat.id,
  }));
};

// Obtiene una categoría específica
export const obtenerCategoria = (
  categoriaId: string,
  categoriasNombres?: Record<string, string>
): Categoria => {
  const categorias = obtenerCategorias(categoriasNombres);
  return categorias.find(cat => cat.id === categoriaId) || categorias[0];
};
