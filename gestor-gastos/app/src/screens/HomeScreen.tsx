import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGastos } from '../context/GastosContext';
import { useNivel } from '../context/NivelContext';
import { useTema } from '../context/TemaContext';
import { useCompaneroMensajes } from '../hooks';
import { TotalGastado } from '../components/TotalGastado';
import { ListaGastos } from '../components/ListaGastos';
import { Companero } from '../components/Companero';
import { BotonAgregar } from '../components/BotonAgregar';
import { ModalAgregarGasto } from '../components/ModalAgregarGasto';
import { ModalEditarGasto } from '../components/ModalEditarGasto';
import { NotificacionNivel } from '../components/NotificacionNivel';
import { XP_POR_GASTO } from '../constants/niveles';
import { Gasto } from '../types';

export const HomeScreen = () => {
  const { gastos, agregarGasto, editarGasto, eliminarGasto, totalGastado, ultimoGastoAgregado } = useGastos();
  const { datosJugador, ganarXP, subisteDeNivel } = useNivel();
  const { tema } = useTema();

  const [modalAgregarVisible, setModalAgregarVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);

  const { mensajeCompanero, mostrarCompanero, contadorMensajes } = useCompaneroMensajes(
    tema.id,
    ultimoGastoAgregado,
    () => ganarXP(XP_POR_GASTO)
  );

  const handleAgregar = (monto: number, descripcion: string, categoria: string) => {
    agregarGasto({ monto, descripcion, categoria });
  };

  const handleEditar = (id: string, monto: number, descripcion: string, categoria: string) => {
    editarGasto(id, { monto, descripcion, categoria });
  };

  const handleAbrirEditar = (gasto: Gasto) => {
    setGastoAEditar(gasto);
    setModalEditarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>
        {tema.emoji} Mis Gastos
      </Text>

      <Companero
        mensaje={mensajeCompanero}
        visible={mostrarCompanero}
        key={contadorMensajes}
      />

      <NotificacionNivel visible={subisteDeNivel} nivel={datosJugador.nivel} />

      <TotalGastado total={totalGastado} />

      <ListaGastos
        gastos={gastos}
        onEliminar={eliminarGasto}
        onEditar={handleAbrirEditar}
      />

      <BotonAgregar onPress={() => setModalAgregarVisible(true)} />

      <ModalAgregarGasto
        visible={modalAgregarVisible}
        onClose={() => setModalAgregarVisible(false)}
        onAgregar={handleAgregar}
      />

      <ModalEditarGasto
        visible={modalEditarVisible}
        gasto={gastoAEditar}
        onClose={() => setModalEditarVisible(false)}
        onEditar={handleEditar}
        onEliminar={eliminarGasto}
      />

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});
