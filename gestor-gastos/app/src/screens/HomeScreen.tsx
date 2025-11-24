import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGastos } from '../context/GastosContext';
import { useNivel } from '../context/NivelContext';
import { useTema } from '../context/TemaContext';
import { useCompaneroMensajes } from '../hooks';
import { Balance } from '../components/Balance';
import { ListaGastos } from '../components/ListaGastos';
import { Companero } from '../components/Companero';
import { BotonAgregar } from '../components/BotonAgregar';
import { ModalAgregarGasto } from '../components/ModalAgregarGasto';
import { ModalAgregarIngreso } from '../components/ModalAgregarIngreso';
import { ModalEditarGasto } from '../components/ModalEditarGasto';
import { ModalSeleccionarTipo } from '../components/ModalSeleccionarTipo';
import { NotificacionNivel } from '../components/NotificacionNivel';
import { XP_POR_GASTO } from '../constants/niveles';
import { Gasto } from '../types';

export const HomeScreen = () => {
  const { gastos, agregarGasto, editarGasto, eliminarGasto, totalGastado, totalIngresos, ultimoGastoAgregado } = useGastos();
  const { datosJugador, ganarXP, subisteDeNivel } = useNivel();
  const { tema } = useTema();

  const [modalSeleccionarTipoVisible, setModalSeleccionarTipoVisible] = useState<boolean>(false);
  const [modalAgregarGastoVisible, setModalAgregarGastoVisible] = useState<boolean>(false);
  const [modalAgregarIngresoVisible, setModalAgregarIngresoVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);

  const { mensajeCompanero, mostrarCompanero, contadorMensajes } = useCompaneroMensajes(
    tema.id,
    ultimoGastoAgregado,
    () => ganarXP(XP_POR_GASTO)
  );

  const handleAgregarGasto = (monto: number, descripcion: string, categoria: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'gasto' });
  };

  const handleAgregarIngreso = (monto: number, descripcion: string, categoria: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'ingreso' });
  };

  const handleEditar = (id: string, monto: number, descripcion: string, categoria: string) => {
    editarGasto(id, { monto, descripcion, categoria });
  };

  const handleAbrirEditar = (gasto: Gasto) => {
    setGastoAEditar(gasto);
    setModalEditarVisible(true);
  };

  const handleSeleccionarTipo = (tipo: 'gasto' | 'ingreso') => {
    if (tipo === 'gasto') {
      setModalAgregarGastoVisible(true);
    } else {
      setModalAgregarIngresoVisible(true);
    }
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

      <Balance totalIngresos={totalIngresos} totalGastos={totalGastado} />

      <ListaGastos
        gastos={gastos}
        onEliminar={eliminarGasto}
        onEditar={handleAbrirEditar}
      />

      <BotonAgregar onPress={() => setModalSeleccionarTipoVisible(true)} />

      <ModalSeleccionarTipo
        visible={modalSeleccionarTipoVisible}
        onClose={() => setModalSeleccionarTipoVisible(false)}
        onSeleccionar={handleSeleccionarTipo}
      />

      <ModalAgregarGasto
        visible={modalAgregarGastoVisible}
        onClose={() => setModalAgregarGastoVisible(false)}
        onAgregar={handleAgregarGasto}
      />

      <ModalAgregarIngreso
        visible={modalAgregarIngresoVisible}
        onClose={() => setModalAgregarIngresoVisible(false)}
        onAgregar={handleAgregarIngreso}
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
