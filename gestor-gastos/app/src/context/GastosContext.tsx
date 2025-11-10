import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gasto } from '../types';
import { cargarGastos, guardarGastos } from '../services/storage';

interface GastosContextType {
  gastos: Gasto[];
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'fecha'>) => void;
  editarGasto: (id: string, gastoActualizado: Partial<Omit<Gasto, 'id'>>) => void;
  eliminarGasto: (id: string) => void;
  totalGastado: number;
  ultimoGastoAgregado: Gasto | null;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export const GastosProvider = ({ children }: { children: ReactNode }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ultimoGastoAgregado, setUltimoGastoAgregado] = useState<Gasto | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    console.log('🔵 GastosProvider montado - cargando datos...');
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cargado && gastos.length >= 0) {
      console.log('💾 Guardando gastos:', gastos.length);
      guardarGastos(gastos);
    }
  }, [gastos, cargado]);

  const cargarDatos = async () => {
    console.log('📂 Cargando gastos desde storage...');
    const gastosGuardados = await cargarGastos();
    console.log('✅ Gastos cargados:', gastosGuardados.length);
    setGastos(gastosGuardados);
    setCargado(true);
  };

  const agregarGasto = (gasto: Omit<Gasto, 'id' | 'fecha'>) => {
    const nuevoGasto: Gasto = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString(),
      ...gasto,
    };
    console.log('➕ Agregando gasto:', nuevoGasto);
    setGastos(prev => {
      const nuevos = [nuevoGasto, ...prev];
      console.log('📊 Total gastos ahora:', nuevos.length);
      return nuevos;
    });
    setUltimoGastoAgregado(nuevoGasto);
  };

  const editarGasto = async (id: string, gastoActualizado: Partial<Omit<Gasto, 'id'>>) => {
    console.log('✏️ Editando gasto:', id);
    const nuevosGastos = gastos.map(gasto => 
      gasto.id === id 
        ? { ...gasto, ...gastoActualizado }
        : gasto
    );
    setGastos(nuevosGastos);
    await guardarGastos(nuevosGastos);
  };

  const eliminarGasto = async (id: string) => {
    console.log('🗑️ Eliminando gasto:', id);
    const nuevosGastos = gastos.filter(gasto => gasto.id !== id);
    setGastos(nuevosGastos);
    await guardarGastos(nuevosGastos);
  };

  const totalGastado = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  console.log('🔄 Context render - Gastos:', gastos.length, 'Total:', totalGastado);

  return (
    <GastosContext.Provider
      value={{
        gastos,
        agregarGasto,
        editarGasto,
        eliminarGasto,
        totalGastado,
        ultimoGastoAgregado,
      }}
    >
      {children}
    </GastosContext.Provider>
  );
};

export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe usarse dentro de GastosProvider');
  }
  return context;
};