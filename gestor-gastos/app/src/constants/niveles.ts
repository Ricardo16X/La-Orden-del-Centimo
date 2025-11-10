export interface Nivel {
  nivel: number;
  xpRequerido: number;
  titulo: string;
  descripcion: string;
}

export const NIVELES: Nivel[] = [
  { nivel: 1, xpRequerido: 0, titulo: "Novato", descripcion: "Apenas comienzas tu viaje" },
  { nivel: 2, xpRequerido: 50, titulo: "Aprendiz", descripcion: "Empiezas a entender el flujo del oro" },
  { nivel: 3, xpRequerido: 120, titulo: "Comerciante", descripcion: "El oro fluye por tus manos" },
  { nivel: 4, xpRequerido: 220, titulo: "Mercader", descripcion: "Conoces el valor de cada septim" },
  { nivel: 5, xpRequerido: 350, titulo: "Tesorero", descripcion: "Guardián de la fortuna" },
  { nivel: 6, xpRequerido: 520, titulo: "Maestro de Cuentas", descripcion: "Los números te obedecen" },
  { nivel: 7, xpRequerido: 730, titulo: "Señor de la Moneda", descripcion: "El oro te reconoce como su amo" },
  { nivel: 8, xpRequerido: 1000, titulo: "Guardián del Tesoro", descripcion: "Proteges la riqueza con sabiduría" },
  { nivel: 9, xpRequerido: 1350, titulo: "Archimago Financiero", descripcion: "La magia del ahorro te pertenece" },
  { nivel: 10, xpRequerido: 1800, titulo: "Jarl de las Finanzas", descripcion: "Gobiernas tu economía como un rey" },
  { nivel: 11, xpRequerido: 2350, titulo: "Alto Rey del Oro", descripcion: "Tu poder sobre el oro es supremo" },
  { nivel: 12, xpRequerido: 3000, titulo: "Dragonborn Financiero", descripcion: "Naciste para dominar el oro" },
];

export const XP_POR_GASTO = 10;
export const XP_BONUS_CATEGORIA_NUEVA = 5;
export const XP_BONUS_RACHA_DIARIA = 15;


import { DatosJugador } from '../types';
export const calcularNivel = (xpTotal: number): DatosJugador => {
  let nivelActual = NIVELES[0];
  let siguienteNivel = NIVELES[1];

  for (let i = 0; i < NIVELES.length; i++) {
    if (xpTotal >= NIVELES[i].xpRequerido) {
      nivelActual = NIVELES[i];
      siguienteNivel = NIVELES[i + 1] || NIVELES[i]; // Si está en máximo nivel
    } else {
      break;
    }
  }

  return {
    nivel: nivelActual.nivel,
    xp: xpTotal,
    xpParaSiguienteNivel: siguienteNivel.xpRequerido,
    titulo: nivelActual.titulo,
  };
};

export const obtenerNivel = (nivel: number): Nivel => {
  return NIVELES.find(n => n.nivel === nivel) || NIVELES[0];
};