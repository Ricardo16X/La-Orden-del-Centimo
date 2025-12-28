import { useEffect, useCallback } from 'react';
import { useGastos } from '../context/GastosContext';
import { useMetas } from '../context/MetasContext';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useNivel } from '../context/NivelContext';
import { useLogros } from '../context/LogrosContext';
import { useBalance } from '../context/BalanceContext';

/**
 * Hook que detecta automáticamente cuando se cumplen condiciones para desbloquear logros
 */
export const useDetectorLogros = () => {
  const { gastos } = useGastos();
  const { metas } = useMetas();
  const { presupuestos } = usePresupuestos();
  const { datosJugador, ganarXP } = useNivel();
  const { balance } = useBalance();
  const {
    desbloquearLogro,
    actualizarProgresoLogro,
    verificarLogro,
    ultimoLogroDesbloqueado,
  } = useLogros();

  /**
   * Verifica logros relacionados con registro de gastos/ingresos
   */
  const verificarLogrosRegistro = useCallback(async () => {
    const totalGastos = gastos.filter(g => g.tipo === 'gasto').length;
    const totalIngresos = gastos.filter(g => g.tipo === 'ingreso').length;

    // Primer gasto
    if (totalGastos >= 1 && !(await verificarLogro('primer_gasto'))) {
      const logro = await desbloquearLogro('primer_gasto');
      if (logro) {
        await ganarXP(logro.xpRecompensa);
        console.log('Logro desbloqueado:', logro.nombre, `+${logro.xpRecompensa} XP`);
      }
    }

    // Primer ingreso
    if (totalIngresos >= 1 && !(await verificarLogro('primer_ingreso'))) {
      const logro = await desbloquearLogro('primer_ingreso');
      if (logro) {
        await ganarXP(logro.xpRecompensa);
      }
    }

    // Progreso de gastos registrados
    if (totalGastos <= 10) {
      const logro = await actualizarProgresoLogro('gastos_10', totalGastos);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (totalGastos <= 50) {
      const logro = await actualizarProgresoLogro('gastos_50', totalGastos);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (totalGastos <= 100) {
      const logro = await actualizarProgresoLogro('gastos_100', totalGastos);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
  }, [gastos, desbloquearLogro, actualizarProgresoLogro, verificarLogro, ganarXP]);

  /**
   * Verifica logros relacionados con rachas
   */
  const verificarLogrosRacha = useCallback(async () => {
    // Calcular racha actual
    const fechasOrdenadas = gastos
      .map(g => new Date(g.fecha).toDateString())
      .filter((fecha, index, self) => self.indexOf(fecha) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let rachaActual = 0;
    const hoy = new Date().toDateString();

    for (let i = 0; i < fechasOrdenadas.length; i++) {
      const fechaEsperada = new Date();
      fechaEsperada.setDate(fechaEsperada.getDate() - i);
      const fechaEsperadaStr = fechaEsperada.toDateString();

      if (fechasOrdenadas[i] === fechaEsperadaStr) {
        rachaActual++;
      } else {
        break;
      }
    }

    // Actualizar progreso de rachas
    if (rachaActual <= 3) {
      const logro = await actualizarProgresoLogro('racha_3', rachaActual);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (rachaActual <= 7) {
      const logro = await actualizarProgresoLogro('racha_7', rachaActual);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (rachaActual <= 30) {
      const logro = await actualizarProgresoLogro('racha_30', rachaActual);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
  }, [gastos, actualizarProgresoLogro, ganarXP]);

  /**
   * Verifica logros relacionados con metas
   */
  const verificarLogrosMetas = useCallback(async () => {
    const totalMetas = metas.length;
    const metasCompletadas = metas.filter(m => m.estado === 'completada').length;

    // Primera meta creada
    if (totalMetas >= 1 && !(await verificarLogro('primera_meta'))) {
      const logro = await desbloquearLogro('primera_meta');
      if (logro) await ganarXP(logro.xpRecompensa);
    }

    // Meta al 50%
    const metasEnProgreso = metas.filter(m => m.estado === 'en_progreso');
    const algunaMetaAl50 = metasEnProgreso.some(m => {
      const porcentaje = (m.montoActual / m.montoObjetivo) * 100;
      return porcentaje >= 50;
    });

    if (algunaMetaAl50 && !(await verificarLogro('meta_50'))) {
      const logro = await desbloquearLogro('meta_50');
      if (logro) await ganarXP(logro.xpRecompensa);
    }

    // Primera meta completada
    if (metasCompletadas >= 1 && !(await verificarLogro('meta_completada'))) {
      const logro = await desbloquearLogro('meta_completada');
      if (logro) await ganarXP(logro.xpRecompensa);
    }

    // 3 metas completadas
    if (metasCompletadas <= 3) {
      const logro = await actualizarProgresoLogro('metas_3', metasCompletadas);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
  }, [metas, desbloquearLogro, actualizarProgresoLogro, verificarLogro, ganarXP]);

  /**
   * Verifica logros relacionados con presupuestos
   */
  const verificarLogrosPresupuesto = useCallback(async () => {
    const totalPresupuestos = presupuestos.length;

    // Primer presupuesto
    if (totalPresupuestos >= 1 && !(await verificarLogro('primer_presupuesto'))) {
      const logro = await desbloquearLogro('primer_presupuesto');
      if (logro) await ganarXP(logro.xpRecompensa);
    }

    // TODO: Implementar lógica para presupuestos cumplidos
    // Esto requeriría agregar tracking de presupuestos cumplidos al PresupuestosContext
  }, [presupuestos, desbloquearLogro, verificarLogro, ganarXP]);

  /**
   * Verifica logros relacionados con niveles
   */
  const verificarLogrosNivel = useCallback(async () => {
    const nivel = datosJugador.nivel;

    // Niveles alcanzados
    if (nivel >= 3) {
      const logro = await actualizarProgresoLogro('nivel_3', nivel);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (nivel >= 5) {
      const logro = await actualizarProgresoLogro('nivel_5', nivel);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
    if (nivel >= 10) {
      const logro = await actualizarProgresoLogro('nivel_10', nivel);
      if (logro) await ganarXP(logro.xpRecompensa);
    }
  }, [datosJugador, actualizarProgresoLogro, ganarXP]);

  /**
   * Verifica logros relacionados con balance positivo
   */
  const verificarLogrosBalance = useCallback(async () => {
    // TODO: Implementar tracking de días con balance positivo
    // Esto requeriría mantener un historial de balances diarios
  }, [balance]);

  /**
   * Ejecuta todas las verificaciones
   */
  const verificarTodosLosLogros = useCallback(async () => {
    await verificarLogrosRegistro();
    await verificarLogrosRacha();
    await verificarLogrosMetas();
    await verificarLogrosPresupuesto();
    await verificarLogrosNivel();
    await verificarLogrosBalance();
  }, [
    verificarLogrosRegistro,
    verificarLogrosRacha,
    verificarLogrosMetas,
    verificarLogrosPresupuesto,
    verificarLogrosNivel,
    verificarLogrosBalance,
  ]);

  // Ejecutar verificaciones cuando cambien los datos relevantes
  useEffect(() => {
    verificarTodosLosLogros();
  }, [gastos, metas, presupuestos, datosJugador, balance]);

  return {
    verificarTodosLosLogros,
    ultimoLogroDesbloqueado,
  };
};
