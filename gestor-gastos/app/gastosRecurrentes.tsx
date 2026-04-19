import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTema } from './src/context/TemaContext';
import { EstadoVacio } from './src/components/EstadoVacio';
import { BotonAnimado } from './src/components/BotonAnimado';
import { useGastosRecurrentes } from './src/context/GastosRecurrentesContext';
import { useCategorias } from './src/context/CategoriasContext';
import { useMonedas } from './src/context/MonedasContext';
import { GastoRecurrente, FrecuenciaGastoRecurrente } from './src/types';

export default function GastosRecurrentesScreen() {
  const { tema } = useTema();
  const { gastosRecurrentes, agregarGastoRecurrente, eliminarGastoRecurrente, toggleGastoRecurrente } = useGastosRecurrentes();
  const { categorias } = useCategorias();
  const { monedas, monedaBase, convertirAMonedaBase } = useMonedas();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || '');
  const [moneda, setMoneda] = useState(monedaBase?.codigo || '');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaGastoRecurrente>('mensual');
  const [diaSemana, setDiaSemana] = useState(2); // Lunes
  const [diaMes, setDiaMes] = useState('');

  const limpiarFormulario = () => {
    setDescripcion('');
    setMonto('');
    setCategoriaId(categorias[0]?.id || '');
    setMoneda(monedaBase?.codigo || '');
    setFrecuencia('mensual');
    setDiaSemana(2);
    setDiaMes('');
  };

  const calcularProximaFecha = (): string => {
    const hoy = new Date();
    const manana = new Date(hoy);

    switch (frecuencia) {
      case 'diario':
        manana.setDate(hoy.getDate() + 1);
        return manana.toISOString();
      case 'semanal': {
        // Encontrar el próximo día de la semana seleccionado
        const diaActual = hoy.getDay() + 1; // 1=Domingo, 7=Sábado
        let diasHasta = diaSemana - diaActual;
        if (diasHasta <= 0) diasHasta += 7;
        const proxima = new Date(hoy);
        proxima.setDate(hoy.getDate() + diasHasta);
        return proxima.toISOString();
      }
      case 'mensual': {
        // Próximo mes en el día seleccionado
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
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarGastoRecurrente(gr.id),
        },
      ]
    );
  };

  const obtenerEtiquetaFrecuencia = (freq: FrecuenciaGastoRecurrente): string => {
    switch (freq) {
      case 'diario': return 'Diario';
      case 'semanal': return 'Semanal';
      case 'mensual': return 'Mensual';
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

  const obtenerCategoria = (catId: string) => {
    return categorias.find(c => c.id === catId);
  };

  const DIAS_SEMANA = [
    { valor: 1, nombre: 'Dom' },
    { valor: 2, nombre: 'Lun' },
    { valor: 3, nombre: 'Mar' },
    { valor: 4, nombre: 'Mié' },
    { valor: 5, nombre: 'Jue' },
    { valor: 6, nombre: 'Vie' },
    { valor: 7, nombre: 'Sáb' },
  ];

  // Calcular equivalente mensual de un gasto recurrente
  const calcularEquivalenteMensual = (gr: GastoRecurrente): number => {
    switch (gr.frecuencia) {
      case 'diario': return gr.monto * 30;
      case 'semanal': return gr.monto * 52 / 12;
      case 'mensual': return gr.monto;
    }
  };

  // Agrupar activos por moneda y calcular total en moneda base
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tema.colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Resumen mensual */}
        {activos.length > 0 && (
          <View style={[styles.resumen, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}>
            <Text style={[styles.resumenLabel, { color: tema.colores.textoSecundario }]}>
              Estimado mensual · {activos.length} activos
            </Text>

            {/* Tarjetas por moneda */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carruselMonedas}>
              <View style={styles.carruselContenido}>
                {monedasUsadas.map(([codigo, data]) => (
                  <View
                    key={codigo}
                    style={[styles.tarjetaMoneda, {
                      backgroundColor: tema.colores.fondo,
                      borderColor: tema.colores.primario + '44',
                    }]}
                  >
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

            {/* Total en moneda base — solo si hay más de una moneda */}
            {monedasUsadas.length > 1 && (
              <>
                <View style={[styles.resumenSeparador, { backgroundColor: tema.colores.bordes }]} />
                <View style={styles.resumenTotalFila}>
                  <Text style={[styles.resumenTotalLabel, { color: tema.colores.textoSecundario }]}>
                    Total en {monedaBase?.codigo}
                  </Text>
                  <Text style={[styles.resumenTotalValor, { color: tema.colores.primario }]}>
                    ≈ {monedaBase?.simbolo}{totalEnBase.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {!mostrarFormulario ? (
          <>
            {/* Lista */}
            {gastosRecurrentes.length > 0 ? (
              <View style={styles.lista}>
                {gastosRecurrentes.map(gr => {
                  const cat = obtenerCategoria(gr.categoriaId);
                  const simbolo = obtenerSimboloMoneda(gr.moneda);
                  const proximaFecha = new Date(gr.proximaFecha).toLocaleDateString('es');

                  return (
                    <View
                      key={gr.id}
                      style={[styles.item, {
                        backgroundColor: tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                        opacity: gr.activo ? 1 : 0.5,
                      }]}
                    >
                      <Text style={styles.itemEmoji}>{cat?.emoji || '💸'}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemTitulo, { color: tema.colores.texto }]}>
                          {gr.descripcion}
                        </Text>
                        <Text style={[styles.itemMonto, { color: tema.colores.primario }]}>
                          {simbolo}{gr.monto.toFixed(2)}
                        </Text>
                        <Text style={[styles.itemDetalle, { color: tema.colores.textoSecundario }]}>
                          {obtenerEtiquetaFrecuencia(gr.frecuencia)}
                          {gr.frecuencia === 'semanal' && gr.diaSemana && ` • ${obtenerNombreDiaSemana(gr.diaSemana)}`}
                          {gr.frecuencia === 'mensual' && gr.diaMes && ` • Día ${gr.diaMes}`}
                          {` • Próximo: ${proximaFecha}`}
                        </Text>
                      </View>
                      <View style={styles.itemAcciones}>
                        <Switch
                          value={gr.activo}
                          onValueChange={() => toggleGastoRecurrente(gr.id)}
                          trackColor={{ false: tema.colores.bordes, true: tema.colores.primarioClaro }}
                          thumbColor={gr.activo ? tema.colores.primario : tema.colores.texto}
                        />
                        <TouchableOpacity
                          onPress={() => handleEliminar(gr)}
                          style={styles.botonEliminar}
                        >
                          <Text style={{ fontSize: 20 }}>🗑️</Text>
                        </TouchableOpacity>
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

            <BotonAnimado
              style={[styles.botonAgregar, { backgroundColor: tema.colores.primario }]}
              onPress={() => setMostrarFormulario(true)}
            >
              <Text style={styles.botonAgregarTexto}>+ Nuevo Gasto Recurrente</Text>
            </BotonAnimado>
          </>
        ) : (
          <>
            {/* Formulario */}
            <View style={styles.formulario}>
              <Text style={[styles.label, { color: tema.colores.texto }]}>Descripción</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: tema.colores.fondoSecundario,
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
                  backgroundColor: tema.colores.fondoSecundario,
                  borderColor: tema.colores.bordes,
                  color: tema.colores.texto,
                }]}
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                value={monto}
                onChangeText={setMonto}
                keyboardType="decimal-pad"
              />

              {/* Selector de categoría */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
                <View style={styles.categoriasContainer}>
                  {categorias.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoriaBoton, {
                        backgroundColor: categoriaId === cat.id ? tema.colores.primario : tema.colores.fondoSecundario,
                        borderColor: tema.colores.bordes,
                      }]}
                      onPress={() => setCategoriaId(cat.id)}
                    >
                      <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.categoriaTexto, {
                        color: categoriaId === cat.id ? '#fff' : tema.colores.texto,
                      }]} numberOfLines={1}>
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Selector de moneda */}
              {monedas.length > 1 && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Moneda</Text>
                  <View style={styles.monedasContainer}>
                    {monedas.map(m => (
                      <TouchableOpacity
                        key={m.codigo}
                        style={[styles.monedaBoton, {
                          backgroundColor: moneda === m.codigo ? tema.colores.primario : tema.colores.fondoSecundario,
                          borderColor: tema.colores.bordes,
                        }]}
                        onPress={() => setMoneda(m.codigo)}
                      >
                        <Text style={[styles.monedaTexto, {
                          color: moneda === m.codigo ? '#fff' : tema.colores.texto,
                        }]}>
                          {m.simbolo} {m.codigo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Frecuencia */}
              <Text style={[styles.label, { color: tema.colores.texto }]}>Frecuencia</Text>
              <View style={styles.frecuenciaOpciones}>
                {(['diario', 'semanal', 'mensual'] as FrecuenciaGastoRecurrente[]).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.frecuenciaBoton, {
                      backgroundColor: frecuencia === freq ? tema.colores.primario : tema.colores.fondoSecundario,
                      borderColor: tema.colores.bordes,
                    }]}
                    onPress={() => setFrecuencia(freq)}
                  >
                    <Text style={[styles.frecuenciaTexto, {
                      color: frecuencia === freq ? '#fff' : tema.colores.texto,
                    }]}>
                      {obtenerEtiquetaFrecuencia(freq)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Día de la semana (semanal) */}
              {frecuencia === 'semanal' && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Día de la semana</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasScroll}>
                    <View style={styles.diasContainer}>
                      {DIAS_SEMANA.map(dia => (
                        <TouchableOpacity
                          key={dia.valor}
                          style={[styles.diaBoton, {
                            backgroundColor: diaSemana === dia.valor ? tema.colores.primario : tema.colores.fondoSecundario,
                            borderColor: tema.colores.bordes,
                          }]}
                          onPress={() => setDiaSemana(dia.valor)}
                        >
                          <Text style={[styles.diaTexto, {
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

              {/* Día del mes (mensual) */}
              {frecuencia === 'mensual' && (
                <>
                  <Text style={[styles.label, { color: tema.colores.texto }]}>Día del mes</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: tema.colores.fondoSecundario,
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
                        if (!isNaN(dia) && dia >= 1 && dia <= 31) {
                          setDiaMes(text);
                        }
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
                  onPress={handleAgregar}
                >
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                </BotonAnimado>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  resumen: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 15,
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resumenCantidad: {
    fontSize: 12,
    marginTop: 4,
  },
  carruselMonedas: {
    marginTop: 10,
  },
  carruselContenido: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
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
  resumenSeparador: {
    height: 1,
    marginVertical: 10,
  },
  resumenTotalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumenTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  resumenTotalValor: {
    fontSize: 18,
    fontWeight: 'bold',
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
  itemTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemMonto: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDetalle: {
    fontSize: 12,
  },
  itemAcciones: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonEliminar: {
    marginTop: 8,
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
  categoriasScroll: {
    maxHeight: 60,
  },
  categoriasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoriaBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    gap: 6,
  },
  categoriaEmoji: {
    fontSize: 18,
  },
  categoriaTexto: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 80,
  },
  monedasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  monedaBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  monedaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  frecuenciaOpciones: {
    flexDirection: 'row',
    gap: 8,
  },
  frecuenciaBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  frecuenciaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  diasScroll: {
    maxHeight: 50,
  },
  diasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  diaBoton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 55,
    alignItems: 'center',
  },
  diaTexto: {
    fontSize: 13,
    fontWeight: '600',
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
