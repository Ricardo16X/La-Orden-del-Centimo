/**
 * Tipos de transacciones
 */
export type TipoTransaccion = 'ingreso' | 'gasto';

/**
 * Tipos de frases del compañero
 */
export type TipoFrase = 'bienvenida' | 'gasto_agregado' | 'gasto_alto' | 'gasto_bajo' | 'ingreso_agregado' | 'ingreso_alto' | 'ingreso_bajo' | 'motivacional' | 'consejo';

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
  esPersonalizada?: boolean; // true si fue creada por el usuario
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

/**
 * Interfaz para un presupuesto por categoría
 */
export interface Presupuesto {
  id: string;
  categoriaId: string;
  monto: number;
  periodo: 'semanal' | 'mensual' | 'anual';
  alertaEn: number; // Porcentaje para alertar (ej: 80 = alerta al 80%)
}

/**
 * Tipo para crear un nuevo presupuesto (sin id)
 */
export type NuevoPresupuesto = Omit<Presupuesto, 'id'>;

/**
 * Tipo para estadísticas de presupuesto
 */
export interface EstadisticasPresupuesto {
  categoriaId: string;
  presupuesto: number;
  gastado: number;
  porcentaje: number;
  excedido: boolean;
  debeAlertar: boolean;
}

/**
 * Interfaz para una tarjeta de crédito
 */
export interface TarjetaCredito {
  id: string;
  nombre: string;
  banco: string;
  ultimosCuatroDigitos: string;
  diaCorte: number; // 1-31
  diaPago: number; // 1-31
  color: string;
}

/**
 * Tipo para crear una nueva tarjeta (sin id)
 */
export type NuevaTarjeta = Omit<TarjetaCredito, 'id'>;

/**
 * Tipo para el estado de una tarjeta
 */
export type EstadoTarjeta = 'seguro' | 'cerca_corte' | 'pendiente_pago';

/**
 * Interfaz para información de estado de tarjeta
 */
export interface InfoEstadoTarjeta {
  tarjetaId: string;
  estado: EstadoTarjeta;
  diasParaCorte: number;
  diasParaPago: number;
  mensaje: string;
  color: string;
}

/**
 * Tipo de frecuencia de recordatorio
 */
export type FrecuenciaRecordatorio = 'diario' | 'semanal' | 'mensual';

/**
 * Interfaz para un recordatorio
 */
export interface Recordatorio {
  id: string;
  titulo: string;
  mensaje: string;
  hora: string; // Formato HH:MM
  frecuencia: FrecuenciaRecordatorio;
  activo: boolean;
  notificationId?: string;
  diaSemana?: number; // 1-7 (1=Domingo, 2=Lunes, ..., 7=Sábado) - Solo para frecuencia semanal
  diaMes?: number; // 1-31 - Solo para frecuencia mensual
}

/**
 * Tipo para crear un nuevo recordatorio (sin id)
 */
export type NuevoRecordatorio = Omit<Recordatorio, 'id'>;

/**
 * Estado de una meta de ahorro
 */
export type EstadoMeta = 'en_progreso' | 'completada' | 'vencida';

/**
 * Interfaz para una meta de ahorro
 */
export interface Meta {
  id: string;
  nombre: string;
  descripcion: string;
  montoObjetivo: number;
  montoActual: number;
  fechaInicio: string; // ISO format
  fechaLimite: string; // ISO format
  icono: string; // Emoji
  color: string;
  estado: EstadoMeta;
}

/**
 * Tipo para crear una nueva meta (sin id, montoActual y estado)
 */
export type NuevaMeta = Omit<Meta, 'id' | 'montoActual' | 'estado'>;

/**
 * Estadísticas de una meta
 */
export interface EstadisticasMeta {
  porcentajeCompletado: number;
  montoFaltante: number;
  diasRestantes: number;
  ahorroRequeridoDiario: number;
  ahorroRequeridoSemanal: number;
  ahorroRequeridoMensual: number;
  enTiempo: boolean;
}

/**
 * Proyección de gastos futuros
 */
export interface ProyeccionGastos {
  categoriaId: string;
  promedioDiario: number;
  promedioSemanal: number;
  promedioMensual: number;
  tendencia: 'ascendente' | 'descendente' | 'estable';
  proyeccionProximoMes: number;
  confianza: number; // 0-100
}

/**
 * Análisis de comportamiento de gasto
 */
export interface AnalisisComportamiento {
  categoriaId: string;
  gastosAnormales: Gasto[];
  diasConMasGastos: string[]; // Días de la semana
  horariosPreferidos: number[]; // Horas del día
  patronDetectado: string;
}

/**
 * Balance financiero global
 */
export interface Balance {
  totalIngresos: number;
  totalGastos: number;
  totalReservado: number; // Dinero en metas
  balanceTotal: number; // ingresos - gastos
  balanceDisponible: number; // balanceTotal - reservado
}

export interface ResumenBalance {
  balance: Balance;
  tendencia: 'positiva' | 'negativa' | 'neutral';
  cambioMensual: number; // % de cambio respecto al mes anterior
}