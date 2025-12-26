import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAlertasTarjetas } from '../hooks/useAlertasTarjetas';

export const AlertasTarjetas = () => {
  const { tema } = useTema();
  const { alertas, tieneAlertas } = useAlertasTarjetas();

  if (!tieneAlertas) return null;

  return (
    <View style={styles.container}>
      {alertas.map((alerta) => {
        const esPendientePago = alerta.estado === 'pendiente_pago';

        return (
          <View
            key={alerta.tarjetaId}
            style={[
              styles.alerta,
              {
                backgroundColor: esPendientePago
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                borderColor: alerta.color,
              }
            ]}
          >
            <View style={styles.alertaHeader}>
              <View style={[styles.iconoContainer, { backgroundColor: alerta.tarjeta.color }]}>
                <Text style={styles.iconoTexto}>
                  {esPendientePago ? '💳' : '⏰'}
                </Text>
              </View>

              <View style={styles.alertaInfo}>
                <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                  {alerta.tarjeta.nombre}
                </Text>
                <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                  {`${alerta.tarjeta.banco} •••• ${alerta.tarjeta.ultimosCuatroDigitos}`}
                </Text>
              </View>

              <Text style={[styles.estadoIcono, { color: alerta.color }]}>
                {esPendientePago ? '⚠️' : '💡'}
              </Text>
            </View>

            <View style={[styles.mensajeContainer, { backgroundColor: alerta.color + '20' }]}>
              <Text style={[styles.mensajeTexto, { color: alerta.color }]}>
                {esPendientePago
                  ? `¡PAGO PENDIENTE! Vence en ${alerta.diasParaPago} día${alerta.diasParaPago !== 1 ? 's' : ''}`
                  : `Cerca del corte (${alerta.diasParaCorte} día${alerta.diasParaCorte !== 1 ? 's' : ''})`
                }
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 15,
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
  iconoContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 24,
  },
  alertaInfo: {
    flex: 1,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tarjetaBanco: {
    fontSize: 12,
  },
  estadoIcono: {
    fontSize: 24,
  },
  mensajeContainer: {
    padding: 10,
    borderRadius: 8,
  },
  mensajeTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
