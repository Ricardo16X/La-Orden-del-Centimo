import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { useToast } from './src/context/ToastContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useGastos } from './src/context/GastosContext';
import { useMonedas } from './src/context/MonedasContext';
import { generarId } from './src/utils';
import { Gasto } from './src/types';

interface TransferenciaAgrupada {
  transferenciaId: string;
  fecha: string;
  gastoOrigen: Gasto;
  gastoDestino: Gasto;
}

export default function TransferenciasScreen() {
  const { tema } = useTema();
  const { showToast } = useToast();
  const { gastos, agregarGasto, eliminarGasto } = useGastos();
  const { monedas, monedaBase } = useMonedas();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [monedaOrigen, setMonedaOrigen] = useState('');
  const [monedaDestino, setMonedaDestino] = useState('');
  const [montoOrigen, setMontoOrigen] = useState('');
  const [montoDestino, setMontoDestino] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');

  const limpiarFormulario = () => {
    setMonedaOrigen('');
    setMonedaDestino('');
    setMontoOrigen('');
    setMontoDestino('');
    setTipoCambio('');
  };

  const obtenerSimboloMoneda = (codigo: string): string => {
    const m = monedas.find(mon => mon.codigo === codigo);
    return m?.simbolo || '$';
  };

  // Agrupar transferencias por transferenciaId
  const transferencias: TransferenciaAgrupada[] = (() => {
    const transferenciasMap = new Map<string, Gasto[]>();

    gastos
      .filter(g => g.esTransferencia && g.transferenciaId)
      .forEach(g => {
        const grupo = transferenciasMap.get(g.transferenciaId!) || [];
        grupo.push(g);
        transferenciasMap.set(g.transferenciaId!, grupo);
      });

    const resultado: TransferenciaAgrupada[] = [];
    transferenciasMap.forEach((grupo, id) => {
      const gastoOrigen = grupo.find(g => g.tipo === 'gasto');
      const gastoDestino = grupo.find(g => g.tipo === 'ingreso');
      if (gastoOrigen && gastoDestino) {
        resultado.push({
          transferenciaId: id,
          fecha: gastoOrigen.fecha,
          gastoOrigen,
          gastoDestino,
        });
      }
    });

    return resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  })();

  // TC siempre se muestra como el número "natural" (mayor), ej: 1 USD = 7.80 GTQ
  const calcularTipoCambioSugerido = (origen: string, destino: string): number => {
    const monOrigen = monedas.find(m => m.codigo === origen);
    const monDestino = monedas.find(m => m.codigo === destino);
    if (!monOrigen || !monDestino) return 1;
    const mayor = Math.max(monOrigen.tipoCambio, monDestino.tipoCambio);
    const menor = Math.min(monOrigen.tipoCambio, monDestino.tipoCambio);
    return menor > 0 ? mayor / menor : 1;
  };

  // ¿La moneda origen es la "fuerte" (mayor tipoCambio)?
  const esOrigenFuerte = (origen: string, destino: string): boolean => {
    const monO = monedas.find(m => m.codigo === origen);
    const monD = monedas.find(m => m.codigo === destino);
    if (!monO || !monD) return true;
    return monO.tipoCambio >= monD.tipoCambio;
  };

  // Calcula monto destino: si origen es la fuerte, multiplica; si no, divide
  const calcularMontoConTC = (monto: number, tc: number, origenFuerte: boolean): number => {
    return origenFuerte ? monto * tc : monto / tc;
  };

  // Monedas para la etiqueta del TC (siempre "1 [fuerte] = ? [débil]")
  const monedaFuerteCodigo = monedaOrigen && monedaDestino
    ? (esOrigenFuerte(monedaOrigen, monedaDestino) ? monedaOrigen : monedaDestino)
    : '';
  const monedaDebilCodigo = monedaOrigen && monedaDestino
    ? (esOrigenFuerte(monedaOrigen, monedaDestino) ? monedaDestino : monedaOrigen)
    : '';

  const handleSeleccionarOrigen = (codigo: string) => {
    setMonedaOrigen(codigo);
    if (monedaDestino && monedaDestino !== codigo) {
      const tc = calcularTipoCambioSugerido(codigo, monedaDestino);
      setTipoCambio(tc.toFixed(4));
      if (montoOrigen) {
        const origenF = esOrigenFuerte(codigo, monedaDestino);
        setMontoDestino(calcularMontoConTC(parseFloat(montoOrigen), tc, origenF).toFixed(2));
      }
    } else if (monedaDestino === codigo) {
      setMonedaDestino('');
      setTipoCambio('');
      setMontoDestino('');
    }
  };

  const handleSeleccionarDestino = (codigo: string) => {
    setMonedaDestino(codigo);
    if (monedaOrigen && monedaOrigen !== codigo) {
      const tc = calcularTipoCambioSugerido(monedaOrigen, codigo);
      setTipoCambio(tc.toFixed(4));
      if (montoOrigen) {
        const origenF = esOrigenFuerte(monedaOrigen, codigo);
        setMontoDestino(calcularMontoConTC(parseFloat(montoOrigen), tc, origenF).toFixed(2));
      }
    }
  };

  const handleMontoOrigenChange = (text: string) => {
    setMontoOrigen(text);
    const monto = parseFloat(text);
    const tc = parseFloat(tipoCambio);
    if (!isNaN(monto) && !isNaN(tc) && tc > 0 && monedaOrigen && monedaDestino) {
      const origenF = esOrigenFuerte(monedaOrigen, monedaDestino);
      setMontoDestino(calcularMontoConTC(monto, tc, origenF).toFixed(2));
    }
  };

  const handleTipoCambioChange = (text: string) => {
    setTipoCambio(text);
    const monto = parseFloat(montoOrigen);
    const tc = parseFloat(text);
    if (!isNaN(monto) && !isNaN(tc) && tc > 0 && monedaOrigen && monedaDestino) {
      const origenF = esOrigenFuerte(monedaOrigen, monedaDestino);
      setMontoDestino(calcularMontoConTC(monto, tc, origenF).toFixed(2));
    }
  };

  const handleMontoDestinoChange = (text: string) => {
    setMontoDestino(text);
    const montoOrig = parseFloat(montoOrigen);
    const montoDest = parseFloat(text);
    if (!isNaN(montoOrig) && montoOrig > 0 && !isNaN(montoDest) && monedaOrigen && monedaDestino) {
      const origenF = esOrigenFuerte(monedaOrigen, monedaDestino);
      const nuevoTC = origenF ? montoDest / montoOrig : montoOrig / montoDest;
      setTipoCambio(nuevoTC.toFixed(4));
    }
  };

  const handleGuardar = () => {
    if (!monedaOrigen || !monedaDestino) {
      Alert.alert('Error', 'Selecciona ambas monedas');
      return;
    }
    if (monedaOrigen === monedaDestino) {
      Alert.alert('Error', 'Las monedas deben ser diferentes');
      return;
    }
    const mOrigen = parseFloat(montoOrigen);
    const mDestino = parseFloat(montoDestino);
    if (isNaN(mOrigen) || mOrigen <= 0) {
      Alert.alert('Error', 'Ingresa un monto de origen válido');
      return;
    }
    if (isNaN(mDestino) || mDestino <= 0) {
      Alert.alert('Error', 'Ingresa un monto de destino válido');
      return;
    }

    const transferenciaId = generarId();
    const simOrigen = obtenerSimboloMoneda(monedaOrigen);
    const simDestino = obtenerSimboloMoneda(monedaDestino);
    const descripcion = `${simOrigen}${mOrigen.toFixed(2)} ${monedaOrigen} → ${simDestino}${mDestino.toFixed(2)} ${monedaDestino}`;

    // Gasto en moneda origen (sale dinero)
    agregarGasto({
      monto: mOrigen,
      descripcion,
      categoria: 'transferencia',
      tipo: 'gasto',
      moneda: monedaOrigen,
      esTransferencia: true,
      transferenciaId,
    });

    // Ingreso en moneda destino (entra dinero)
    agregarGasto({
      monto: mDestino,
      descripcion,
      categoria: 'transferencia',
      tipo: 'ingreso',
      moneda: monedaDestino,
      esTransferencia: true,
      transferenciaId,
    });

    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleEliminar = (transferencia: TransferenciaAgrupada) => {
    Alert.alert(
      'Eliminar transferencia',
      '¿Estás seguro de eliminar esta transferencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarGasto(transferencia.gastoOrigen.id);
            eliminarGasto(transferencia.gastoDestino.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!mostrarFormulario ? (
          <>
            {/* Lista de transferencias */}
            {transferencias.length > 0 ? (
              <View style={styles.lista}>
                {transferencias.map(t => {
                  const simOrigen = obtenerSimboloMoneda(t.gastoOrigen.moneda || '');
                  const simDestino = obtenerSimboloMoneda(t.gastoDestino.moneda || '');
                  const fecha = new Date(t.fecha).toLocaleDateString('es');

                  return (
                    <View
                      key={t.transferenciaId}
                      style={[styles.item, {
                        backgroundColor: tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }]}
                    >
                      <Text style={styles.itemEmoji}>💱</Text>
                      <View style={styles.itemInfo}>
                        <View style={styles.itemMontos}>
                          <Text style={[styles.itemMontoOrigen, { color: '#ef4444' }]}>
                            -{simOrigen}{t.gastoOrigen.monto.toFixed(2)} {t.gastoOrigen.moneda}
                          </Text>
                          <Text style={[styles.itemFlecha, { color: tema.colores.textoSecundario }]}>→</Text>
                          <Text style={[styles.itemMontoDestino, { color: '#10b981' }]}>
                            +{simDestino}{t.gastoDestino.monto.toFixed(2)} {t.gastoDestino.moneda}
                          </Text>
                        </View>
                        <Text style={[styles.itemFecha, { color: tema.colores.textoSecundario }]}>
                          {fecha}
                          {t.gastoOrigen.monto > 0 && (
                            ` • TC: ${(t.gastoDestino.monto / t.gastoOrigen.monto).toFixed(4)}`
                          )}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleEliminar(t)}
                        style={styles.botonEliminar}
                      >
                        <Text style={{ fontSize: 20 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EstadoVacio
                emoji="💱"
                titulo="Sin transferencias"
                subtitulo="Registra cambios de divisa para mantener tu balance por moneda actualizado"
              />
            )}

            <BotonAnimado
              style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
              onPress={() => {
                if (monedas.length < 2) {
                  showToast('Necesitas al menos 2 monedas para transferir. Configúralas en Perfil → Monedas', 'info');
                  return;
                }
                setMostrarFormulario(true);
              }}
            >
              <Text style={styles.botonAgregarTexto}>+ Nueva Transferencia</Text>
            </BotonAnimado>
          </>
        ) : (
          <>
            {/* Formulario */}
            <View style={styles.formulario}>
              {/* Moneda origen */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda de origen</Text>
              <View style={styles.monedasContainer}>
                {monedas.map(m => (
                  <TouchableOpacity
                    key={m.codigo}
                    style={[styles.monedaBoton, {
                      backgroundColor: monedaOrigen === m.codigo ? '#ef4444' : tema.colores.fondoSecundario,
                      borderColor: monedaOrigen === m.codigo ? '#ef4444' : tema.colores.bordes,
                    }]}
                    onPress={() => handleSeleccionarOrigen(m.codigo)}
                  >
                    <Text style={[styles.monedaTexto, {
                      color: monedaOrigen === m.codigo ? '#fff' : tema.colores.texto,
                    }]}>
                      {m.simbolo} {m.codigo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Monto origen */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>
                Monto a convertir {monedaOrigen ? `(${monedaOrigen})` : ''}
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                value={montoOrigen}
                onChangeText={handleMontoOrigenChange}
                keyboardType="decimal-pad"
              />

              {/* Moneda destino */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda de destino</Text>
              <View style={styles.monedasContainer}>
                {monedas
                  .filter(m => m.codigo !== monedaOrigen)
                  .map(m => (
                    <TouchableOpacity
                      key={m.codigo}
                      style={[styles.monedaBoton, {
                        backgroundColor: monedaDestino === m.codigo ? '#10b981' : tema.colores.fondoSecundario,
                        borderColor: monedaDestino === m.codigo ? '#10b981' : tema.colores.bordes,
                      }]}
                      onPress={() => handleSeleccionarDestino(m.codigo)}
                    >
                      <Text style={[styles.monedaTexto, {
                        color: monedaDestino === m.codigo ? '#fff' : tema.colores.texto,
                      }]}>
                        {m.simbolo} {m.codigo}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Tipo de cambio */}
              {monedaOrigen && monedaDestino && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    Tipo de cambio (1 {monedaFuerteCodigo} = ? {monedaDebilCodigo})
                  </Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="0.0000"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={tipoCambio}
                    onChangeText={handleTipoCambioChange}
                    keyboardType="decimal-pad"
                  />

                  {/* Monto destino */}
                  <Text style={[styles.label, { color: tema.colores.texto }]}>
                    Monto recibido ({monedaDestino})
                  </Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="0.00"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={montoDestino}
                    onChangeText={handleMontoDestinoChange}
                    keyboardType="decimal-pad"
                  />

                  {/* Preview */}
                  {montoOrigen && montoDestino && (
                    <View style={[styles.preview, {
                      backgroundColor: `${tema.colores.primario}15`,
                      borderColor: tema.colores.primario,
                    }]}>
                      <Text style={[styles.previewTexto, { color: tema.colores.texto }]}>
                        {obtenerSimboloMoneda(monedaOrigen)}{parseFloat(montoOrigen || '0').toFixed(2)} {monedaOrigen}
                        {' → '}
                        {obtenerSimboloMoneda(monedaDestino)}{parseFloat(montoDestino || '0').toFixed(2)} {monedaDestino}
                      </Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.botonesFormulario}>
                <TouchableOpacity
                  style={[styles.botonCancelar, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: tema.colores.bordes,
                  }]}
                  onPress={() => {
                    limpiarFormulario();
                    setMostrarFormulario(false);
                  }}
                >
                  <Text style={[styles.botonCancelarTexto, { color: tema.colores.texto }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <BotonAnimado
                  style={[styles.botonGuardar, { backgroundColor: tema.colores.primario }]}
                  onPress={handleGuardar}
                >
                  <Text style={styles.botonGuardarTexto}>Transferir</Text>
                </BotonAnimado>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lista: {
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemMontos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemMontoOrigen: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemFlecha: {
    fontSize: 14,
  },
  itemMontoDestino: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemFecha: {
    fontSize: 12,
    marginTop: 4,
  },
  botonEliminar: {
    marginLeft: 8,
  },
  botonAgregar: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formulario: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  monedasContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  monedaBoton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  monedaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  preview: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  previewTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  botonCancelar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
