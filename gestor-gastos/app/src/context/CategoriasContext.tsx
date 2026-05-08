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
  obtenerCategoriasPorTipo: (tipo: 'gasto' | 'ingreso') => Categoria[];
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export const CategoriasProvider = ({ children }: { children: ReactNode }) => {
  const { tema } = useTema();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargado, setCargado] = useState(false);

  const obtenerCategoriasDefault = (): Categoria[] => [
    // ── Gastos ──────────────────────────────────────────────────────────
    { id: 'comida',       tipo: 'gasto',   nombre: 'Alimentación',   emoji: tema.categorias.comida,        color: '#ff6b6b', esPersonalizada: false },
    { id: 'transporte',   tipo: 'gasto',   nombre: 'Transporte',     emoji: tema.categorias.transporte,    color: '#4ecdc4', esPersonalizada: false },
    { id: 'equipo',       tipo: 'gasto',   nombre: 'Compras',        emoji: tema.categorias.equipo,        color: '#45b7d1', esPersonalizada: false },
    { id: 'pociones',     tipo: 'gasto',   nombre: 'Café y Bebidas', emoji: tema.categorias.pociones,      color: '#96ceb4', esPersonalizada: false },
    { id: 'vivienda',     tipo: 'gasto',   nombre: 'Hogar',          emoji: tema.categorias.vivienda,      color: '#ffeaa7', esPersonalizada: false },
    { id: 'entrenamiento',tipo: 'gasto',   nombre: 'Salud y Fitness',emoji: tema.categorias.entrenamiento, color: '#dfe6e9', esPersonalizada: false },
    { id: 'ahorro_metas', tipo: 'gasto',   nombre: 'Ahorro - Metas', emoji: '🎯',                          color: '#10b981', esPersonalizada: false },
    { id: 'transferencia',tipo: 'ambos',   nombre: 'Transferencia',  emoji: '💱',                          color: '#6366f1', esPersonalizada: false },
    { id: 'otros',        tipo: 'gasto',   nombre: 'Otros gastos',   emoji: tema.categorias.otros,         color: '#b2bec3', esPersonalizada: false },
    // ── Ingresos ────────────────────────────────────────────────────────
    { id: 'ing_salario',     tipo: 'ingreso', nombre: 'Salario',     emoji: '💼', color: '#10b981', esPersonalizada: false },
    { id: 'ing_freelance',   tipo: 'ingreso', nombre: 'Freelance',   emoji: '💻', color: '#6366f1', esPersonalizada: false },
    { id: 'ing_alquiler',    tipo: 'ingreso', nombre: 'Alquiler',    emoji: '🏠', color: '#f59e0b', esPersonalizada: false },
    { id: 'ing_bono',        tipo: 'ingreso', nombre: 'Bono',        emoji: '🎁', color: '#ec4899', esPersonalizada: false },
    { id: 'ing_ventas',      tipo: 'ingreso', nombre: 'Ventas',      emoji: '🛍️', color: '#3b82f6', esPersonalizada: false },
    { id: 'ing_inversiones', tipo: 'ingreso', nombre: 'Inversiones', emoji: '📈', color: '#8b5cf6', esPersonalizada: false },
    { id: 'ing_otros',       tipo: 'ingreso', nombre: 'Otros ingresos', emoji: '📦', color: '#94a3b8', esPersonalizada: false },
  ];

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (!cargado) return;
    setCategorias(prev => {
      const defaults = obtenerCategoriasDefault();
      return prev.map(cat => {
        if (cat.esPersonalizada) return cat;
        const def = defaults.find(d => d.id === cat.id);
        return def ? { ...cat, emoji: def.emoji, nombre: def.nombre } : cat;
      });
    });
  }, [tema.id, cargado]);

  const cargarDatos = async () => {
    const guardadas = await cargarCategorias();
    const defaults = obtenerCategoriasDefault();

    const formatoViejo = guardadas.length > 0 && guardadas.some(c => !c.tipo);
    if (guardadas.length === 0 || formatoViejo) {
      // Salvage custom categories from old format, defaulting tipo to 'gasto'
      const personalizadasSalvadas = formatoViejo
        ? guardadas.filter(c => c.esPersonalizada).map(c => ({ ...c, tipo: (c.tipo ?? 'gasto') as Categoria['tipo'] }))
        : [];
      const resultado = [...defaults, ...personalizadasSalvadas];
      setCategorias(resultado);
      await guardarCategorias(resultado);
      setCargado(true);
      return;
    }

    // Añadir defaults nuevos que no existan aún (ej: categorías de ingreso añadidas en update)
    const idsGuardadas = new Set(guardadas.map(c => c.id));
    const defaultsNuevos = defaults.filter(d => !idsGuardadas.has(d.id));
    const personalizadas = guardadas.filter(c => c.esPersonalizada);
    const predeterminadasActualizadas = defaults.map(def => {
      const guardada = guardadas.find(c => c.id === def.id && !c.esPersonalizada);
      return guardada ? { ...guardada, emoji: def.emoji, nombre: def.nombre, tipo: def.tipo } : def;
    });

    const resultado = [...predeterminadasActualizadas, ...defaultsNuevos, ...personalizadas];
    setCategorias(resultado);
    setCargado(true);
  };

  const agregarCategoria = (categoria: Omit<Categoria, 'id' | 'esPersonalizada'>) => {
    const nueva: Categoria = { id: generarId(), esPersonalizada: true, ...categoria };
    const nuevas = [...categorias, nueva];
    setCategorias(nuevas);
    guardarCategorias(nuevas);
  };

  const editarCategoria = (id: string, datos: Partial<Omit<Categoria, 'id' | 'esPersonalizada'>>) => {
    const nuevas = categorias.map(c => c.id === id ? { ...c, ...datos } : c);
    setCategorias(nuevas);
    guardarCategorias(nuevas);
  };

  const eliminarCategoria = (id: string) => {
    const cat = categorias.find(c => c.id === id);
    if (cat?.esPersonalizada) {
      const nuevas = categorias.filter(c => c.id !== id);
      setCategorias(nuevas);
      guardarCategorias(nuevas);
    }
  };

  const obtenerCategoriaPorId = (id: string) => categorias.find(c => c.id === id);

  const obtenerCategoriasPorTipo = (tipo: 'gasto' | 'ingreso'): Categoria[] =>
    categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos');

  return (
    <CategoriasContext.Provider value={{
      categorias,
      agregarCategoria,
      editarCategoria,
      eliminarCategoria,
      obtenerCategoriaPorId,
      obtenerCategoriasPorTipo,
    }}>
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) throw new Error('useCategorias debe usarse dentro de CategoriasProvider');
  return context;
};
