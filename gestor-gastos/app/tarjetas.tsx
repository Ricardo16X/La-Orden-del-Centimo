import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTema } from './src/context/TemaContext';
import { useTarjetas } from './src/context/TarjetasContext';
import { useCuotas } from './src/context/CuotasContext';
import { useGastos } from './src/context/GastosContext';
import { ModalAgregarTarjeta } from './src/components/ModalAgregarTarjeta';
import { ModalAgregarCuota } from './src/components/ModalAgregarCuota';
import { VistaProyeccionCuotas } from './src/components/VistaProyeccionCuotas';
import { SimuladorCuotas } from './src/components/SimuladorCuotas';
import { TarjetaCredito } from './src/types';
import { useNotificacionesTarjetas } from './src/hooks/useNotificacionesTarjetas';

export default function TarjetasScreen() {
  const { tema } = useTema();
  const { tarjetas, eliminarTarjeta, obtenerEstadoTarjeta, editarTarjeta } = useTarjetas();
  const { obtenerEstadisticasTarjeta, eliminarCuota, registrarPagoCuota } = useCuotas();
  const [modalTarjetaVisible, setModalTarjetaVisible] = useState(false);
  const [modalCuotaVisible, setModalCuotaVisible] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<{ id: string; nombre: string } | null>(null);
  const [tarjetaParaEditar, setTarjetaParaEditar] = useState<TarjetaCredito | null>(null);

  useNotificacionesTarjetas();

  const { gastos } = useGastos();

  // Calcula la fecha del último corte ocurrido (igual o antes de hoy)
  const obtenerUltimoCorte = (tarjeta: TarjetaCredito): Date => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dia = hoy.getDate();
    let mes = dia >= tarjeta.diaCorte ? hoy.getMonth() : hoy.getMonth() - 1;
    let anio = hoy.getFullYear();
    if (mes < 0) { mes = 11; anio -= 1; }
    const corte = new Date(anio, mes, tarjeta.diaCorte);
    corte.setHours(0, 0, 0, 0);
    return corte;
  };

  /**
   * Separa los gastos de la tarjeta en dos ventanas:
   *
   * consumoPendientePago: gastos del ciclo YA CERRADO (corte previo → último corte).
   *   Esto es lo que aparecerá en el estado de cuenta y debe pagarse antes del día de pago.
   *   Se pone en 0 si el usuario ya registró el pago de este corte.
   *
   * consumoCicloActual: gastos del ciclo ABIERTO (después del último corte → hoy).
   *   Estos NO se incluyen en el pago actual; se acumularán hasta el próximo corte.
   */
  const obtenerBalancesTarjeta = (tarjeta: TarjetaCredito) => {
    const ultimoCorte = obtenerUltimoCorte(tarjeta);

    const cortePrevio = new Date(ultimoCorte);
    cortePrevio.setMonth(cortePrevio.getMonth() - 1);

    // ¿Ya se registró el pago de este estado de cuenta?
    const yaPageado = tarjeta.ultimoPago
      ? new Date(tarjeta.ultimoPago) >= ultimoCorte
      : false;

    const gastosTarjeta = gastos.filter(g => g.tarjetaId === tarjeta.id && g.tipo === 'gasto');

    // Ciclo cerrado: desde el día después del corte previo hasta el último corte (inclusive)
    const consumoPendientePago = yaPageado ? 0 : gastosTarjeta
      .filter(g => {
        const f = new Date(g.fecha);
        f.setHours(0, 0, 0, 0);
        return f > cortePrevio && f <= ultimoCorte;
      })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);

    // Ciclo abierto: estrictamente después del último corte hasta hoy
    const consumoCicloActual = gastosTarjeta
      .filter(g => {
        const f = new Date(g.fecha);
        f.setHours(0, 0, 0, 0);
        return f > ultimoCorte;
      })
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);

    return { consumoPendientePago, consumoCicloActual, ultimoCorte, yaPageado };
  };

  const handleRegistrarPagoCiclo = (tarjeta: TarjetaCredito) => {
    const { consumoPendientePago, ultimoCorte } = obtenerBalancesTarjeta(tarjeta);
    Alert.alert(
      '💳 Registrar pago',
      `¿Confirmar pago de ${tema.moneda}${consumoPendientePago.toFixed(2)} de "${tarjeta.nombre}"?\n\nCorresponde al ciclo cerrado el día ${tarjeta.diaCorte}. Los gastos del nuevo ciclo no se incluyen.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar pago',
          onPress: () => {
            // Guardamos la fecha del CORTE pagado (no la de hoy) para que la lógica sea precisa
            editarTarjeta(tarjeta.id, { ultimoPago: ultimoCorte.toISOString() });
            Alert.alert('✅ Pago registrado', `El estado de cuenta quedó en ${tema.moneda}0.00.`);
          },
        },
      ]
    );
  };

  const handleEditar = (tarjeta: TarjetaCredito) => {
    setTarjetaParaEditar(tarjeta);
    setModalTarjetaVisible(true);
  };

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

                      {(() => {
                        const { consumoPendientePago, consumoCicloActual, yaPageado } = obtenerBalancesTarjeta(tarjeta);
                        const totalDeuda = consumoPendientePago + consumoCicloActual + estadisticasCuotas.totalPendiente;
                        const hayActividad = consumoPendientePago > 0 || consumoCicloActual > 0 || estadisticasCuotas.totalPendiente > 0 || yaPageado;

                        return (
                          <>
                            {hayActividad && (
                              <View style={[styles.utilizacionContainer, { backgroundColor: tema.colores.fondo }]}>

                                {/* Ciclo cerrado: lo que hay que pagar */}
                                {consumoPendientePago > 0 && (
                                  <View style={styles.utilizacionHeader}>
                                    <Text style={[styles.utilizacionLabel, { color: '#ef4444' }]}>
                                      💳 A pagar (vence día {tarjeta.diaPago})
                                    </Text>
                                    <Text style={[styles.utilizacionPorcentaje, { color: '#ef4444' }]}>
                                      {tema.moneda}{consumoPendientePago.toFixed(2)}
                                    </Text>
                                  </View>
                                )}

                                {/* Confirmación de pago ya registrado */}
                                {yaPageado && consumoPendientePago === 0 && (
                                  <Text style={[styles.utilizacionDetalle, { color: '#10b981', marginBottom: 4 }]}>
                                    ✅ Estado de cuenta pagado
                                  </Text>
                                )}

                                {/* Ciclo abierto: acumulando para el próximo corte */}
                                {consumoCicloActual > 0 && (
                                  <View style={styles.utilizacionHeader}>
                                    <Text style={[styles.utilizacionLabel, { color: tema.colores.textoSecundario }]}>
                                      🔄 Ciclo en curso (corta día {tarjeta.diaCorte})
                                    </Text>
                                    <Text style={[styles.utilizacionPorcentaje, { color: tema.colores.primario }]}>
                                      {tema.moneda}{consumoCicloActual.toFixed(2)}
                                    </Text>
                                  </View>
                                )}

                                {/* Barra de utilización (solo si hay límite configurado) */}
                                {tarjeta.limiteCredito && tarjeta.limiteCredito > 0 && (() => {
                                  const utilizacion = Math.min(totalDeuda / tarjeta.limiteCredito!, 1);
                                  const porcentaje = Math.round(utilizacion * 100);
                                  const colorBarra = utilizacion >= 0.8 ? '#ef4444' : utilizacion >= 0.5 ? '#f59e0b' : '#10b981';
                                  return (
                                    <>
                                      <View style={[styles.utilizacionSeparador, { backgroundColor: tema.colores.bordes }]} />
                                      <View style={styles.utilizacionHeader}>
                                        <Text style={[styles.utilizacionLabel, { color: tema.colores.textoSecundario }]}>
                                          Utilización del crédito
                                        </Text>
                                        <Text style={[styles.utilizacionPorcentaje, { color: colorBarra }]}>
                                          {porcentaje}%
                                        </Text>
                                      </View>
                                      <View style={[styles.utilizacionTrack, { backgroundColor: tema.colores.bordes }]}>
                                        <View style={[styles.utilizacionFill, {
                                          width: `${porcentaje}%` as any,
                                          backgroundColor: colorBarra,
                                        }]} />
                                      </View>
                                      <Text style={[styles.utilizacionDetalle, { color: tema.colores.textoSecundario }]}>
                                        {tema.moneda}{totalDeuda.toFixed(2)} de {tema.moneda}{tarjeta.limiteCredito!.toFixed(2)} disponibles
                                      </Text>
                                    </>
                                  );
                                })()}
                              </View>
                            )}

                            {/* Botón de pago: solo para el ciclo CERRADO */}
                            {consumoPendientePago > 0 && (
                              <TouchableOpacity
                                onPress={() => handleRegistrarPagoCiclo(tarjeta)}
                                style={[styles.botonPagarCiclo, { borderColor: '#10b981' }]}
                              >
                                <Text style={[styles.botonPagarCicloTexto, { color: '#10b981' }]}>
                                  ✓ Registrar pago · {tema.moneda}{consumoPendientePago.toFixed(2)}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        );
                      })()}
                    </View>

                    <View style={styles.accionesCard}>
                      <TouchableOpacity
                        onPress={() => handleEditar(tarjeta)}
                        style={styles.botonAccion}
                      >
                        <Text style={{ fontSize: 20 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEliminar(tarjeta.id, tarjeta.nombre)}
                        style={styles.botonAccion}
                      >
                        <Text style={styles.botonEliminarTexto}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
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
        onClose={() => {
          setModalTarjetaVisible(false);
          setTarjetaParaEditar(null);
        }}
        tarjetaEditar={tarjetaParaEditar ?? undefined}
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
  accionesCard: {
    gap: 4,
    alignItems: 'center',
  },
  botonAccion: {
    padding: 8,
  },
  utilizacionContainer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
  },
  utilizacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  utilizacionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  utilizacionPorcentaje: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  utilizacionTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  utilizacionFill: {
    height: 8,
    borderRadius: 4,
  },
  utilizacionDetalle: {
    fontSize: 10,
  },
  utilizacionSeparador: {
    height: 1,
    marginVertical: 6,
  },
  botonPagarCiclo: {
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  botonPagarCicloTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
});
