/**
 * Sistema de logros y recompensas
 */

export type TipoLogro =
  | 'primera_vez'      // Primera acción
  | 'racha'            // Días consecutivos
  | 'meta'             // Meta alcanzada
  | 'ahorro'           // Ahorro logrado
  | 'presupuesto'      // Presupuesto cumplido
  | 'nivel'            // Nivel alcanzado
  | 'maestria';        // Dominio completo

export type CategoriaLogro =
  | 'registro'         // Registro de gastos/ingresos
  | 'ahorro'           // Ahorro y metas
  | 'presupuesto'      // Control de presupuesto
  | 'disciplina'       // Constancia
  | 'crecimiento';     // Nivel y XP

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  tipo: TipoLogro;
  categoria: CategoriaLogro;
  xpRecompensa: number;
  desbloqueado: boolean;
  fechaDesbloqueo?: string;
  progreso?: number;      // 0-100
  meta?: number;          // Valor objetivo
  valorActual?: number;   // Valor actual del progreso
}

export interface LogroDesbloqueado {
  logro: Logro;
  timestamp: string;
}

export const LOGROS_DISPONIBLES: Omit<Logro, 'desbloqueado' | 'fechaDesbloqueo' | 'progreso' | 'valorActual'>[] = [
  // 🌟 REGISTRO - Primeros pasos
  {
    id: 'primer_gasto',
    nombre: '¡Primer Paso!',
    descripcion: 'Registra tu primer gasto',
    icono: '🌱',
    tipo: 'primera_vez',
    categoria: 'registro',
    xpRecompensa: 20,
  },
  {
    id: 'primer_ingreso',
    nombre: 'Flujo de Oro',
    descripcion: 'Registra tu primer ingreso',
    icono: '💰',
    tipo: 'primera_vez',
    categoria: 'registro',
    xpRecompensa: 20,
  },
  {
    id: 'gastos_10',
    nombre: 'Observador',
    descripcion: 'Registra 10 gastos',
    icono: '👁️',
    tipo: 'meta',
    categoria: 'registro',
    xpRecompensa: 30,
    meta: 10,
  },
  {
    id: 'gastos_50',
    nombre: 'Cronista',
    descripcion: 'Registra 50 gastos',
    icono: '📜',
    tipo: 'meta',
    categoria: 'registro',
    xpRecompensa: 50,
    meta: 50,
  },
  {
    id: 'gastos_100',
    nombre: 'Maestro Escriba',
    descripcion: 'Registra 100 gastos',
    icono: '🏆',
    tipo: 'meta',
    categoria: 'registro',
    xpRecompensa: 100,
    meta: 100,
  },

  // 💪 DISCIPLINA - Constancia
  {
    id: 'racha_3',
    nombre: 'Constante',
    descripcion: 'Registra gastos 3 días seguidos',
    icono: '🔥',
    tipo: 'racha',
    categoria: 'disciplina',
    xpRecompensa: 40,
    meta: 3,
  },
  {
    id: 'racha_7',
    nombre: 'Dedicado',
    descripcion: 'Registra gastos 7 días seguidos',
    icono: '⭐',
    tipo: 'racha',
    categoria: 'disciplina',
    xpRecompensa: 70,
    meta: 7,
  },
  {
    id: 'racha_30',
    nombre: 'Disciplinado',
    descripcion: 'Registra gastos 30 días seguidos',
    icono: '🌟',
    tipo: 'racha',
    categoria: 'disciplina',
    xpRecompensa: 150,
    meta: 30,
  },

  // 🎯 METAS - Ahorro
  {
    id: 'primera_meta',
    nombre: 'Visionario',
    descripcion: 'Crea tu primera meta de ahorro',
    icono: '🎯',
    tipo: 'primera_vez',
    categoria: 'ahorro',
    xpRecompensa: 25,
  },
  {
    id: 'meta_50',
    nombre: 'En Camino',
    descripcion: 'Alcanza el 50% de una meta',
    icono: '🚀',
    tipo: 'meta',
    categoria: 'ahorro',
    xpRecompensa: 40,
    meta: 50,
  },
  {
    id: 'meta_completada',
    nombre: '¡Victoria!',
    descripcion: 'Completa tu primera meta de ahorro',
    icono: '🏅',
    tipo: 'meta',
    categoria: 'ahorro',
    xpRecompensa: 80,
  },
  {
    id: 'metas_3',
    nombre: 'Ambicioso',
    descripcion: 'Completa 3 metas de ahorro',
    icono: '💎',
    tipo: 'meta',
    categoria: 'ahorro',
    xpRecompensa: 120,
    meta: 3,
  },

  // 📊 PRESUPUESTO - Control
  {
    id: 'primer_presupuesto',
    nombre: 'Planificador',
    descripcion: 'Crea tu primer presupuesto',
    icono: '📋',
    tipo: 'primera_vez',
    categoria: 'presupuesto',
    xpRecompensa: 25,
  },
  {
    id: 'presupuesto_cumplido',
    nombre: 'Bajo Control',
    descripcion: 'Cumple un presupuesto mensual',
    icono: '✅',
    tipo: 'meta',
    categoria: 'presupuesto',
    xpRecompensa: 60,
  },
  {
    id: 'presupuestos_3',
    nombre: 'Estratega',
    descripcion: 'Cumple 3 presupuestos mensuales',
    icono: '🎖️',
    tipo: 'meta',
    categoria: 'presupuesto',
    xpRecompensa: 100,
    meta: 3,
  },

  // ⬆️ NIVEL - Crecimiento
  {
    id: 'nivel_3',
    nombre: 'Ascendiendo',
    descripcion: 'Alcanza el nivel 3',
    icono: '📈',
    tipo: 'nivel',
    categoria: 'crecimiento',
    xpRecompensa: 50,
    meta: 3,
  },
  {
    id: 'nivel_5',
    nombre: 'Experto',
    descripcion: 'Alcanza el nivel 5',
    icono: '🌟',
    tipo: 'nivel',
    categoria: 'crecimiento',
    xpRecompensa: 80,
    meta: 5,
  },
  {
    id: 'nivel_10',
    nombre: 'Maestro',
    descripcion: 'Alcanza el nivel 10',
    icono: '👑',
    tipo: 'nivel',
    categoria: 'crecimiento',
    xpRecompensa: 150,
    meta: 10,
  },

  // 🏆 MAESTRÍA - Dominio completo
  {
    id: 'balance_positivo_7',
    nombre: 'Próspero',
    descripcion: 'Mantén balance positivo por 7 días',
    icono: '💹',
    tipo: 'racha',
    categoria: 'ahorro',
    xpRecompensa: 100,
    meta: 7,
  },
  {
    id: 'balance_positivo_30',
    nombre: 'Rico',
    descripcion: 'Mantén balance positivo por 30 días',
    icono: '💰',
    tipo: 'racha',
    categoria: 'ahorro',
    xpRecompensa: 200,
    meta: 30,
  },
  {
    id: 'maestro_financiero',
    nombre: 'Leyenda Financiera',
    descripcion: 'Alcanza nivel 12, completa 5 metas y cumple 5 presupuestos',
    icono: '🏰',
    tipo: 'maestria',
    categoria: 'crecimiento',
    xpRecompensa: 500,
  },
];
