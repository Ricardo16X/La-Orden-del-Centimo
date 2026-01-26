import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTema } from './src/context/TemaContext';
import { useTarjetas } from './src/context/TarjetasContext';
import { useCuotas } from './src/context/CuotasContext';
import { ModalAgregarTarjeta } from './src/components/ModalAgregarTarjeta';
import { ModalAgregarCuota } from './src/components/ModalAgregarCuota';
import { VistaProyeccionCuotas } from './src/components/VistaProyeccionCuotas';
import { SimuladorCuotas } from './src/components/SimuladorCuotas';

export default function TarjetasScreen() {
  const { tema } = useTema();
  const { tarjetas, eliminarTarjeta, obtenerEstadoTarjeta } = useTarjetas();
  const { obtenerEstadisticasTarjeta, eliminarCuota, registrarPagoCuota } = useCuotas();
  const [modalTarjetaVisible, setModalTarjetaVisible] = useState(false);
  const [modalCuotaVisible, setModalCuotaVisible] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<{ id: string; nombre: string } | null>(null);

  const handleEliminar = (id: string, nombreTarjeta: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar la tarjeta ${nombreTarjeta}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarTarjeta(id);
            Alert.alert('Eliminada', 'Tarjeta eliminada correctamente');
          },
        },
      ]
    );
  };

  const handleAgregarCuota = (tarjetaId: string, nombreTarjeta: string) => {
    setTarjetaSeleccionada({ id: tarjetaId, nombre: nombreTarjeta });
    setModalCuotaVisible(true);
  };

  const handleEliminarCuota = (cuotaId: string, descripcion: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar la cuota "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarCuota(cuotaId);
            Alert.alert('Eliminada', 'Cuota eliminada correctamente');
          },
        },
      ]
    );
  };

  const handleRegistrarPago = (cuotaId: string, descripcion: string, cuotasPagadas: number, totalCuotas: number) => {
    if (cuotasPagadas >= totalCuotas) {
      Alert.alert('Info', 'Esta cuota ya está completamente pagada');
      return;
    }

    Alert.alert(
      'Registrar pago',
      `¿Confirmar pago de la cuota ${cuotasPagadas + 1}/${totalCuotas} de "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrar',
          onPress: () => {
            registrarPagoCuota(cuotaId);
            Alert.alert('Éxito', 'Pago registrado correctamente');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.botonVolver, { color: tema.colores.primario }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>💳 Mis Tarjetas</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Lista de Tarjetas */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tarjetas.length === 0 ? (
          // Estado vacío
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={[styles.emptyTitulo, { color: tema.colores.texto }]}>
              No tienes tarjetas registradas
            </Text>
            <Text style={[styles.emptyDescripcion, { color: tema.colores.textoSecundario }]}>
              Toca el botón ➕ para agregar tu primera tarjeta
            </Text>
          </View>
        ) : (
          // Lista de tarjetas
          <View>
            <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
              Gestiona tus tarjetas de crédito y mantén el control de fechas importantes
            </Text>

            {/* Proyección de cuotas */}
            <VistaProyeccionCuotas variant="full-width" />

            {/* Simulador de cuotas */}
            <SimuladorCuotas variant="full-width" />

            {tarjetas.map(tarjeta => {
              const estado = obtenerEstadoTarjeta(tarjeta);
              const estadisticasCuotas = obtenerEstadisticasTarjeta(tarjeta.id);

              return (
                <View
                  key={tarjeta.id}
                  style={[styles.tarjetaItem, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: tema.colores.bordes,
                  }]}
                >
                  <View style={[styles.tarjetaBarra, { backgroundColor: tarjeta.color }]} />

                  <View style={styles.tarjetaContenido}>
                    <View style={styles.tarjetaInfo}>
                      <Text style={[styles.tarjetaNombre, { color: tema.colores.texto }]}>
                        {tarjeta.nombre}
                      </Text>
                      <Text style={[styles.tarjetaBanco, { color: tema.colores.textoSecundario }]}>
                        {tarjeta.banco} ••{tarjeta.ultimosCuatroDigitos}
                      </Text>
                      <Text style={[styles.tarjetaFechas, { color: tema.colores.textoSecundario }]}>
                        Corte: {tarjeta.diaCorte} • Pago: {tarjeta.diaPago}
                      </Text>
                      <Text style={[styles.tarjetaEstado, { color: estado.color }]}>
                        {estado.mensaje}
                      </Text>

                      {/* Resumen de cuotas */}
                      {estadisticasCuotas.cuotasActivas > 0 && (
                        <View style={[styles.cuotasResumen, { backgroundColor: tema.colores.fondo }]}>
                          <Text style={[styles.cuotasTexto, { color: tema.colores.primario }]}>
                            📦 {estadisticasCuotas.cuotasActivas} compra{estadisticasCuotas.cuotasActivas !== 1 ? 's' : ''} a cuotas
                          </Text>
                          <Text style={[styles.cuotasMonto, { color: tema.colores.texto }]}>
                            {tema.moneda}{estadisticasCuotas.totalMensual.toFixed(2)}/mes
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleEliminar(tarjeta.id, tarjeta.nombre)}
                      style={styles.botonEliminar}
                    >
                      <Text style={styles.botonEliminarTexto}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Botón para agregar cuotas */}
                  <TouchableOpacity
                    onPress={() => handleAgregarCuota(tarjeta.id, tarjeta.nombre)}
                    style={[styles.botonAgregarCuota, { backgroundColor: tema.colores.fondo, borderColor: tema.colores.primario }]}
                  >
                    <Text style={[styles.botonAgregarCuotaTexto, { color: tema.colores.primario }]}>
                      📦 Agregar compra a cuotas
                    </Text>
                  </TouchableOpacity>

                  {/* Lista de cuotas activas */}
                  {estadisticasCuotas.cuotas.length > 0 && (
                    <View style={[styles.cuotasLista, { borderTopColor: tema.colores.bordes }]}>
                      <Text style={[styles.cuotasListaTitulo, { color: tema.colores.textoSecundario }]}>
                        Compras a cuotas:
                      </Text>
                      {estadisticasCuotas.cuotas.map(cuota => (
                        <View key={cuota.id} style={[styles.cuotaItem, { backgroundColor: tema.colores.fondo }]}>
                          <View style={styles.cuotaInfo}>
                            <Text style={[styles.cuotaDescripcion, { color: tema.colores.texto }]}>
                              {cuota.descripcion}
                            </Text>
                            <Text style={[styles.cuotaDetalle, { color: tema.colores.textoSecundario }]}>
                              {cuota.cuotasPagadas}/{cuota.cantidadCuotas} cuotas • {tema.moneda}{cuota.montoPorCuota}/mes
                            </Text>
                            <View style={styles.progresoBar}>
                              <View
                                style={[
                                  styles.progresoFill,
                                  {
                                    width: `${(cuota.cuotasPagadas / cuota.cantidadCuotas) * 100}%`,
                                    backgroundColor: tema.colores.primario
                                  }
                                ]}
                              />
                            </View>
                            {/* Botón para registrar pago manual */}
                            {cuota.cuotasPagadas < cuota.cantidadCuotas && (
                              <TouchableOpacity
                                onPress={() => handleRegistrarPago(cuota.id, cuota.descripcion, cuota.cuotasPagadas, cuota.cantidadCuotas)}
                                style={[styles.botonRegistrarPago, { backgroundColor: tema.colores.primario }]}
                              >
                                <Text style={styles.botonRegistrarPagoTexto}>
                                  ✓ Registrar cuota {cuota.cuotasPagadas + 1}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleEliminarCuota(cuota.id, cuota.descripcion)}
                            style={styles.botonEliminarCuota}
                          >
                            <Text style={styles.botonEliminarCuotaTexto}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Botón Flotante */}
      <TouchableOpacity
        style={[styles.botonFlotante, { backgroundColor: tema.colores.primario }]}
        onPress={() => setModalTarjetaVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.botonFlotanteTexto}>➕</Text>
      </TouchableOpacity>

      {/* Modal Agregar Tarjeta */}
      <ModalAgregarTarjeta
        visible={modalTarjetaVisible}
        onClose={() => setModalTarjetaVisible(false)}
      />

      {/* Modal Agregar Cuota */}
      {tarjetaSeleccionada && (
        <ModalAgregarCuota
          visible={modalCuotaVisible}
          onClose={() => {
            setModalCuotaVisible(false);
            setTarjetaSeleccionada(null);
          }}
          tarjetaId={tarjetaSeleccionada.id}
          nombreTarjeta={tarjetaSeleccionada.nombre}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  botonVolver: {
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  descripcion: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescripcion: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Tarjetas
  tarjetaItem: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tarjetaBarra: {
    height: 6,
  },
  tarjetaContenido: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  tarjetaInfo: {
    flex: 1,
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
    marginBottom: 6,
  },
  tarjetaEstado: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  botonEliminar: {
    padding: 10,
  },
  botonEliminarTexto: {
    fontSize: 24,
  },
  // Cuotas Resumen
  cuotasResumen: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  cuotasTexto: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  cuotasMonto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Botón Agregar Cuota
  botonAgregarCuota: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  botonAgregarCuotaTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Lista de Cuotas
  cuotasLista: {
    borderTopWidth: 2,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cuotasListaTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cuotaItem: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  cuotaInfo: {
    flex: 1,
  },
  cuotaDescripcion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cuotaDetalle: {
    fontSize: 12,
    marginBottom: 6,
  },
  progresoBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    borderRadius: 3,
  },
  botonEliminarCuota: {
    padding: 4,
    marginLeft: 8,
  },
  botonEliminarCuotaTexto: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  botonRegistrarPago: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  botonRegistrarPagoTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Botón Flotante
  botonFlotante: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  botonFlotanteTexto: {
    fontSize: 32,
    color: '#fff',
  },
});
