import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useTarjetas } from '../context/TarjetasContext';
import { useAlertasTarjetas } from '../hooks/useAlertasTarjetas';
import { ModalGestionarTarjetas } from './ModalGestionarTarjetas';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalTarjetas = ({ visible, onClose }: Props) => {
  const { tema } = useTema();
  const { tarjetas, obtenerEstadoTarjeta } = useTarjetas();
  const { alertas, tarjetasSeguras } = useAlertasTarjetas();
  const [modalGestionVisible, setModalGestionVisible] = useState(false);

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
            <View style={styles.header}>
              <Text style={[styles.titulo, { color: tema.colores.primario }]}>
                💳 Mis Tarjetas
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Botón gestionar */}
              <TouchableOpacity
                style={[styles.botonGestionar, { backgroundColor: tema.colores.primario }]}
                onPress={() => setModalGestionVisible(true)}
              >
                <Text style={styles.botonTexto}>⚙️ Gestionar Tarjetas</Text>
              </TouchableOpacity>

              {tarjetas.length === 0 ? (
                <View style={[styles.seccion, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                }]}>
                  <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
                    No tienes tarjetas registradas.{'\n'}
                    ¡Agrega tu primera tarjeta para comenzar!
                  </Text>
                </View>
              ) : (
                <>
                  {/* Alertas */}
                  {alertas.length > 0 && (
                    <View style={[styles.seccion, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                    }]}>
                      <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                        ⚠️ Alertas ({alertas.length})
                      </Text>

                      {alertas.map((alerta) => {
                        const esPendiente = alerta.estado === 'pendiente_pago';

                        return (
                          <View
                            key={alerta.tarjetaId}
                            style={[styles.tarjetaCard, {
                              backgroundColor: alerta.color + '10',
                              borderColor: alerta.color,
                            }]}
                          >
                            <View style={[styles.tarjetaBarra, { backgroundColor: alerta.tarjeta.color }]} />

                            <View style={styles.tarjetaContenido}>
                              <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                                {alerta.tarjeta.nombre}
                              </Text>
                              <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                                {`${alerta.tarjeta.banco} •••• ${alerta.tarjeta.ultimosCuatroDigitos}`}
                              </Text>
                              <Text style={[styles.tarjetaFechas, { color: tema.colores.textoSecundario }]}>
                                {`Corte: día ${alerta.tarjeta.diaCorte} • Pago: día ${alerta.tarjeta.diaPago}`}
                              </Text>

                              <View style={[styles.estadoBadge, { backgroundColor: alerta.color }]}>
                                <Text style={styles.estadoTexto}>
                                  {esPendiente ? '⚠️' : '💡'} {alerta.mensaje}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Tarjetas seguras */}
                  {tarjetasSeguras.length > 0 && (
                    <View style={[styles.seccion, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                    }]}>
                      <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
                        ✅ Seguras para usar ({tarjetasSeguras.length})
                      </Text>

                      {tarjetasSeguras.map(({ tarjeta, estado }) => (
                        <View
                          key={tarjeta.id}
                          style={[styles.tarjetaCard, {
                            backgroundColor: tema.colores.fondo,
                            borderColor: tema.colores.bordes,
                          }]}
                        >
                          <View style={[styles.tarjetaBarra, { backgroundColor: tarjeta.color }]} />

                          <View style={styles.tarjetaContenido}>
                            <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                              {tarjeta.nombre}
                            </Text>
                            <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                              {`${tarjeta.banco} •••• ${tarjeta.ultimosCuatroDigitos}`}
                            </Text>
                            <Text style={[styles.tarjetaFechas, { color: tema.colores.textoSecundario }]}>
                              {`Corte: día ${tarjeta.diaCorte} • Pago: día ${tarjeta.diaPago}`}
                            </Text>

                            <View style={[styles.estadoBadge, { backgroundColor: estado.color }]}>
                              <Text style={styles.estadoTexto}>
                                ✓ {estado.mensaje}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ModalGestionarTarjetas
        visible={modalGestionVisible}
        onClose={() => setModalGestionVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  botonGestionar: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seccion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  vacio: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  tarjetaCard: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tarjetaBarra: {
    height: 6,
  },
  tarjetaContenido: {
    padding: 15,
  },
  tarjetaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaBanco: {
    fontSize: 13,
    marginBottom: 4,
  },
  tarjetaFechas: {
    fontSize: 12,
    marginBottom: 10,
  },
  estadoBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  estadoTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
