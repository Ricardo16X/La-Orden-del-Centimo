/**
 * Tipos de transacciones
 */
export type TipoTransaccion = 'ingreso' | 'gasto';

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
  // Campos para multi-moneda
  moneda?: string; // Código de moneda (GTQ, USD, etc.). Si no existe, se asume moneda base
  tipoCambio?: number; // Tipo de cambio usado al momento de registrar
  montoEnMonedaBase?: number; // Monto convertido a la moneda base del usuario
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
  moneda: string;
  categorias: CategoriasTema;
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

/**
 * Estado de una cuota sin intereses
 */
export type EstadoCuota = 'activa' | 'completada' | 'cancelada';

/**
 * Interfaz para una compra a cuotas sin intereses
 */
export interface CuotaSinIntereses {
  id: string;
  tarjetaId: string;
  descripcion: string;
  montoTotal: number;
  cantidadCuotas: number;
  cuotasPagadas: number;
  montoPorCuota: number;
  fechaCompra: string; // ISO format
  fechaProximaCuota: string; // ISO format - se actualiza automáticamente
  comercio?: string; // Opcional: dónde se realizó la compra
  categoria?: string; // Opcional: tipo de compra (Electrónica, Hogar, etc.)
  estado: EstadoCuota;
}

/**
 * Tipo para crear una nueva cuota (sin id, montoPorCuota, fechaProximaCuota y estado)
 * cuotasPagadas es opcional para permitir agregar compras con progreso existente
 * montoPorCuota se calcula automáticamente
 */
export type NuevaCuota = Omit<CuotaSinIntereses, 'id' | 'montoPorCuota' | 'fechaProximaCuota' | 'estado'> & {
  cuotasPagadas?: number; // Opcional: por defecto será 0
};

/**
 * Estadísticas de cuotas para una tarjeta
 */
export interface EstadisticasCuotasTarjeta {
  tarjetaId: string;
  cuotasActivas: number;
  totalMensual: number; // Total a pagar este mes
  totalPendiente: number; // Total que falta pagar
  cuotas: CuotaSinIntereses[];
}

/**
 * Proyección de cuotas para los próximos meses
 */
export interface ProyeccionCuotas {
  mes: string; // "Enero 2026"
  totalCuotas: number;
  cuotasQueFinal: CuotaSinIntereses[]; // Cuotas que terminan este mes
}

/**
 * Configuración de una moneda del usuario
 */
export interface ConfiguracionMoneda {
  codigo: string; // 'GTQ', 'USD', etc.
  simbolo: string; // 'Q', '$', etc.
  nombre: string; // 'Quetzal', 'Dólar', etc.
  tipoCambio: number; // 1.0 para moneda base, 7.80 para USD/GTQ, etc.
  esMonedaBase: boolean; // Solo una moneda puede ser base
}

/**
 * Tipo para crear/editar configuración de moneda
 */
export type NuevaConfiguracionMoneda = Omit<ConfiguracionMoneda, 'esMonedaBase'>;