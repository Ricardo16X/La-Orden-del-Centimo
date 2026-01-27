import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAlertasTarjetas } from '../hooks/useAlertasTarjetas';
import { useCuotas } from '../context/CuotasContext';
import { router } from 'expo-router';

export const ResumenTarjetas = () => {
  const { tema } = useTema();
  const { alertas, tarjetasSeguras } = useAlertasTarjetas();
  const { obtenerTotalCuotasMensual } = useCuotas();

  const totalCuotasMensual = obtenerTotalCuotasMensual();

  // Separar alertas por tipo
  const pendientesPago = alertas.filter(a => a.estado === 'pendiente_pago');
  const cercaCorte = alertas.filter(a => a.estado === 'cerca_corte' && a.diasParaCorte <= 7);

  const totalAlertas = pendientesPago.length + cercaCorte.length;
  const totalTarjetas = pendientesPago.length + cercaCorte.length + tarjetasSeguras.length;

  // Si no hay tarjetas, no mostrar nada
  if (totalTarjetas === 0) return null;

  // Determinar qué mostrar
  const hayAlertasCriticas = totalAlertas > 0;
  const maxTarjetasMostrar = 3;

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
      {/* Header con contador */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.titulo, { color: tema.colores.primario }]}>
            💳 Estado de Tarjetas
          </Text>
          {totalAlertas > 0 && (
            <View style={[styles.badge, { backgroundColor: totalAlertas > 0 ? '#ef4444' : '#10b981' }]}>
              <Text style={styles.badgeText}>{totalAlertas}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/tarjetas')}>
          <Text style={[styles.verMas, { color: tema.colores.primario }]}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido adaptativo */}
      {hayAlertasCriticas ? (
        // CASO 1: Hay alertas - Mostrar detalles
        <View>
          {/* Pagos Pendientes (CRÍTICO) */}
          {pendientesPago.length > 0 && (
            <View style={styles.seccion}>
              <View style={[styles.seccionHeader, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={styles.seccionIcono}>⚠️</Text>
                <Text style={[styles.seccionTitulo, { color: '#ef4444' }]}>
                  ¡Debes pagar pronto!
                </Text>
              </View>

              {pendientesPago.slice(0, maxTarjetasMostrar).map((alerta) => (
                <View key={alerta.tarjeta.id} style={[styles.tarjetaCard, {
                  backgroundColor: tema.colores.fondo,
                  borderLeftColor: alerta.tarjeta.color,
                }]}>
                  <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                    {alerta.tarjeta.nombre}
                  </Text>
                  <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                    {alerta.tarjeta.banco} ••{alerta.tarjeta.ultimosCuatroDigitos}
                  </Text>
                  <View style={[styles.badgeInline, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.badgeTexto}>
                      💰 Pago en {alerta.diasParaPago} día{alerta.diasParaPago !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cerca del Corte (ADVERTENCIA) - Solo si no hay muchos pagos pendientes */}
          {cercaCorte.length > 0 && pendientesPago.length < 2 && (
            <View style={styles.seccion}>
              <View style={[styles.seccionHeader, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Text style={styles.seccionIcono}>⏰</Text>
                <Text style={[styles.seccionTitulo, { color: '#f59e0b' }]}>
                  Próximo al corte
                </Text>
              </View>

              {cercaCorte.slice(0, maxTarjetasMostrar - pendientesPago.length).map((alerta) => (
                <View key={alerta.tarjeta.id} style={[styles.tarjetaCard, {
                  backgroundColor: tema.colores.fondo,
                  borderLeftColor: alerta.tarjeta.color,
                }]}>
                  <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                    {alerta.tarjeta.nombre}
                  </Text>
                  <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                    {alerta.tarjeta.banco} ••{alerta.tarjeta.ultimosCuatroDigitos}
                  </Text>
                  <View style={[styles.badgeInline, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.badgeTexto}>
                      📅 Corte en {alerta.diasParaCorte} día{alerta.diasParaCorte !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Mensaje compacto de tarjetas seguras */}
          {tarjetasSeguras.length > 0 && (
            <Text style={[styles.mensajeCompacto, { color: tema.colores.textoSecundario }]}>
              ✅ {tarjetasSeguras.length} tarjeta{tarjetasSeguras.length !== 1 ? 's' : ''} más {tarjetasSeguras.length !== 1 ? 'están' : 'está'} segura{tarjetasSeguras.length !== 1 ? 's' : ''} para usar
            </Text>
          )}

          {/* Información de cuotas mensuales */}
          {totalCuotasMensual > 0 && (
            <View style={[styles.cuotasInfo, { backgroundColor: tema.colores.fondo, borderColor: tema.colores.primario }]}>
              <Text style={[styles.cuotasIcono]}>📦</Text>
              <View style={styles.cuotasTextos}>
                <Text style={[styles.cuotasTitulo, { color: tema.colores.primario }]}>
                  Cuotas mensuales
                </Text>
                <Text style={[styles.cuotasMonto, { color: tema.colores.texto }]}>
                  {tema.moneda}{totalCuotasMensual.toFixed(2)}/mes
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        // CASO 2: Todo está bien - Versión compacta estilo Opción 3
        <View style={styles.estadoBueno}>
          <Text style={styles.estadoBuenoIcono}>✅</Text>
          <Text style={[styles.estadoBuenoTitulo, { color: tema.colores.texto }]}>
            Todo bajo control
          </Text>
          <Text style={[styles.estadoBuenoDescripcion, { color: tema.colores.textoSecundario }]}>
            {totalTarjetas === 1
              ? 'Tu tarjeta está al día'
              : `Tus ${totalTarjetas} tarjetas están al día`}
          </Text>

          {/* Información de cuotas mensuales también en estado bueno */}
          {totalCuotasMensual > 0 && (
            <View style={[styles.cuotasInfoCompacta, { backgroundColor: tema.colores.fondoSecundario }]}>
              <Text style={[styles.cuotasCompactaTexto, { color: tema.colores.textoSecundario }]}>
                📦 {tema.moneda}{totalCuotasMensual.toFixed(2)}/mes en cuotas
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    borderWidth: 2,
    padding: 15,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verMas: {
    fontSize: 14,
    fontWeight: '600',
  },
  seccion: {
    marginBottom: 12,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  seccionIcono: {
    fontSize: 18,
    marginRight: 8,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tarjetaCard: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaBanco: {
    fontSize: 13,
    marginBottom: 8,
  },
  badgeInline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mensajeCompacto: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  // Información de cuotas
  cuotasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 12,
    gap: 12,
  },
  cuotasIcono: {
    fontSize: 32,
  },
  cuotasTextos: {
    flex: 1,
  },
  cuotasTitulo: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cuotasMonto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cuotasInfoCompacta: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  cuotasCompactaTexto: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Estado bueno (sin alertas)
  estadoBueno: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  estadoBuenoIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  estadoBuenoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  estadoBuenoDescripcion: {
    fontSize: 14,
    textAlign: 'center',
  },
});
