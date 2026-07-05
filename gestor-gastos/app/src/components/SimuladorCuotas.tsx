import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { memo, useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useMonedas } from '../context/MonedasContext';
import { useSimuladorCuotas } from '../hooks/useSimuladorCuotas';

interface Props {
  variant?: 'widget' | 'full-width';
}

export const SimuladorCuotas = memo(({ variant = 'widget' }: Props) => {
  const { tema } = useTema();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo ?? 'Q';
  const { montoProducto, setMontoProducto, cantidadCuotas, setCantidadCuotas, resultado, simular, limpiar } = useSimuladorCuotas();

  const [expandido, setExpandido] = useState(false);

  const containerStyles = variant === 'widget'
    ? [styles.container, styles.containerWidget, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]
    : [styles.container, styles.containerFullWidth, { backgroundColor: tema.colores.fondoSecundario }];

  const handleSimular = () => {
    Keyboard.dismiss();
    simular();
  };

  const handleLimpiar = () => {
    Keyboard.dismiss();
    limpiar();
  };

  return (
    <View style={containerStyles}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.titulo, { color: tema.colores.primario }]}>
            🧮 Simulador de Cuotas (Proyección)
          </Text>
          <Text style={[styles.expandirIcono, { color: tema.colores.primario }]}>
            {expandido ? '▼' : '▶'}
          </Text>
        </View>
        {!expandido && (
          <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
            Toca para calcular la viabilidad de tu compra en el tiempo
          </Text>
        )}
      </TouchableOpacity>

      {expandido && (
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={[styles.label, { color: tema.colores.texto }]}>Monto del producto</Text>
            <View style={[styles.inputConPrefijo, { borderColor: tema.colores.bordes, backgroundColor: tema.colores.fondo }]}>
              <Text style={[styles.prefijo, { color: tema.colores.primario }]}>{simbolo}</Text>
              <TextInput
                style={[styles.input, { color: tema.colores.texto }]}
                value={montoProducto}
                onChangeText={setMontoProducto}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={tema.colores.textoSecundario}
                returnKeyType="done"
                onSubmitEditing={handleSimular}
              />
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={[styles.label, { color: tema.colores.texto }]}>Plazo en cuotas (Meses)</Text>
            <View style={styles.chipsRow}>
              {[3, 6, 10, 12, 18, 24, 36].map((opcion) => {
                const seleccionada = cantidadCuotas === opcion.toString();
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.chip,
                      {
                        borderColor: seleccionada ? tema.colores.primario : tema.colores.bordes,
                        backgroundColor: seleccionada ? `${tema.colores.primario}15` : tema.colores.fondo,
                      }
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setCantidadCuotas(opcion.toString());
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipTexto,
                        { color: seleccionada ? tema.colores.primario : tema.colores.textoSecundario }
                      ]}
                    >
                      {opcion} meses
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.boton, styles.botonSimular, { backgroundColor: tema.colores.primario }]}
              onPress={handleSimular}
              activeOpacity={0.8}
            >
              <Text style={styles.botonTexto}>Simular Compra</Text>
            </TouchableOpacity>

            {resultado && (
              <TouchableOpacity
                style={[styles.boton, styles.botonLimpiar, { borderColor: tema.colores.bordes }]}
                onPress={handleLimpiar}
                activeOpacity={0.8}
              >
                <Text style={[styles.botonTexto, { color: tema.colores.texto }]}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {resultado && (
            <View style={[styles.resultado, { backgroundColor: tema.colores.fondo, borderColor: resultado.colorIndicador }]}>
              <View style={[styles.indicador, { backgroundColor: resultado.colorIndicador }]} />

              <Text style={[styles.resultadoMensaje, { color: tema.colores.texto }]}>
                {resultado.mensaje}
              </Text>

              {/* 1. Análisis de Capacidad de Ahorro Histórica */}
              <View style={[styles.desglose, { borderColor: tema.colores.bordes, backgroundColor: tema.colores.fondoSecundario }]}>
                <Text style={[styles.desgloseTitle, { color: tema.colores.textoSecundario }]}>
                  Capacidad de Ahorro Promedio
                </Text>

                <View style={styles.desgloseLinea}>
                  <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>Ingresos promedio (3 meses)</Text>
                  <Text style={[styles.desgloseValor, { color: '#10b981' }]}>+{simbolo}{resultado.ingresosPromedio.toFixed(2)}</Text>
                </View>

                <View style={styles.desgloseLinea}>
                  <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>Gastos fijos / recurrentes</Text>
                  <Text style={[styles.desgloseValor, { color: '#ef4444' }]}>-{simbolo}{resultado.totalRecurrentes.toFixed(2)}</Text>
                </View>

                <View style={styles.desgloseLinea}>
                  <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>Gastos variables promedio</Text>
                  <Text style={[styles.desgloseValor, { color: '#ef4444' }]}>-{simbolo}{resultado.gastosVariablesEstimados.toFixed(2)}</Text>
                </View>

                <View style={[styles.desgloseTotal, { borderTopColor: tema.colores.bordes }]}>
                  <Text style={[styles.desgloseTotalLabel, { color: tema.colores.texto }]}>Superávit mensual típico</Text>
                  <Text style={[styles.desgloseTotalValor, { color: tema.colores.texto }]}>
                    {simbolo}{(resultado.ingresosPromedio - resultado.totalRecurrentes - resultado.gastosVariablesEstimados).toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.desgloseLinea, { marginTop: 4 }]}>
                  <Text style={[styles.desgloseLabel, { color: tema.colores.textoSecundario }]}>Compromiso del ahorro:</Text>
                  <Text style={[styles.desgloseValor, { color: resultado.colorIndicador }]}>
                    {isFinite(resultado.capacidadAhorroComprometida) ? `${resultado.capacidadAhorroComprometida.toFixed(1)}%` : '∞%'}
                  </Text>
                </View>
              </View>

              {/* 2. Puntos Críticos y de Alivio */}
              <View style={[styles.alertaBloque, { backgroundColor: `${resultado.colorIndicador}10`, borderColor: resultado.colorIndicador }]}>
                <Text style={[styles.alertaTitle, { color: resultado.colorIndicador }]}>
                  ⚠️ Mes más crítico: {resultado.mesCriticoLabel}
                </Text>
                <Text style={[styles.alertaTexto, { color: tema.colores.texto }]}>
                  Tu disponible bajará a {simbolo}{resultado.mesCriticoMargen.toFixed(0)} debido al solapamiento de cuotas. La nueva cuota consumirá el {isFinite(resultado.mesCriticoImpacto) ? `${resultado.mesCriticoImpacto.toFixed(0)}%` : '∞%'} de tu margen en ese mes.
                </Text>
              </View>

              {resultado.mesAlivioLabel ? (
                <View style={[styles.alertaBloque, { backgroundColor: '#10b98110', borderColor: '#10b981' }]}>
                  <Text style={[styles.alertaTitle, { color: '#10b981' }]}>
                    🚀 Primer mes de alivio: {resultado.mesAlivioLabel}
                  </Text>
                  <Text style={[styles.alertaTexto, { color: tema.colores.texto }]}>
                    Tus gastos mensuales proyectados bajarán y tu disponible subirá a {simbolo}{resultado.mesAlivioMargen.toFixed(0)} al finalizar otras deudas de tarjetas de crédito.
                  </Text>
                </View>
              ) : null}

              {/* 3. Proyección Mensual Detallada */}
              <Text style={[styles.desgloseTitle, { color: tema.colores.textoSecundario, marginTop: 15, marginBottom: 8 }]}>
                Línea de Tiempo del Margen y Afectación
              </Text>
              <View style={[styles.tablaProyeccion, { borderColor: tema.colores.bordes }]}>
                {resultado.proyeccionMensual.map((mes, idx) => (
                  <View key={idx} style={[styles.tablaFila, { borderBottomColor: tema.colores.bordes, backgroundColor: idx % 2 === 0 ? 'transparent' : `${tema.colores.bordes}10` }]}>
                    <View style={styles.colMes}>
                      <Text style={[styles.mesTexto, { color: tema.colores.texto }]}>{mes.mesLabel}</Text>
                      {mes.cuotasQueFinalizanNombres.length > 0 && (
                        <Text style={styles.finalizaTexto} numberOfLines={1}>
                          🎉 Libera: {mes.cuotasQueFinalizanNombres.join(', ')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.colDisponible}>
                      <Text style={styles.leyendaTexto}>Disponible</Text>
                      <Text style={[styles.disponibleTexto, { color: mes.margenLibre > 0 ? tema.colores.texto : '#ef4444' }]}>
                        {simbolo}{mes.margenLibre.toFixed(0)}
                      </Text>
                    </View>
                    <View style={styles.colAfectacion}>
                      <Text style={styles.leyendaTexto}>Afectación</Text>
                      <Text style={[styles.afectacionTexto, { color: mes.colorIndicador }]}>
                        {isFinite(mes.impactoPorcentaje) ? `${mes.impactoPorcentaje.toFixed(0)}%` : '∞%'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.detalles}>
                <View style={styles.detalle}>
                  <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>Nueva cuota mensual:</Text>
                  <Text style={[styles.detalleValor, { color: tema.colores.texto }]}>{simbolo}{resultado.nuevaCuotaMensual.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  containerWidget: { borderRadius: 15, borderWidth: 2, padding: 15 },
  containerFullWidth: { paddingVertical: 15 },
  header: { marginBottom: 15 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  expandirIcono: { fontSize: 16, fontWeight: 'bold' },
  subtitulo: { fontSize: 13 },
  formulario: { gap: 15 },
  campo: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  inputConPrefijo: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 10, paddingHorizontal: 12 },
  prefijo: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  botones: { flexDirection: 'row', gap: 10, marginTop: 5 },
  boton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  botonSimular: {},
  botonLimpiar: { borderWidth: 2 },
  botonTexto: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  resultado: { marginTop: 20, borderRadius: 12, borderWidth: 3, padding: 15, position: 'relative' },
  indicador: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  resultadoMensaje: { fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 15, textAlign: 'center' },
  desglose: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14, gap: 8 },
  desgloseTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  desgloseLinea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  desgloseLabel: { fontSize: 13 },
  desgloseValor: { fontSize: 13, fontWeight: '600' },
  desgloseTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  desgloseTotalLabel: { fontSize: 14, fontWeight: 'bold' },
  desgloseTotalValor: { fontSize: 16, fontWeight: 'bold' },
  detalles: { gap: 10, marginTop: 15 },
  detalle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detalleLabel: { fontSize: 13 },
  detalleValor: { fontSize: 16, fontWeight: 'bold' },
  
  // Nuevos estilos
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertaBloque: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    marginBottom: 10,
  },
  alertaTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  alertaTexto: {
    fontSize: 12,
    lineHeight: 16,
  },
  tablaProyeccion: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 5,
  },
  tablaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  colMes: {
    flex: 2,
    justifyContent: 'center',
  },
  mesTexto: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  finalizaTexto: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  colDisponible: {
    flex: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colAfectacion: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  disponibleTexto: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  afectacionTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 1,
  },
  leyendaTexto: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.2,
  }
});
