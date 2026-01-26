import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTema } from '../context/TemaContext';
import { useCuotas } from '../context/CuotasContext';
import { useGastos } from '../context/GastosContext';

interface ResultadoSimulacion {
  montoMensual: number;
  totalConNuevaCuota: number;
  porcentajeIngresos: number;
  esSostenible: boolean;
  mensaje: string;
  colorIndicador: string;
}

interface Props {
  variant?: 'widget' | 'full-width';
}

export const SimuladorCuotas = ({ variant = 'widget' }: Props) => {
  const { tema } = useTema();
  const { obtenerTotalCuotasMensual } = useCuotas();
  const { gastos } = useGastos();

  const [expandido, setExpandido] = useState(false);
  const [montoProducto, setMontoProducto] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [resultado, setResultado] = useState<ResultadoSimulacion | null>(null);

  const simular = () => {
    const monto = parseFloat(montoProducto);
    const cuotas = parseInt(cantidadCuotas);

    if (isNaN(monto) || isNaN(cuotas) || monto <= 0 || cuotas <= 0) {
      return;
    }

    const montoPorCuota = monto / cuotas;
    const cuotasActuales = obtenerTotalCuotasMensual();
    const totalConNueva = cuotasActuales + montoPorCuota;

    // Calcular ingresos mensuales promedio (del mes actual)
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const gastosDelMes = gastos.filter(g => {
      const fechaGasto = new Date(g.fecha);
      return fechaGasto >= inicioMes && g.tipo === 'ingreso';
    });
    const ingresosPromedio = gastosDelMes.reduce((sum, g) => sum + g.monto, 0) || 5000; // Fallback

    const porcentaje = (totalConNueva / ingresosPromedio) * 100;

    // Criterios de sostenibilidad - usando colores del tema
    let esSostenible = true;
    let mensaje = '';
    let colorIndicador = '#22c55e'; // Verde

    if (porcentaje > 50) {
      esSostenible = false;
      mensaje = 'Riesgo alto: Las cuotas superarían el 50% de tus ingresos';
      colorIndicador = '#ef4444'; // Rojo
    } else if (porcentaje > 30) {
      esSostenible = false;
      mensaje = 'Precaución: Las cuotas estarían cerca del 30% de tus ingresos';
      colorIndicador = '#f59e0b'; // Amarillo
    } else {
      mensaje = 'Sostenible: Las cuotas están dentro de un rango saludable';
      colorIndicador = '#22c55e'; // Verde
    }

    setResultado({
      montoMensual: montoPorCuota,
      totalConNuevaCuota: totalConNueva,
      porcentajeIngresos: porcentaje,
      esSostenible,
      mensaje,
      colorIndicador,
    });
  };

  const limpiar = () => {
    setMontoProducto('');
    setCantidadCuotas('');
    setResultado(null);
  };

  const containerStyles = variant === 'widget'
    ? [styles.container, styles.containerWidget, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]
    : [styles.container, styles.containerFullWidth, { backgroundColor: tema.colores.fondoSecundario }];

  return (
    <View style={containerStyles}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.titulo, { color: tema.colores.primario }]}>
            🧮 Simulador de Cuotas
          </Text>
          <Text style={[styles.expandirIcono, { color: tema.colores.primario }]}>
            {expandido ? '▼' : '▶'}
          </Text>
        </View>
        {!expandido && (
          <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
            Toca para calcular si puedes afrontar una nueva compra
          </Text>
        )}
      </TouchableOpacity>

      {expandido && (
        <View style={styles.formulario}>
        <View style={styles.campo}>
          <Text style={[styles.label, { color: tema.colores.texto }]}>Monto del producto</Text>
          <View style={[styles.inputConPrefijo, { borderColor: tema.colores.bordes }]}>
            <Text style={[styles.prefijo, { color: tema.colores.primario }]}>{tema.moneda}</Text>
            <TextInput
              style={[styles.input, { color: tema.colores.texto }]}
              value={montoProducto}
              onChangeText={setMontoProducto}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={tema.colores.textoSecundario}
            />
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={[styles.label, { color: tema.colores.texto }]}>Cantidad de cuotas</Text>
          <TextInput
            style={[styles.inputNumero, { color: tema.colores.texto, borderColor: tema.colores.bordes }]}
            value={cantidadCuotas}
            onChangeText={setCantidadCuotas}
            keyboardType="number-pad"
            placeholder="12"
            placeholderTextColor={tema.colores.textoSecundario}
          />
        </View>

        <View style={styles.botones}>
          <TouchableOpacity
            style={[styles.boton, styles.botonSimular, { backgroundColor: tema.colores.primario }]}
            onPress={simular}
          >
            <Text style={styles.botonTexto}>Simular</Text>
          </TouchableOpacity>

          {resultado && (
            <TouchableOpacity
              style={[styles.boton, styles.botonLimpiar, { borderColor: tema.colores.bordes }]}
              onPress={limpiar}
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

          <View style={styles.detalles}>
            <View style={styles.detalle}>
              <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>
                Cuota mensual:
              </Text>
              <Text style={[styles.detalleValor, { color: tema.colores.texto }]}>
                {tema.moneda}{resultado.montoMensual.toFixed(2)}
              </Text>
            </View>

            <View style={styles.detalle}>
              <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>
                Total cuotas mensuales:
              </Text>
              <Text style={[styles.detalleValor, { color: tema.colores.texto }]}>
                {tema.moneda}{resultado.totalConNuevaCuota.toFixed(2)}
              </Text>
            </View>

            <View style={styles.detalle}>
              <Text style={[styles.detalleLabel, { color: tema.colores.textoSecundario }]}>
                % de tus ingresos:
              </Text>
              <Text style={[styles.detalleValor, { color: resultado.colorIndicador }]}>
                {resultado.porcentajeIngresos.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={[styles.barraProgreso, { backgroundColor: tema.colores.bordes }]}>
            <View
              style={[
                styles.barraProgresoFill,
                {
                  width: `${Math.min(resultado.porcentajeIngresos, 100)}%`,
                  backgroundColor: resultado.colorIndicador,
                },
              ]}
            />
          </View>

          <View style={styles.leyenda}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaPunto, { backgroundColor: '#22c55e' }]} />
              <Text style={[styles.leyendaTexto, { color: tema.colores.textoSecundario }]}>
                {'< 30% Saludable'}
              </Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaPunto, { backgroundColor: '#f59e0b' }]} />
              <Text style={[styles.leyendaTexto, { color: tema.colores.textoSecundario }]}>
                30-50% Precaución
              </Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaPunto, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.leyendaTexto, { color: tema.colores.textoSecundario }]}>
                {'>'}50% Riesgo
              </Text>
            </View>
          </View>
          </View>
        )}
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  containerWidget: {
    borderRadius: 15,
    borderWidth: 2,
    padding: 15,
  },
  containerFullWidth: {
    paddingVertical: 15,
  },
  header: {
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandirIcono: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 13,
  },
  formulario: {
    gap: 15,
  },
  campo: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputConPrefijo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  prefijo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputNumero: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  boton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonSimular: {
    // backgroundColor viene del tema
  },
  botonLimpiar: {
    borderWidth: 2,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultado: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 3,
    padding: 15,
    position: 'relative',
  },
  indicador: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  resultadoMensaje: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  detalles: {
    gap: 10,
  },
  detalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detalleLabel: {
    fontSize: 13,
  },
  detalleValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barraProgreso: {
    height: 12,
    borderRadius: 6,
    marginTop: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  barraProgresoFill: {
    height: '100%',
    borderRadius: 6,
  },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    fontSize: 11,
  },
});
