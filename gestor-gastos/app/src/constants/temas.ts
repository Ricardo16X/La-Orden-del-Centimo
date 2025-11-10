export interface Tema {
  id: string;
  nombre: string;
  emoji: string;
  colores: {
    fondo: string;
    fondoSecundario: string;
    primario: string;
    primarioClaro: string;
    acento: string;
    bordes: string;
    texto: string;
    textoSecundario: string;
  };
  companero: {
    avatar: string;
    nombre: string;
  };
  moneda: string;
  categorias: {
    comida: string;
    transporte: string;
    equipo: string;
    pociones: string;
    vivienda: string;
    entrenamiento: string;
    otros: string;
  };
}

export const TEMAS: Tema[] = [
  {
    id: 'medieval',
    nombre: 'Medieval',
    emoji: '⚔️',
    colores: {
      fondo: '#2c2416',
      fondoSecundario: '#3d2f1f',
      primario: '#d4af37',
      primarioClaro: '#ffd700',
      acento: '#8b4513',
      bordes: '#8b7355',
      texto: '#f5deb3',
      textoSecundario: '#c9b08a',
    },
    companero: {
      avatar: '🐉',
      nombre: 'Dragón Guardián',
    },
    moneda: 'Septims',
    categorias: {
      comida: 'Comida y Bebida',
      transporte: 'Transporte',
      equipo: 'Equipo y Armamento',
      pociones: 'Pociones y Alquimia',
      vivienda: 'Vivienda',
      entrenamiento: 'Entrenamiento',
      otros: 'Comercio General',
    },
  },
  {
    id: 'kawaii',
    nombre: 'Kawaii',
    emoji: '🌸',
    colores: {
      fondo: '#fff0f5',
      fondoSecundario: '#ffe4e1',
      primario: '#ff69b4',
      primarioClaro: '#ffb6c1',
      acento: '#ff1493',
      bordes: '#ffc0cb',
      texto: '#8b4789',
      textoSecundario: '#d8bfd8',
    },
    companero: {
      avatar: '🐱',
      nombre: 'Neko-chan',
    },
    moneda: 'Moneditas',
    categorias: {
      comida: 'Comidita Rica',
      transporte: 'Viajecitos',
      equipo: 'Cositas Lindas',
      pociones: 'Bebidas Mágicas',
      vivienda: 'Mi Casita',
      entrenamiento: 'Gym Time',
      otros: 'Compras Varias',
    },
  },
];

export const obtenerTema = (id: string): Tema => {
  return TEMAS.find(t => t.id === id) || TEMAS[0];
};