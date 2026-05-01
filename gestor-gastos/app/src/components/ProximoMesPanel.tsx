import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useCuotas } from '../context/CuotasContext';
import { useTarjetas } from '../context/TarjetasContext';
import { useGastos } from '../context/GastosContext';
import { useMonedas } from '../context/MonedasContext';
import { GastoRecurrente, TarjetaCredito } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function contarOcurrenciasDiaSemana(diaSemana: number, anio: number, mes: number): number {
  // diaSemana app: 1=Dom…7=Sáb → JS getDay(): 0=Dom…6=Sáb
  const jsDay = diaSemana - 1;
  const dias = new Date(anio, mes + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= dias; d++) {
    if (new Date(anio, mes, d).getDay() === jsDay) count++;
  }
  return count;
}

function vecesEnProximoMes(gr: GastoRecurrente, anio: number, mes: number): number {
  switch (gr.frecuencia) {
    case 'diario':  return new Date(anio, mes + 1, 0).getDate();
    case 'semanal': return contarOcurrenciasDiaSemana(gr.diaSemana ?? 2, anio, mes);
    case 'mensual': return 1;
  }
}

function ultimoCorte(tarjeta: TarjetaCredito): Date {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dia = hoy.getDate();
  let mes = dia > tarjeta.diaCorte ? hoy.getMonth() : hoy.getMonth() - 1;
  let anio = hoy.getFullYear();
  if (mes < 0) { mes = 11; anio -= 1; }
  const corte = new Date(anio, mes, tarjeta.diaCorte);
  corte.setHours(0, 0, 0, 0);
  return corte;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export const ProximoMesPanel = () => {
  const { tema } = useTema();
  const c = tema.colores;
  const { gastosRecurrentes } = useGastosRecurrentes();
  const { obtenerProyeccionCuotas, cuotas: todasCuotas } = useCuotas();
  const { tarjetas } = useTarjetas();
  const { gastos } = useGastos();
  const { monedas, monedaBase, convertirAMonedaBase } = useMonedas();

  const [expandido, setExpandido] = useState<'fijos' | 'cuotas' | 'tarjetas' | null>(null);

  const simbolo = monedaBase?.simbolo ?? '$';
  const hoy = new Date();
  const sigAnio = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const sigMes  = (hoy.getMonth() + 1) % 12;
  const nombreMes = new Date(sigAnio, sigMes, 1)
    .toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const nombreMesCapital = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  const obtenerSimbolo = (cod: string) =>
    monedas.find(m => m.codigo === cod)?.simbolo ?? simbolo;

  // ── 1. Gastos fijos (recurrentes activos) ─────────────────────────────────

  type ItemFijo = { gr: GastoRecurrente; veces: number; totalOriginal: number; totalBase: number };

  const gastosFijos: ItemFijo[] = gastosRecurrentes
    .filter(gr => gr.activo)
    .map(gr => {
      const veces = vecesEnProximoMes(gr, sigAnio, sigMes);
      const totalOriginal = gr.monto * veces;
      const totalBase = convertirAMonedaBase(totalOriginal, gr.moneda);
      return { gr, veces, totalOriginal, totalBase };
    });

  const totalFijosBase = gastosFijos.reduce((s, i) => s + i.totalBase, 0);

  // agrupar por moneda para el subtítulo
  const fijosPorMoneda: Record<string, number> = {};
  gastosFijos.forEach(({ gr, totalOriginal }) => {
    fijosPorMoneda[gr.moneda] = (fijosPorMoneda[gr.moneda] ?? 0) + totalOriginal;
  });

  // ── 2. Cuotas pendientes ──────────────────────────────────────────────────

  const proyeccion = obtenerProyeccionCuotas(2);
  const totalCuotasSigMes = proyeccion[1]?.totalCuotas ?? 0;

  // cuotas activas que aportarán en el mes siguiente
  const cuotasActivasSigMes = todasCuotas.filter(cuota => {
    if (cuota.estado !== 'activa') return false;
    const cuotasPendientes = cuota.cantidadCuotas - cuota.cuotasPagadas;
    if (cuotasPendientes <= 0) return false;
    const fechaPrimera = new Date(cuota.fechaProximaCuota); fechaPrimera.setHours(0,0,0,0);
    const mesesHasta = (fechaPrimera.getFullYear() - hoy.getFullYear()) * 12
      + (fechaPrimera.getMonth() - hoy.getMonth());
    const indiceSigMes = 1 - mesesHasta;
    return indiceSigMes >= 0 && indiceSigMes < cuotasPendientes;
  });

  // ── 3. Saldo acumulado en tarjetas (ciclo en curso) ───────────────────────

  type SaldoTarjeta = { tarjeta: TarjetaCredito; totalBase: number; porMoneda: Record<string, { monto: number; simbolo: string }> };

  const saldosTarjetas: SaldoTarjeta[] = tarjetas.map(tarjeta => {
    const corte = ultimoCorte(tarjeta);
    const porMoneda: Record<string, { monto: number; simbolo: string }> = {};
    let totalBase = 0;
    gastos
      .filter(g => {
        if (g.tarjetaId !== tarjeta.id || g.tipo !== 'gasto') return false;
        const f = new Date(g.fecha); f.setHours(0,0,0,0);
        return f > corte;
      })
      .forEach(g => {
        const cod = g.moneda || monedaBase?.codigo || 'GTQ';
        if (!porMoneda[cod]) porMoneda[cod] = { monto: 0, simbolo: obtenerSimbolo(cod) };
        porMoneda[cod].monto += g.monto;
        totalBase += g.montoEnMonedaBase ?? g.monto;
      });
    return { tarjeta, totalBase, porMoneda };
  }).filter(s => s.totalBase > 0);

  const totalSaldosBase = saldosTarjetas.reduce((s, t) => s + t.totalBase, 0);

  // ── Total comprometido ────────────────────────────────────────────────────

  const totalComprometido = totalFijosBase + totalCuotasSigMes + totalSaldosBase;
  if (totalComprometido === 0) return null;

  // ─── Helpers de render ───────────────────────────────────────────────────

  const toggle = (seccion: 'fijos' | 'cuotas' | 'tarjetas') =>
    setExpandido(prev => prev === seccion ? null : seccion);

  const SeccionHeader = ({
    id, emoji, titulo, monto, count,
  }: { id: 'fijos' | 'cuotas' | 'tarjetas'; emoji: string; titulo: string; monto: number; count: number }) => (
    <TouchableOpacity
      style={[styles.seccionHeader, { borderBottomColor: c.bordes }]}
      onPress={() => toggle(id)}
      activeOpacity={0.7}
    >
      <View style={styles.seccionHeaderLeft}>
        <Text style={styles.seccionEmoji}>{emoji}</Text>
        <View>
          <Text style={[styles.seccionTitulo, { color: c.texto }]}>{titulo}</Text>
          <Text style={[styles.seccionCount, { color: c.textoSecundario }]}>
            {count} {count === 1 ? 'ítem' : 'ítems'}
          </Text>
        </View>
      </View>
      <View style={styles.seccionHeaderRight}>
        <Text style={[styles.seccionMonto, { color: c.primario }]}>
          {simbolo}{monto.toFixed(2)}
        </Text>
        <Text style={[styles.chevron, { color: c.textoSecundario }]}>
          {expandido === id ? '▲' : '▼'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>

      {/* Header: título + total */}
      <View style={[styles.cardHeader, { borderBottomColor: c.bordes }]}>
        <View>
          <Text style={[styles.cardTitulo, { color: c.texto }]}>📅 {nombreMesCapital}</Text>
          <Text style={[styles.cardSubtitulo, { color: c.textoSecundario }]}>
            Compromisos ya conocidos
          </Text>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: c.primario + '22' }]}>
          <Text style={[styles.totalMonto, { color: c.primario }]}>
            {simbolo}{totalComprometido.toFixed(2)}
          </Text>
          <Text style={[styles.totalLabel, { color: c.primario }]}>comprometido</Text>
        </View>
      </View>

      {/* Sección 1: Gastos fijos */}
      {gastosFijos.length > 0 && (
        <>
          <SeccionHeader
            id="fijos"
            emoji="🔁"
            titulo="Gastos fijos"
            monto={totalFijosBase}
            count={gastosFijos.length}
          />
          {expandido === 'fijos' && (
            <View style={[styles.detalle, { borderBottomColor: c.bordes }]}>
              {gastosFijos.map(({ gr, veces, totalOriginal }) => (
                <View key={gr.id} style={styles.detalleItem}>
                  <View style={styles.detalleItemLeft}>
                    <Text style={[styles.detalleDesc, { color: c.texto }]}>
                      {gr.descripcion}
                    </Text>
                    <Text style={[styles.detalleSubDesc, { color: c.textoSecundario }]}>
                      {gr.frecuencia === 'diario'
                        ? `${veces} días`
                        : gr.frecuencia === 'semanal'
                          ? `${veces}× · semana`
                          : '1× · mes'}
                    </Text>
                  </View>
                  <Text style={[styles.detalleMonto, { color: c.texto }]}>
                    {obtenerSimbolo(gr.moneda)}{totalOriginal.toFixed(2)}
                  </Text>
                </View>
              ))}
              {/* resumen por moneda si hay mezcla */}
              {Object.keys(fijosPorMoneda).length > 1 && (
                <View style={[styles.detalleTotal, { borderTopColor: c.bordes }]}>
                  <Text style={[styles.detalleTotalLabel, { color: c.textoSecundario }]}>
                    Total aprox.
                  </Text>
                  <Text style={[styles.detalleTotalMonto, { color: c.primario }]}>
                    ≈ {simbolo}{totalFijosBase.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {/* Sección 2: Cuotas */}
      {totalCuotasSigMes > 0 && (
        <>
          <SeccionHeader
            id="cuotas"
            emoji="📦"
            titulo="Cuotas pendientes"
            monto={totalCuotasSigMes}
            count={cuotasActivasSigMes.length}
          />
          {expandido === 'cuotas' && (
            <View style={[styles.detalle, { borderBottomColor: c.bordes }]}>
              {cuotasActivasSigMes.map(cuota => (
                <View key={cuota.id} style={styles.detalleItem}>
                  <View style={styles.detalleItemLeft}>
                    <Text style={[styles.detalleDesc, { color: c.texto }]}>
                      {cuota.descripcion}
                    </Text>
                    <Text style={[styles.detalleSubDesc, { color: c.textoSecundario }]}>
                      {cuota.cuotasPagadas + 1}/{cuota.cantidadCuotas} cuotas
                    </Text>
                  </View>
                  <Text style={[styles.detalleMonto, { color: c.texto }]}>
                    {simbolo}{cuota.montoPorCuota.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Sección 3: Saldo tarjetas */}
      {saldosTarjetas.length > 0 && (
        <>
          <SeccionHeader
            id="tarjetas"
            emoji="💳"
            titulo="Saldo en tarjetas"
            monto={totalSaldosBase}
            count={saldosTarjetas.length}
          />
          {expandido === 'tarjetas' && (
            <View style={[styles.detalle, { borderBottomColor: c.bordes }]}>
              {saldosTarjetas.map(({ tarjeta, totalBase, porMoneda }) => {
                const entradas = Object.entries(porMoneda);
                const multiMoneda = entradas.length > 1;
                return (
                  <View key={tarjeta.id} style={styles.detalleItem}>
                    <View style={styles.detalleItemLeft}>
                      <View style={styles.tarjetaNombreFila}>
                        <View style={[styles.tarjetaDot, { backgroundColor: tarjeta.color }]} />
                        <Text style={[styles.detalleDesc, { color: c.texto }]}>
                          {tarjeta.nombre}
                        </Text>
                      </View>
                      <Text style={[styles.detalleSubDesc, { color: c.textoSecundario }]}>
                        Ciclo en curso · corta día {tarjeta.diaCorte}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {entradas.map(([cod, data]) => (
                        <Text key={cod} style={[styles.detalleMonto, { color: c.texto }]}>
                          {data.simbolo}{data.monto.toFixed(2)}
                        </Text>
                      ))}
                      {multiMoneda && (
                        <Text style={[styles.detalleSubDesc, { color: c.textoSecundario }]}>
                          ≈ {simbolo}{totalBase.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* Pie: aviso de modo precaución */}
      <View style={[styles.cardFooter, { backgroundColor: c.primario + '11' }]}>
        <Text style={[styles.footerTexto, { color: c.textoSecundario }]}>
          💡 Planifica este mes con ese monto ya reservado mentalmente
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitulo: {
    fontSize: 12,
    marginTop: 2,
  },
  totalBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  totalMonto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  seccionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  seccionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seccionEmoji: {
    fontSize: 20,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '600',
  },
  seccionCount: {
    fontSize: 11,
    marginTop: 1,
  },
  seccionMonto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detalle: {
    borderBottomWidth: 1,
  },
  detalleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingLeft: 46,
    gap: 8,
  },
  detalleItemLeft: {
    flex: 1,
  },
  detalleDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  detalleSubDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  detalleMonto: {
    fontSize: 13,
    fontWeight: '600',
  },
  detalleTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingLeft: 46,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  detalleTotalLabel: {
    fontSize: 12,
  },
  detalleTotalMonto: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tarjetaNombreFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tarjetaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    padding: 12,
    paddingHorizontal: 16,
  },
  footerTexto: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
