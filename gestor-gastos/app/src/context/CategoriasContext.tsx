/**
 * Context para gestión de categorías personalizadas
 * Maneja categorías predeterminadas y personalizadas del usuario
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Categoria } from '../types';
import { cargarCategorias, guardarCategorias } from '../services/storage';
import { useTema } from './TemaContext';
import { generarId } from '../utils';

interface CategoriasContextType {
  categorias: Categoria[];
  agregarCategoria: (categoria: Omit<Categoria, 'id' | 'esPersonalizada'>) => void;
  editarCategoria: (id: string, categoria: Partial<Omit<Categoria, 'id' | 'esPersonalizada'>>) => void;
  eliminarCategoria: (id: string) => void;
  obtenerCategoriaPorId: (id: string) => Categoria | undefined;
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export const CategoriasProvider = ({ children }: { children: ReactNode }) => {
  const { tema } = useTema();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargado, setCargado] = useState(false);

  // Categorías predeterminadas con nombres profesionales
  const obtenerCategoriasDefault = (): Categoria[] => {
    const nombres = {
      comida: 'Alimentación',
      transporte: 'Transporte',
      equipo: 'Compras',
      pociones: 'Café y Bebidas',
      vivienda: 'Hogar',
      entrenamiento: 'Salud y Fitness',
      otros: 'Otros',
    };

    const categoriasBase = [
      { id: 'comida', nombre: nombres.comida, emoji: tema.categorias.comida, color: '#ff6b6b', esPersonalizada: false },
      { id: 'transporte', nombre: nombres.transporte, emoji: tema.categorias.transporte, color: '#4ecdc4', esPersonalizada: false },
      { id: 'equipo', nombre: nombres.equipo, emoji: tema.categorias.equipo, color: '#45b7d1', esPersonalizada: false },
      { id: 'pociones', nombre: nombres.pociones, emoji: tema.categorias.pociones, color: '#96ceb4', esPersonalizada: false },
      { id: 'vivienda', nombre: nombres.vivienda, emoji: tema.categorias.vivienda, color: '#ffeaa7', esPersonalizada: false },
      { id: 'entrenamiento', nombre: nombres.entrenamiento, emoji: tema.categorias.entrenamiento, color: '#dfe6e9', esPersonalizada: false },
      { id: 'otros', nombre: nombres.otros, emoji: tema.categorias.otros, color: '#b2bec3', esPersonalizada: false },
    ];

    return categoriasBase;
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Actualizar emojis y nombres de categorías predeterminadas cuando cambia el tema
  useEffect(() => {
    if (cargado) {
      setCategorias(prev => {
        const defaultCats = obtenerCategoriasDefault();
        return prev.map(cat => {
          if (!cat.esPersonalizada) {
            const defaultCat = defaultCats.find(dc => dc.id === cat.id);
            if (defaultCat) {
              return { ...cat, emoji: defaultCat.emoji, nombre: defaultCat.nombre };
            }
          }
          return cat;
        });
      });
    }
  }, [tema.id, cargado]);

  const cargarDatos = async () => {
    const categoriasGuardadas = await cargarCategorias();

    if (categoriasGuardadas.length === 0) {
      // Primera vez: usar categorías predeterminadas
      const defaultCats = obtenerCategoriasDefault();
      setCategorias(defaultCats);
      await guardarCategorias(defaultCats);
    } else {
      // Mezclar categorías guardadas con las predeterminadas actualizadas
      const defaultCats = obtenerCategoriasDefault();
      const personalizadas = categoriasGuardadas.filter(c => c.esPersonalizada);

      // Actualizar las predeterminadas con los emojis y nombres del tema actual
      // Siempre usar emoji y nombre del tema actual, pero preservar otros cambios
      const predeterminadasActualizadas = defaultCats.map(defaultCat => {
        const guardada = categoriasGuardadas.find(c => c.id === defaultCat.id && !c.esPersonalizada);
        if (guardada) {
          // Preservar datos guardados pero actualizar emoji y nombre del tema
          return { ...guardada, emoji: defaultCat.emoji, nombre: defaultCat.nombre };
        }
        return defaultCat;
      });

      setCategorias([...predeterminadasActualizadas, ...personalizadas]);
    }

    setCargado(true);
  };

  const agregarCategoria = (categoria: Omit<Categoria, 'id' | 'esPersonalizada'>) => {
    const nuevaCategoria: Categoria = {
      id: generarId(),
      esPersonalizada: true,
      ...categoria,
    };

    const nuevasCategorias = [...categorias, nuevaCategoria];
    setCategorias(nuevasCategorias);
    guardarCategorias(nuevasCategorias);
  };

  const editarCategoria = (id: string, categoriaActualizada: Partial<Omit<Categoria, 'id' | 'esPersonalizada'>>) => {
    const nuevasCategorias = categorias.map(cat =>
      cat.id === id ? { ...cat, ...categoriaActualizada } : cat
    );
    setCategorias(nuevasCategorias);
    guardarCategorias(nuevasCategorias);
  };

  const eliminarCategoria = (id: string) => {
    // Solo permitir eliminar categorías personalizadas
    const categoria = categorias.find(c => c.id === id);
    if (categoria && categoria.esPersonalizada) {
      const nuevasCategorias = categorias.filter(cat => cat.id !== id);
      setCategorias(nuevasCategorias);
      guardarCategorias(nuevasCategorias);
    }
  };

  const obtenerCategoriaPorId = (id: string): Categoria | undefined => {
    return categorias.find(cat => cat.id === id);
  };

  return (
    <CategoriasContext.Provider
      value={{
        categorias,
        agregarCategoria,
        editarCategoria,
        eliminarCategoria,
        obtenerCategoriaPorId,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias debe usarse dentro de CategoriasProvider');
  }
  return context;
};
