/**
 * Tipos de transacciones
 */
export type TipoTransaccion = 'ingreso' | 'gasto';

/**
 * Tipos de frases del compañero
 */
export type TipoFrase = 'bienvenida' | 'gasto_agregado' | 'gasto_alto' | 'gasto_bajo' | 'motivacional' | 'consejo';

/**
 * Interfaz para un gasto/ingreso
 */
export interface Gasto {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  tipo: TipoTransaccion;
}

/**
 * Tipo para crear un nuevo gasto (sin id ni fecha, tipo opcional por defecto 'gasto')
 */
export type NuevoGasto = Omit<Gasto, 'id' | 'fecha' | 'tipo'> & { tipo?: TipoTransaccion };

/**
 * Tipo para actualizar un gasto (campos opcionales)
 */
export type ActualizacionGasto = Partial<Omit<Gasto, 'id'>>;

/**
 * Interfaz para una categoría
 */
export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
}

/**
 * Interfaz para los datos del jugador (sistema de XP)
 */
export interface DatosJugador {
  nivel: number;
  xp: number;
  xpParaSiguienteNivel: number;
  titulo: string;
}

/**
 * Interfaz para un nivel
 */
export interface Nivel {
  nivel: number;
  xpRequerido: number;
  titulo: string;
  descripcion: string;
}

/**
 * Interfaz para colores del tema
 */
export interface ColoresTema {
  fondo: string;
  fondoSecundario: string;
  primario: string;
  primarioClaro: string;
  acento: string;
  bordes: string;
  texto: string;
  textoSecundario: string;
}

/**
 * Interfaz para el compañero
 */
export interface Companero {
  avatar: string;
  nombre: string;
}

/**
 * Interfaz para categorías personalizadas por tema
 */
export interface CategoriasTema {
  comida: string;
  transporte: string;
  equipo: string;
  pociones: string;
  vivienda: string;
  entrenamiento: string;
  otros: string;
  [key: string]: string;
}

/**
 * Interfaz para un tema completo
 */
export interface Tema {
  id: string;
  nombre: string;
  emoji: string;
  colores: ColoresTema;
  companero: Companero;
  moneda: string;
  categorias: CategoriasTema;
}

/**
 * Interfaz para una frase del compañero
 */
export interface FraseCompanero {
  tipo: TipoFrase;
  texto: string;
}