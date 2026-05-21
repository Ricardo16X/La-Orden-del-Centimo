import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { memo, useMemo } from 'react';
import { useTema } from '../context/TemaContext';
import { useAlertasPresupuesto } from '../hooks/useAlertasPresupuesto';
import { useAlertasTarjetas } from '../hooks/useAlertasTarjetas';
import { useMetas } from '../context/MetasContext';
import { useGastosRecurrentes } from '../context/GastosRecurrentesContext';
import { useMonedas } from '../context/MonedasContext';
import { router } from 'expo-router';

type NivelPendiente = 'urgente' | 'advertencia' | 'info';

type Pendiente = {
  id: string;
  nivel: NivelPendiente;
  emoji: string;
  texto: string;
  subtexto: string;
  ruta: string;
};

const NIVEL_COLOR: Record<NivelPendiente, string> = {
  urgente:     '#ef4444',
  advertencia: '#f59e0b',
  info:        '#3b82f6',
};

export const PendientesCard = memo(() => {
  const { tema } = useTema();
  const c = tema.colores;
  const { alertas: alertasPresupuesto } = useAlertasPresupuesto();
  const { alertas: alertasTarjetas } = useAlertasTarjetas();
  const { metas, obtenerEstadisticasMeta } = useMetas();
  const { gastosRecurrentes } = useGastosRecurrentes();
  const { monedas, monedaBase } = useMonedas();
  const sim = monedaBase?.simbolo || '$';

  const pendientes = useMemo<Pendiente[]>(() => {
    const items: Pendiente[] = [];

    // ── Tarjetas: pagos urgentes ─────────────────────────────────────────
    alertasTarjetas
      .filter(a => a.estado === 'pendiente_pago')
      .forEach(a => items.push({
        id: `tarjeta-pago-${a.tarjeta.id}`,
        nivel: a.diasParaPago <= 2 ? 'urgente' : 'advertencia',
        emoji: '💳',
        texto: a.tarjeta.nombre,
        subtexto: a.diasParaPago <= 0
          ? '¡Pago vencido!'
          : `Pago en ${a.diasParaPago} día${a.diasParaPago !== 1 ? 's' : ''}`,
        ruta: `/tarjetas?tarjetaId=${a.tarjeta.id}`,
      }));

    // ── Tarjetas: cerca del corte ────────────────────────────────────────
    alertasTarjetas
      .filter(a => a.estado === 'cerca_corte' && a.diasParaCorte <= 5)
      .forEach(a => items.push({
        id: `tarjeta-corte-${a.tarjeta.id}`,
        nivel: 'advertencia',
        emoji: '⏰',
        texto: a.tarjeta.nombre,
        subtexto: `Corte en ${a.diasParaCorte} día${a.diasParaCorte !== 1 ? 's' : ''}`,
        ruta: `/tarjetas?tarjetaId=${a.tarjeta.id}`,
      }));

    // ── Presupuestos excedidos ───────────────────────────────────────────
    alertasPresupuesto
      .filter(a => a.excedido)
      .forEach(a => items.push({
        id: `presupuesto-${a.categoriaId}`,
        nivel: 'urgente',
        emoji: a.emojiCategoria,
        texto: a.nombreCategoria,
        subtexto: `Al ${Math.round(a.porcentaje)}% — excedido por ${sim}${(a.gastado - a.presupuesto).toFixed(2)}`,
        ruta: '/presupuestos',
      }));

    // ── Metas atrasadas ──────────────────────────────────────────────────
    metas
      .filter(m => m.estado === 'en_progreso')
      .forEach(m => {
        const stats = obtenerEstadisticasMeta(m.id);
        if (stats && !stats.enTiempo && stats.diasRestantes !== null && stats.diasRestantes > 0) {
          items.push({
            id: `meta-${m.id}`,
            nivel: 'advertencia',
            emoji: m.icono,
            texto: m.nombre,
            subtexto: `Necesitas ${sim}${(stats.ahorroRequeridoMensual ?? 0).toFixed(0)}/mes para llegar a tiempo`,
            ruta: '/metas',
          });
        }
      });

    // ── Gastos recurrentes de hoy o mañana ──────────────────────────────
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const pasadoManana = new Date(hoy); pasadoManana.setDate(hoy.getDate() + 2);
    gastosRecurrentes
      .filter(gr => gr.activo)
      .forEach(gr => {
        const fecha = new Date(gr.proximaFecha); fecha.setHours(0, 0, 0, 0);
        if (fecha >= hoy && fecha < pasadoManana) {
          const simGR = monedas.find(m => m.codigo === gr.moneda)?.simbolo ?? sim;
          const cuando = fecha.getTime() === hoy.getTime() ? 'Se registra hoy' : 'Se registra mañana';
          items.push({
            id: `gr-${gr.id}`,
            nivel: 'info',
            emoji: '🔁',
            texto: gr.descripcion,
            subtexto: `${cuando} · ${simGR}${gr.monto.toFixed(2)}`,
            ruta: '/gastosRecurrentes',
          });
        }
      });

    return items;
  }, [alertasTarjetas, alertasPresupuesto, metas, gastosRecurrentes, monedas, monedaBase]);

  if (pendientes.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: '#10b98130' }]}>
        <View style={styles.todoOkRow}>
          <Text style={styles.todoOkEmoji}>✅</Text>
          <View>
            <Text style={[styles.todoOkTitulo, { color: c.texto }]}>Todo en orden</Text>
            <Text style={[styles.todoOkSub, { color: c.textoSecundario }]}>
              Sin pendientes para hoy
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const urgentes = pendientes.filter(p => p.nivel === 'urgente').length;

  return (
    <View style={[styles.card, { backgroundColor: c.fondoSecundario, borderColor: c.bordes }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: c.texto }]}>Pendientes</Text>
        {urgentes > 0 && (
          <View style={styles.urgenteBadge}>
            <Text style={styles.urgenteBadgeTexto}>
              {urgentes} urgente{urgentes !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      {pendientes.map((item, idx) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.itemRow,
            idx < pendientes.length - 1 && [styles.itemBorde, { borderBottomColor: c.bordes + '55' }],
          ]}
          onPress={() => router.push(item.ruta as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.nivelDot, { backgroundColor: NIVEL_COLOR[item.nivel] }]} />
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTexto, { color: c.texto }]} numberOfLines={1}>
              {item.texto}
            </Text>
            <Text style={[styles.itemSub, { color: c.textoSecundario }]} numberOfLines={1}>
              {item.subtexto}
            </Text>
          </View>
          <Text style={[styles.itemArrow, { color: c.textoSecundario }]}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  titulo: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  urgenteBadge: {
    backgroundColor: '#ef444418',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urgenteBadgeTexto: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
  // Estado "todo bien"
  todoOkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  todoOkEmoji: {
    fontSize: 28,
  },
  todoOkTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  todoOkSub: {
    fontSize: 13,
  },
  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  itemBorde: {
    borderBottomWidth: 1,
  },
  nivelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  itemEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  itemTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 1,
  },
  itemArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
});
