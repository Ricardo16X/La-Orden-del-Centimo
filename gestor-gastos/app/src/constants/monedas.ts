/**
 * Definiciones de monedas soportadas
 */

export interface MonedaDefinicion {
  codigo: string;
  nombre: string;
  simbolo: string;
  emoji: string;
  pais?: string;
}

export const MONEDAS_DISPONIBLES: MonedaDefinicion[] = [
  {
    codigo: 'GTQ',
    nombre: 'Quetzal',
    simbolo: 'Q',
    emoji: '🇬🇹',
    pais: 'Guatemala',
  },
  {
    codigo: 'USD',
    nombre: 'Dólar',
    simbolo: '$',
    emoji: '🇺🇸',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'MXN',
    nombre: 'Peso',
    simbolo: '$',
    emoji: '🇲🇽',
    pais: 'México',
  },
  {
    codigo: 'EUR',
    nombre: 'Euro',
    simbolo: '€',
    emoji: '🇪🇺',
    pais: 'Unión Europea',
  },
  {
    codigo: 'COP',
    nombre: 'Peso',
    simbolo: '$',
    emoji: '🇨🇴',
    pais: 'Colombia',
  },
  {
    codigo: 'ARS',
    nombre: 'Peso',
    simbolo: '$',
    emoji: '🇦🇷',
    pais: 'Argentina',
  },
  {
    codigo: 'CLP',
    nombre: 'Peso',
    simbolo: '$',
    emoji: '🇨🇱',
    pais: 'Chile',
  },
  {
    codigo: 'PEN',
    nombre: 'Sol',
    simbolo: 'S/',
    emoji: '🇵🇪',
    pais: 'Perú',
  },
  {
    codigo: 'BRL',
    nombre: 'Real',
    simbolo: 'R$',
    emoji: '🇧🇷',
    pais: 'Brasil',
  },
  {
    codigo: 'CRC',
    nombre: 'Colón',
    simbolo: '₡',
    emoji: '🇨🇷',
    pais: 'Costa Rica',
  },
];

export const obtenerMonedaPorCodigo = (codigo: string): MonedaDefinicion | undefined => {
  return MONEDAS_DISPONIBLES.find(m => m.codigo === codigo);
};

export const formatearMoneda = (monto: number, codigo: string): string => {
  const moneda = obtenerMonedaPorCodigo(codigo);
  if (!moneda) return `${monto.toFixed(2)}`;
  return `${moneda.simbolo}${monto.toFixed(2)}`;
};
