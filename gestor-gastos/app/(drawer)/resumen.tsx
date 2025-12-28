import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../src/context/TemaContext';
import { ResumenBalance } from '../src/components/ResumenBalance';
import { AlertasPresupuesto } from '../src/components/AlertasPresupuesto';
import { ResumenMetas } from '../src/components/ResumenMetas';
import { ModalAlertasDiarias } from '../src/components/ModalAlertasDiarias';
import { useAlertasDiarias } from '../src/hooks/useAlertasDiarias';

export default function ResumenScreen() {
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.descripcion, { color: tema.colores.textoSecundario }]}>
        Vista general de tu situación financiera
      </Text>

      <ResumenBalance />

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
