import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../src/context/TemaContext';
import { ResumenBalance } from '../src/components/ResumenBalance';
import { ResumenPorMoneda } from '../src/components/ResumenPorMoneda';
import { AlertasPresupuesto } from '../src/components/AlertasPresupuesto';
import { ResumenMetas } from '../src/components/ResumenMetas';
import { ResumenTarjetas } from '../src/components/ResumenTarjetas';
import { ModalAlertasDiarias } from '../src/components/ModalAlertasDiarias';
import { useAlertasDiarias } from '../src/hooks/useAlertasDiarias';
import { useGeneradorCuotas } from '../src/hooks/useGeneradorCuotas';

export default function ResumenScreen() {
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

  // Hook que auto-genera gastos de cuotas cuando llega la fecha de corte
  useGeneradorCuotas();

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
        Vista general de tu situación financiera
      </Text>

      <ResumenBalance />

      <ResumenPorMoneda />

      <ResumenTarjetas />

      <AlertasPresupuesto />

      <ResumenMetas />

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
  descripcion: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
});
