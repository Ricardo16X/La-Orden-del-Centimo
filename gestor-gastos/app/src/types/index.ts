export interface Gasto {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
}

// NUEVO: Sistema de XP
export interface DatosJugador {
  nivel: number;
  xp: number;
  xpParaSiguienteNivel: number;
  titulo: string;
}