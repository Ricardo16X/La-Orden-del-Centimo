/**
 * Context para gestión de monedas
 * Maneja la configuración de monedas del usuario y conversiones
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfiguracionMoneda } from '../types';
import { STORAGE_KEYS } from '../utils/storage-keys';
import { MONEDAS_DISPONIBLES, obtenerMonedaPorCodigo } from '../constants/monedas';

interface MonedasContextType {
  monedas: ConfiguracionMoneda[];
  monedaBase: ConfiguracionMoneda | null;
  agregarMoneda: (codigo: string, tipoCambio: number) => Promise<void>;
  eliminarMoneda: (codigo: string) => Promise<void>;
  actualizarTipoCambio: (codigo: string, nuevoTipoCambio: number) => Promise<void>;
  cambiarMonedaBase: (codigo: string) => Promise<void>;
  convertirAMonedaBase: (monto: number, codigoMoneda: string) => number;
  obtenerMoneda: (codigo: string) => ConfiguracionMoneda | undefined;
}

const MonedasContext = createContext<MonedasContextType | undefined>(undefined);

export const MonedasProvider = ({ children }: { children: ReactNode }) => {
  const [monedas, setMonedas] = useState<ConfiguracionMoneda[]>([]);
  const [monedaBase, setMonedaBase] = useState<ConfiguracionMoneda | null>(null);

  useEffect(() => {
    cargarMonedas();
  }, []);

  useEffect(() => {
    // Actualizar monedaBase cuando cambien las monedas
    const base = monedas.find(m => m.esMonedaBase) || null;
    setMonedaBase(base);
  }, [monedas]);

  const cargarMonedas = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MONEDAS);
      if (data) {
        const monedasGuardadas = JSON.parse(data) as ConfiguracionMoneda[];
        setMonedas(monedasGuardadas);
      } else {
        // Primera vez: inicializar con GTQ como moneda base
        const monedaInicial: ConfiguracionMoneda = {
          codigo: 'GTQ',
          nombre: 'Quetzal',
          simbolo: 'Q',
          tipoCambio: 1.0,
          esMonedaBase: true,
        };
        setMonedas([monedaInicial]);
        await guardarMonedas([monedaInicial]);
      }
    } catch (error) {
      console.error('Error al cargar monedas:', error);
    }
  };

  const guardarMonedas = async (nuevasMonedas: ConfiguracionMoneda[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MONEDAS, JSON.stringify(nuevasMonedas));
      setMonedas(nuevasMonedas);
    } catch (error) {
      console.error('Error al guardar monedas:', error);
    }
  };

  const agregarMoneda = async (codigo: string, tipoCambio: number) => {
    // Validar que no exista ya
    if (monedas.find(m => m.codigo === codigo)) {
      throw new Error('Esta moneda ya está agregada');
    }

    // Validar límite de 5 monedas
    if (monedas.length >= 5) {
      throw new Error('Solo puedes tener hasta 5 monedas configuradas');
    }

    // Obtener info de la moneda
    const monedaInfo = obtenerMonedaPorCodigo(codigo);
    if (!monedaInfo) {
      throw new Error('Moneda no encontrada');
    }

    const nuevaMoneda: ConfiguracionMoneda = {
      codigo: monedaInfo.codigo,
      nombre: monedaInfo.nombre,
      simbolo: monedaInfo.simbolo,
      tipoCambio,
      esMonedaBase: false,
    };

    await guardarMonedas([...monedas, nuevaMoneda]);
  };

  const eliminarMoneda = async (codigo: string) => {
    // No permitir eliminar la moneda base
    const moneda = monedas.find(m => m.codigo === codigo);
    if (moneda?.esMonedaBase) {
      throw new Error('No puedes eliminar la moneda base');
    }

    const nuevasMonedas = monedas.filter(m => m.codigo !== codigo);
    await guardarMonedas(nuevasMonedas);
  };

  const actualizarTipoCambio = async (codigo: string, nuevoTipoCambio: number) => {
    // No permitir cambiar el tipo de cambio de la moneda base (siempre 1.0)
    const moneda = monedas.find(m => m.codigo === codigo);
    if (moneda?.esMonedaBase) {
      throw new Error('La moneda base siempre tiene tipo de cambio 1.0');
    }

    const nuevasMonedas = monedas.map(m =>
      m.codigo === codigo ? { ...m, tipoCambio: nuevoTipoCambio } : m
    );
    await guardarMonedas(nuevasMonedas);
  };

  const cambiarMonedaBase = async (codigo: string) => {
    // Verificar que la moneda exista en la configuración
    const nuevaBase = monedas.find(m => m.codigo === codigo);
    if (!nuevaBase) {
      throw new Error('Moneda no encontrada en tu configuración');
    }

    // Actualizar: quitar esMonedaBase de la anterior y poner en la nueva
    // También ajustar los tipos de cambio relativos
    const tipoCambioAnteriorBase = nuevaBase.tipoCambio;

    const nuevasMonedas = monedas.map(m => {
      if (m.codigo === codigo) {
        return { ...m, esMonedaBase: true, tipoCambio: 1.0 };
      } else {
        // Ajustar tipo de cambio relativo a la nueva base
        const nuevoTipoCambio = m.tipoCambio / tipoCambioAnteriorBase;
        return { ...m, esMonedaBase: false, tipoCambio: nuevoTipoCambio };
      }
    });

    await guardarMonedas(nuevasMonedas);
  };

  const convertirAMonedaBase = (monto: number, codigoMoneda: string): number => {
    // Si es la moneda base, no convertir
    if (monedaBase && codigoMoneda === monedaBase.codigo) {
      return monto;
    }

    // Buscar la moneda
    const moneda = monedas.find(m => m.codigo === codigoMoneda);
    if (!moneda) {
      // Si no existe, asumir que es la moneda base
      return monto;
    }

    // Convertir: monto * tipoCambio
    return monto * moneda.tipoCambio;
  };

  const obtenerMoneda = (codigo: string): ConfiguracionMoneda | undefined => {
    return monedas.find(m => m.codigo === codigo);
  };

  return (
    <MonedasContext.Provider
      value={{
        monedas,
        monedaBase,
        agregarMoneda,
        eliminarMoneda,
        actualizarTipoCambio,
        cambiarMonedaBase,
        convertirAMonedaBase,
        obtenerMoneda,
      }}
    >
      {children}
    </MonedasContext.Provider>
  );
};

export const useMonedas = () => {
  const context = useContext(MonedasContext);
  if (!context) {
    throw new Error('useMonedas debe usarse dentro de MonedasProvider');
  }
  return context;
};
