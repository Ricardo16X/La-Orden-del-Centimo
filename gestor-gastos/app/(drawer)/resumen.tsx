import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { useTema } from '../src/context/TemaContext';
import { useGastos } from '../src/context/GastosContext';
import { useMonedas } from '../src/context/MonedasContext';
import { ResumenBalance } from '../src/components/ResumenBalance';
import { ResumenPorMoneda } from '../src/components/ResumenPorMoneda';
import { AlertasPresupuesto } from '../src/components/AlertasPresupuesto';
import { ResumenMetas } from '../src/components/ResumenMetas';
import { ResumenTarjetas } from '../src/components/ResumenTarjetas';
import { TransaccionesRecientes } from '../src/components/TransaccionesRecientes';
import { ModalAlertasDiarias } from '../src/components/ModalAlertasDiarias';
import { useAlertasDiarias } from '../src/hooks/useAlertasDiarias';
import { useGeneradorCuotas } from '../src/hooks/useGeneradorCuotas';

const SaludoHeader = () => {
  const { tema } = useTema();
  const { gastos } = useGastos();
  const { monedaBase } = useMonedas();
  const simbolo = monedaBase?.simbolo || '$';

  const { saludo, fecha } = useMemo(() => {
    const hora = new Date().getHours();
    const texto = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
    const fechaStr = new Date().toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return { saludo: texto, fecha: fechaStr };
  }, []);

  const gastoHoy = useMemo(() => {
    const hoyStr = new Date().toDateString();
    return gastos
      .filter(g => !g.esTransferencia && g.tipo === 'gasto' && new Date(g.fecha).toDateString() === hoyStr)
      .reduce((sum, g) => sum + (g.montoEnMonedaBase ?? g.monto), 0);
  }, [gastos]);

  return (
    <View style={[saludoStyles.container, { borderBottomColor: tema.colores.bordes }]}>
      <View style={saludoStyles.textos}>
        <Text style={[saludoStyles.saludo, { color: tema.colores.texto }]}>{saludo} 👋</Text>
        <Text style={[saludoStyles.fecha, { color: tema.colores.textoSecundario }]}>{fecha}</Text>
      </View>
      {gastoHoy > 0 && (
        <View style={[saludoStyles.hoyCard, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
          <Text style={[saludoStyles.hoyLabel, { color: tema.colores.textoSecundario }]}>Hoy</Text>
          <Text style={[saludoStyles.hoyMonto, { color: '#ef4444' }]}>
            -{simbolo}{gastoHoy.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const saludoStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  textos: {
    flex: 1,
  },
  saludo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fecha: {
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  hoyCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  hoyLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  hoyMonto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default function ResumenScreen() {
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

  useGeneradorCuotas();

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <SaludoHeader />

      <ResumenBalance />

      <AlertasPresupuesto soloExcedidos />

      <ResumenTarjetas />

      <ResumenMetas />

      <ResumenPorMoneda />

      <TransaccionesRecientes />

      <ModalAlertasDiarias
        visible={modalVisible}
        onClose={descartarAlertas}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
});
