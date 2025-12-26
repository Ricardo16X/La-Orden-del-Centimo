import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAlertasTarjetas } from '../hooks/useAlertasTarjetas';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalAlertasDiarias = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { alertas, tarjetasSeguras } = useAlertasTarjetas();

  // Separar alertas por tipo
  const pendientesPago = alertas.filter(a => a.estado === 'pendiente_pago');
  const cercaCorte = alertas.filter(a => a.estado === 'cerca_corte');

  const tieneAlertas = pendientesPago.length > 0 || cercaCorte.length > 0 || tarjetasSeguras.length > 0;

  if (!tieneAlertas) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              📋 Resumen de Tarjetas
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.contenido}>
            {/* SECCIÓN 1: Pagos Pendientes (CRÍTICO) */}
            {pendientesPago.length > 0 && (
              <View style={[styles.seccion, {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
              }]}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionIcono}>⚠️</Text>
                  <Text style={[styles.seccionTitulo, { color: '#ef4444' }]}>
                    ¡DEBES PAGAR PRONTO!
                  </Text>
                </View>

                {pendientesPago.map((alerta) => (
                  <View key={alerta.tarjetaId} style={[styles.tarjetaCard, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: alerta.tarjeta.color,
                  }]}>
                    <View style={[styles.tarjetaBarra, { backgroundColor: alerta.tarjeta.color }]} />
                    <View style={styles.tarjetaInfo}>
                      <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                        {alerta.tarjeta.nombre}
                      </Text>
                      <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                        {alerta.tarjeta.banco} ••{alerta.tarjeta.ultimosCuatroDigitos}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                        <Text style={styles.badgeTexto}>
                          Pago en {alerta.diasParaPago} día{alerta.diasParaPago !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SECCIÓN 2: Cerca del Corte (ADVERTENCIA) */}
            {cercaCorte.length > 0 && (
              <View style={[styles.seccion, {
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderColor: '#f59e0b',
              }]}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionIcono}>⏰</Text>
                  <Text style={[styles.seccionTitulo, { color: '#f59e0b' }]}>
                    PRONTO CORTARÁN
                  </Text>
                </View>

                {cercaCorte.map((alerta) => (
                  <View key={alerta.tarjetaId} style={[styles.tarjetaCard, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: alerta.tarjeta.color,
                  }]}>
                    <View style={[styles.tarjetaBarra, { backgroundColor: alerta.tarjeta.color }]} />
                    <View style={styles.tarjetaInfo}>
                      <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                        {alerta.tarjeta.nombre}
                      </Text>
                      <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                        {alerta.tarjeta.banco} ••{alerta.tarjeta.ultimosCuatroDigitos}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
                        <Text style={styles.badgeTexto}>
                          Corte en {alerta.diasParaCorte} día{alerta.diasParaCorte !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SECCIÓN 3: Seguras para Usar (INFORMATIVO) */}
            {tarjetasSeguras.length > 0 && (
              <View style={[styles.seccion, {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
              }]}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionIcono}>✅</Text>
                  <Text style={[styles.seccionTitulo, { color: '#10b981' }]}>
                    PUEDES USAR ESTAS
                  </Text>
                </View>

                {tarjetasSeguras.map(({ tarjeta, estado }) => (
                  <View key={tarjeta.id} style={[styles.tarjetaCard, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: tarjeta.color,
                  }]}>
                    <View style={[styles.tarjetaBarra, { backgroundColor: tarjeta.color }]} />
                    <View style={styles.tarjetaInfo}>
                      <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                        {tarjeta.nombre}
                      </Text>
                      <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                        {tarjeta.banco} ••{tarjeta.ultimosCuatroDigitos}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.badgeTexto}>
                          {estado.diasParaCorte} día{estado.diasParaCorte !== 1 ? 's' : ''} hasta corte
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Mensaje informativo */}
            <Text style={[styles.infoTexto, { color: tema.colores.textoSecundario }]}>
              Esta alerta se mostrará nuevamente mañana
            </Text>
          </ScrollView>

          {/* Botón cerrar */}
          <TouchableOpacity
            style={[styles.botonCerrar, { backgroundColor: tema.colores.primario }]}
            onPress={onClose}
          >
            <Text style={styles.botonTexto}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    marginBottom: 15,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contenido: {
    maxHeight: 500,
  },
  seccion: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seccionIcono: {
    fontSize: 24,
    marginRight: 10,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  tarjetaCard: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  tarjetaBarra: {
    height: 5,
  },
  tarjetaInfo: {
    padding: 12,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaBanco: {
    fontSize: 12,
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoTexto: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  botonCerrar: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
