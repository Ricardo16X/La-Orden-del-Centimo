import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAlertasPresupuesto } from '../hooks/useAlertasPresupuesto';
import { useMonedas } from '../context/MonedasContext';

interface Props {
  soloExcedidos?: boolean;
}

export const AlertasPresupuesto = ({ soloExcedidos }: Props = {}) => {
  const { tema } = useTema();
  const { alertas, tieneAlertas } = useAlertasPresupuesto();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo || '$';

  const alertasFiltradas = soloExcedidos ? alertas.filter(a => a.excedido) : alertas;

  if (!tieneAlertas || alertasFiltradas.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        🚨 Presupuestos excedidos
      </Text>
      {alertasFiltradas.map((alerta, index) => {
        const porcentajeRedondeado = Math.round(alerta.porcentaje);
        const esExcedido = alerta.excedido;

        return (
          <View
            key={`${alerta.categoriaId}-${index}`}
            style={[
              styles.alerta,
              {
                backgroundColor: esExcedido
                  ? 'rgba(231, 76, 60, 0.15)'
                  : 'rgba(241, 196, 15, 0.15)',
                borderColor: esExcedido ? '#e74c3c' : '#f1c40f',
              }
            ]}
          >
            <View style={styles.alertaHeader}>
              <Text style={styles.categoriaEmoji}>{alerta.emojiCategoria}</Text>
              <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                {alerta.nombreCategoria}
              </Text>
              <Text style={styles.alertaIcono}>
                {esExcedido ? '⚠️' : '💡'}
              </Text>
            </View>

            <View style={styles.barraContainer}>
              <View
                style={[
                  styles.barraProgreso,
                  {
                    width: `${Math.min(porcentajeRedondeado, 100)}%`,
                    backgroundColor: esExcedido ? '#e74c3c' : '#f1c40f',
                  }
                ]}
              />
            </View>

            <View style={styles.alertaDetalles}>
              <Text style={[styles.montoTexto, { color: tema.colores.texto }]}>
                {`${simbolo}${alerta.gastado.toFixed(2)} de ${simbolo}${alerta.presupuesto.toFixed(2)}`}
              </Text>
              <Text
                style={[
                  styles.porcentajeTexto,
                  { color: esExcedido ? '#e74c3c' : '#f1c40f' }
                ]}
              >
                {porcentajeRedondeado}%
              </Text>
            </View>

            <Text style={[styles.mensajeAlerta, { color: tema.colores.textoSecundario }]}>
              {esExcedido
                ? `¡Has excedido el presupuesto por ${simbolo}${(alerta.gastado - alerta.presupuesto).toFixed(2)}!`
                : `Estás cerca del límite de tu presupuesto`
              }
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginVertical: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alerta: {
    borderRadius: 15,
    borderWidth: 2,
    padding: 15,
  },
  alertaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoriaEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  categoriaNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertaIcono: {
    fontSize: 24,
  },
  barraContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 4,
  },
  alertaDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  montoTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  porcentajeTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mensajeAlerta: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
