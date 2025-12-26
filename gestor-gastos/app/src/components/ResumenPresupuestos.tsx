import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { usePresupuestos } from '../context/PresupuestosContext';
import { useCategorias } from '../context/CategoriasContext';

export const ResumenPresupuestos = () => {
  const { tema } = useTema();
  const { presupuestos, obtenerEstadisticasPresupuesto } = usePresupuestos();
  const { categorias } = useCategorias();

  if (presupuestos.length === 0) {
    return (
      <View style={[styles.seccion, {
        backgroundColor: tema.colores.fondoSecundario,
        borderColor: tema.colores.bordes,
      }]}>
        <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
          💰 Presupuestos
        </Text>
        <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
          No tienes presupuestos configurados.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.seccion, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.bordes,
    }]}>
      <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
        💰 Presupuestos
      </Text>

      {presupuestos.map(presupuesto => {
        const categoria = categorias.find(c => c.id === presupuesto.categoriaId);
        const stats = obtenerEstadisticasPresupuesto(presupuesto.categoriaId, presupuesto.periodo);

        if (!categoria || !stats) return null;

        const porcentaje = Math.min(stats.porcentaje, 100);
        const color = stats.excedido ? '#e74c3c' : stats.debeAlertar ? '#f1c40f' : '#4ade80';

        return (
          <View key={presupuesto.id} style={styles.presupuestoItem}>
            <View style={styles.presupuestoHeader}>
              <Text style={styles.categoriaEmoji}>{categoria.emoji}</Text>
              <View style={styles.presupuestoInfo}>
                <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                  {categoria.nombre}
                </Text>
                <Text style={[styles.periodoTexto, { color: tema.colores.textoSecundario }]}>
                  {presupuesto.periodo === 'semanal' ? '📅 Semanal' :
                   presupuesto.periodo === 'mensual' ? '🗓️ Mensual' :
                   '📆 Anual'}
                </Text>
              </View>
              <Text style={[styles.porcentajeTexto, { color }]}>
                {Math.round(porcentaje)}%
              </Text>
            </View>

            <View style={styles.barraContainer}>
              <View
                style={[
                  styles.barraProgreso,
                  {
                    width: `${porcentaje}%`,
                    backgroundColor: color,
                  }
                ]}
              />
            </View>

            <View style={styles.montosContainer}>
              <Text style={[styles.montoTexto, { color: tema.colores.textoSecundario }]}>
                {`${stats.gastado.toFixed(2)} / ${stats.presupuesto.toFixed(2)} ${tema.moneda}`}
              </Text>
              {stats.excedido && (
                <Text style={[styles.excedidoTexto, { color: '#e74c3c' }]}>
                  ¡Excedido por {(stats.gastado - stats.presupuesto).toFixed(2)}!
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  vacio: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  presupuestoItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  presupuestoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoriaEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  presupuestoInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodoTexto: {
    fontSize: 12,
    marginTop: 2,
  },
  porcentajeTexto: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  barraContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 4,
  },
  montosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  montoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  excedidoTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});
