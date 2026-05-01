import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useGastosRecurrentes } from './src/context/GastosRecurrentesContext';
import { useCategorias } from './src/context/CategoriasContext';
import { useMonedas } from './src/context/MonedasContext';
import { useTarjetas } from './src/context/TarjetasContext';
import { GastoRecurrente, FrecuenciaGastoRecurrente } from './src/types';

export default function GastosRecurrentesScreen() {
  const { tema } = useTema();
  const { gastosRecurrentes, agregarGastoRecurrente, eliminarGastoRecurrente, toggleGastoRecurrente } = useGastosRecurrentes();
  const { categorias } = useCategorias();
  const { monedas, monedaBase, convertirAMonedaBase } = useMonedas();
  const { tarjetas } = useTarjetas();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || '');
  const [moneda, setMoneda] = useState(monedaBase?.codigo || '');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaGastoRecurrente>('mensual');
  const [diaSemana, setDiaSemana] = useState(2);
  const [diaMes, setDiaMes] = useState('');
  const [tarjetaId, setTarjetaId] = useState<string | undefined>(undefined);

  const limpiarFormulario = () => {
    setDescripcion('');
    setMonto('');
    setCategoriaId(categorias[0]?.id || '');
    setMoneda(monedaBase?.codigo || '');
    setFrecuencia('mensual');
    setDiaSemana(2);
    setDiaMes('');
    setTarjetaId(undefined);
  };

  const calcularProximaFecha = (): string => {
    const hoy = new Date();
    const manana = new Date(hoy);

    switch (frecuencia) {
      case 'diario':
        manana.setDate(hoy.getDate() + 1);
        return manana.toISOString();
      case 'semanal': {
        const diaActual = hoy.getDay() + 1;
        let diasHasta = diaSemana - diaActual;
        if (diasHasta <= 0) diasHasta += 7;
        const proxima = new Date(hoy);
        proxima.setDate(hoy.getDate() + diasHasta);
        return proxima.toISOString();
      }
      case 'mensual': {
        const diaNum = parseInt(diaMes) || 1;
        const proxima = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        const ultimoDia = new Date(proxima.getFullYear(), proxima.getMonth() + 1, 0).getDate();
        proxima.setDate(Math.min(diaNum, ultimoDia));
        return proxima.toISOString();
      }
    }
  };

  const handleAgregar = () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Ingresa una descripción');
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (!categoriaId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    agregarGastoRecurrente({
      descripcion,
      monto: montoNum,
      categoriaId,
      moneda: moneda || monedaBase?.codigo || '',
      frecuencia,
      activo: true,
      proximaFecha: calcularProximaFecha(),
      ...(frecuencia === 'semanal' && { diaSemana }),
      ...(frecuencia === 'mensual' && { diaMes: parseInt(diaMes) || 1 }),
      ...(tarjetaId && { tarjetaId }),
    });

    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleEliminar = (gr: GastoRecurrente) => {
    Alert.alert(
      'Eliminar gasto recurrente',
      `¿Estás seguro de eliminar "${gr.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarGastoRecurrente(gr.id) },
      ]
    );
  };

  const obtenerEtiquetaFrecuencia = (freq: FrecuenciaGastoRecurrente): string => {
    switch (freq) {
      case 'diario':  return '📅 Diario';
      case 'semanal': return '🗓️ Semanal';
      case 'mensual': return '📆 Mensual';
    }
  };

  const obtenerNombreDiaSemana = (dia: number): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia - 1] || 'Lunes';
  };

  const obtenerSimboloMoneda = (monedaCodigo: string): string => {
    const m = monedas.find(mon => mon.codigo === monedaCodigo);
    return m?.simbolo || monedaBase?.simbolo || '$';
  };

  const obtenerCategoria = (catId: string) => categorias.find(c => c.id === catId);
  const obtenerTarjeta = (tId: string) => tarjetas.find(t => t.id === tId);

  const DIAS_SEMANA = [
    { valor: 1, nombre: 'Dom' },
    { valor: 2, nombre: 'Lun' },
    { valor: 3, nombre: 'Mar' },
    { valor: 4, nombre: 'Mié' },
    { valor: 5, nombre: 'Jue' },
    { valor: 6, nombre: 'Vie' },
    { valor: 7, nombre: 'Sáb' },
  ];

  const calcularEquivalenteMensual = (gr: GastoRecurrente): number => {
    switch (gr.frecuencia) {
      case 'diario':  return gr.monto * 30;
      case 'semanal': return gr.monto * 52 / 12;
      case 'mensual': return gr.monto;
    }
  };

  const activos = gastosRecurrentes.filter(gr => gr.activo);
  const porMoneda: Record<string, { monto: number; count: number; simbolo: string }> = {};
  let totalEnBase = 0;
  activos.forEach(gr => {
    const eq = calcularEquivalenteMensual(gr);
    if (!porMoneda[gr.moneda]) {
      porMoneda[gr.moneda] = { monto: 0, count: 0, simbolo: obtenerSimboloMoneda(gr.moneda) };
    }
    porMoneda[gr.moneda].monto += eq;
    porMoneda[gr.moneda].count += 1;
    totalEnBase += convertirAMonedaBase(eq, gr.moneda);
  });
  const monedasUsadas = Object.entries(porMoneda);

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Resumen mensual */}
        {activos.length > 0 && (
          <View style={[styles.resumen, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>
              Estimado mensual · {activos.length} {activos.length === 1 ? 'activo' : 'activos'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                {monedasUsadas.map(([codigo, data]) => (
                  <View key={codigo} style={[styles.tarjetaMoneda, {
                    backgroundColor: tema.colores.fondo,
                    borderColor: tema.colores.primario + '44',
                  }]}>
                    <Text style={[styles.tarjetaCodigo, { color: tema.colores.textoSecundario }]}>
                      {codigo}
                    </Text>
                    <Text style={[styles.tarjetaMonto, { color: tema.colores.primario }]}>
                      {data.simbolo}{data.monto.toFixed(2)}
                    </Text>
                    <Text style={[styles.tarjetaCount, { color: tema.colores.textoSecundario }]}>
                      {data.count} {data.count === 1 ? 'gasto' : 'gastos'}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            {monedasUsadas.length > 1 && (
              <>
                <View style={[styles.separador, { backgroundColor: tema.colores.bordes }]} />
                <View style={styles.totalFila}>
                  <Text style={[styles.totalLabel, { color: tema.colores.textoSecundario }]}>
                    Total en {monedaBase?.codigo}
                  </Text>
                  <Text style={[styles.totalValor, { color: tema.colores.primario }]}>
                    ≈ {monedaBase?.simbolo}{totalEnBase.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Lista */}
        {gastosRecurrentes.length > 0 ? (
          <View style={styles.lista}>
            {gastosRecurrentes.map(gr => {
              const cat = obtenerCategoria(gr.categoriaId);
              const tarjeta = gr.tarjetaId ? obtenerTarjeta(gr.tarjetaId) : undefined;
              const simbolo = obtenerSimboloMoneda(gr.moneda);
              const proximaFecha = new Date(gr.proximaFecha).toLocaleDateString('es');
              const accentColor = tarjeta ? tarjeta.color : (cat ? tema.colores.primario : tema.colores.bordes);

              return (
                <View
                  key={gr.id}
                  style={[styles.card, {
                    backgroundColor: tema.colores.fondoSecundario,
                    borderColor: tema.colores.bordes,
                    opacity: gr.activo ? 1 : 0.55,
                  }]}
                >
                  <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardEmoji}>{cat?.emoji || '💸'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitulo, { color: tema.colores.texto }]} numberOfLines={1}>
                          {gr.descripcion}
                        </Text>
                        <Text style={[styles.cardCategoria, { color: tema.colores.textoSecundario }]}>
                          {cat?.nombre || 'Sin categoría'}
                        </Text>
                      </View>
                      <View style={styles.cardAcciones}>
                        <Switch
                          value={gr.activo}
                          onValueChange={() => toggleGastoRecurrente(gr.id)}
                          trackColor={{ false: tema.colores.bordes, true: tema.colores.primarioClaro }}
                          thumbColor={gr.activo ? tema.colores.primario : tema.colores.texto}
                        />
                        <TouchableOpacity onPress={() => handleEliminar(gr)} style={{ marginTop: 6 }}>
                          <Text style={{ fontSize: 18 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={[styles.cardMonto, { color: tema.colores.primario }]}>
                        {simbolo}{gr.monto.toFixed(2)}
                      </Text>
                      <View style={styles.cardBadges}>
                        <View style={[styles.badge, { backgroundColor: tema.colores.primario + '22' }]}>
                          <Text style={[styles.badgeText, { color: tema.colores.primario }]}>
                            {obtenerEtiquetaFrecuencia(gr.frecuencia)}
                            {gr.frecuencia === 'semanal' && gr.diaSemana ? ` · ${obtenerNombreDiaSemana(gr.diaSemana)}` : ''}
                            {gr.frecuencia === 'mensual' && gr.diaMes ? ` · Día ${gr.diaMes}` : ''}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: tema.colores.bordes + '55' }]}>
                          <Text style={[styles.badgeText, { color: tema.colores.textoSecundario }]}>
                            🔔 {proximaFecha}
                          </Text>
                        </View>
                        {tarjeta && (
                          <View style={[styles.badge, { backgroundColor: tarjeta.color + '33' }]}>
                            <Text style={[styles.badgeText, { color: tarjeta.color }]}>
                              💳 {tarjeta.nombre}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EstadoVacio
            emoji="🔁"
            titulo="Sin gastos recurrentes"
            subtitulo="Agrega tus suscripciones y gastos fijos para que se registren automáticamente"
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: tema.colores.primario }]}
        onPress={() => {
          limpiarFormulario();
          setMostrarFormulario(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabTexto}>＋</Text>
      </TouchableOpacity>

      {/* Bottom sheet modal — formulario */}
      <Modal
        visible={mostrarFormulario}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarFormulario(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMostrarFormulario(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrapper}
        >
          <View style={[styles.sheet, { backgroundColor: tema.colores.fondoSecundario }]}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: tema.colores.bordes }]} />

            <Text style={[styles.sheetTitulo, { color: tema.colores.texto }]}>
              Nuevo gasto recurrente
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={[styles.label, { color: tema.colores.texto }]}>Descripción</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondo,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="Ej: Netflix, Alquiler, Internet"
                placeholderTextColor={tema.colores.textoSecundario}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Monto</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondo,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                value={monto}
                onChangeText={setMonto}
                keyboardType="decimal-pad"
              />

              <Text style={[styles.label, { color: tema.colores.texto }]}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {categorias.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, {
                        backgroundColor: categoriaId === cat.id ? tema.colores.primario : tema.colores.fondo,
                        borderColor: categoriaId === cat.id ? tema.colores.primario : tema.colores.bordes,
                      }]}
                      onPress={() => setCategoriaId(cat.id)}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                      <Text style={[styles.chipTexto, {
                        color: categoriaId === cat.id ? '#fff' : tema.colores.texto,
                      }]} numberOfLines={1}>
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {monedas.length > 1 && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {monedas.map(m => (
                      <TouchableOpacity
                        key={m.codigo}
                        style={[styles.chip, {
                          flex: 1,
                          justifyContent: 'center',
                          backgroundColor: moneda === m.codigo ? tema.colores.primario : tema.colores.fondo,
                          borderColor: moneda === m.codigo ? tema.colores.primario : tema.colores.bordes,
                        }]}
                        onPress={() => setMoneda(m.codigo)}
                      >
                        <Text style={[styles.chipTexto, {
                          color: moneda === m.codigo ? '#fff' : tema.colores.texto,
                        }]}>
                          {m.simbolo} {m.codigo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {tarjetas.length > 0 && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Tarjeta de crédito</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {/* Opción "Sin tarjeta" */}
                      <TouchableOpacity
                        style={[styles.chip, {
                          backgroundColor: !tarjetaId ? tema.colores.primario : tema.colores.fondo,
                          borderColor: !tarjetaId ? tema.colores.primario : tema.colores.bordes,
                        }]}
                        onPress={() => setTarjetaId(undefined)}
                      >
                        <Text style={{ fontSize: 16 }}>💵</Text>
                        <Text style={[styles.chipTexto, { color: !tarjetaId ? '#fff' : tema.colores.texto }]}>
                          Efectivo
                        </Text>
                      </TouchableOpacity>
                      {tarjetas.map(t => (
                        <TouchableOpacity
                          key={t.id}
                          style={[styles.chip, {
                            backgroundColor: tarjetaId === t.id ? t.color : tema.colores.fondo,
                            borderColor: tarjetaId === t.id ? t.color : tema.colores.bordes,
                          }]}
                          onPress={() => setTarjetaId(t.id)}
                        >
                          <Text style={{ fontSize: 16 }}>💳</Text>
                          <Text style={[styles.chipTexto, {
                            color: tarjetaId === t.id ? '#fff' : tema.colores.texto,
                          }]} numberOfLines={1}>
                            {t.nombre}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              <Text style={[styles.label, { color: tema.colores.texto }]}>Frecuencia</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['diario', 'semanal', 'mensual'] as FrecuenciaGastoRecurrente[]).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.chip, {
                      flex: 1,
                      justifyContent: 'center',
                      backgroundColor: frecuencia === freq ? tema.colores.primario : tema.colores.fondo,
                      borderColor: frecuencia === freq ? tema.colores.primario : tema.colores.bordes,
                    }]}
                    onPress={() => setFrecuencia(freq)}
                  >
                    <Text style={[styles.chipTexto, {
                      color: frecuencia === freq ? '#fff' : tema.colores.texto,
                    }]}>
                      {freq === 'diario' ? '📅 Diario' : freq === 'semanal' ? '🗓️ Semanal' : '📆 Mensual'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {frecuencia === 'semanal' && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Día de la semana</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {DIAS_SEMANA.map(dia => (
                        <TouchableOpacity
                          key={dia.valor}
                          style={[styles.chipDia, {
                            backgroundColor: diaSemana === dia.valor ? tema.colores.primario : tema.colores.fondo,
                            borderColor: diaSemana === dia.valor ? tema.colores.primario : tema.colores.bordes,
                          }]}
                          onPress={() => setDiaSemana(dia.valor)}
                        >
                          <Text style={[styles.chipTexto, {
                            color: diaSemana === dia.valor ? '#fff' : tema.colores.texto,
                          }]}>
                            {dia.nombre}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {frecuencia === 'mensual' && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Día del mes</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondo,
                      borderColor: tema.colores.bordes,
                      color: tema.colores.texto,
                    }]}
                    placeholder="1"
                    placeholderTextColor={tema.colores.textoSecundario}
                    value={diaMes}
                    onChangeText={(text) => {
                      if (text === '') {
                        setDiaMes('');
                      } else {
                        const dia = parseInt(text);
                        if (!isNaN(dia) && dia >= 1 && dia <= 31) setDiaMes(text);
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.ayuda, { color: tema.colores.textoSecundario }]}>
                    Si el mes no tiene este día, se usará el último día del mes
                  </Text>
                </>
              )}

              <View style={styles.botonesFormulario}>
                <TouchableOpacity
                  style={[styles.botonCancelar, {
                    backgroundColor: tema.colores.fondo,
                    borderColor: tema.colores.bordes,
                  }]}
                  onPress={() => {
                    limpiarFormulario();
                    setMostrarFormulario(false);
                  }}
                >
                  <Text style={[styles.botonCancelarTexto, { color: tema.colores.texto }]}>Cancelar</Text>
                </TouchableOpacity>
                <BotonAnimado
                  style={[styles.botonGuardar, { backgroundColor: tema.colores.primario }]}
                  onPress={handleAgregar}
                >
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                </BotonAnimado>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  resumen: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  resumenLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tarjetaMoneda: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
    gap: 2,
  },
  tarjetaCodigo: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tarjetaMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  tarjetaCount: {
    fontSize: 11,
  },
  separador: {
    height: 1,
    marginVertical: 10,
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lista: {
    gap: 10,
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardCategoria: {
    fontSize: 12,
    marginTop: 1,
  },
  cardAcciones: {
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardMonto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabTexto: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipDia: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 50,
    alignItems: 'center',
  },
  ayuda: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  botonesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
