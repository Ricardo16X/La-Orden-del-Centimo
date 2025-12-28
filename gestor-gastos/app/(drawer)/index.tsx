import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useGastos } from '../src/context/GastosContext';
import { useNivel } from '../src/context/NivelContext';
import { useTema } from '../src/context/TemaContext';
import { useFiltrosGastos } from '../src/hooks';
import { ListaGastos } from '../src/components/ListaGastos';
import { Companero } from '../src/components/Companero';
import { BotonAgregar } from '../src/components/BotonAgregar';
import { ModalAgregarGasto } from '../src/components/ModalAgregarGasto';
import { ModalAgregarIngreso } from '../src/components/ModalAgregarIngreso';
import { ModalEditarGasto } from '../src/components/ModalEditarGasto';
import { ModalSeleccionarTipo } from '../src/components/ModalSeleccionarTipo';
import { NotificacionNivel } from '../src/components/NotificacionNivel';
import { NotificacionLogro } from '../src/components/NotificacionLogro';
import { Filtros } from '../src/components/Filtros';
import { useCompaneroMensajes } from '../src/hooks';
import { useDetectorLogros } from '../src/hooks/useDetectorLogros';
import { XP_POR_GASTO } from '../src/constants/niveles';
import { Gasto } from '../src/types';

export default function HomeScreen() {
  const { gastos, agregarGasto, editarGasto, eliminarGasto, ultimoGastoAgregado } = useGastos();
  const { datosJugador, ganarXP, subisteDeNivel } = useNivel();
  const { tema } = useTema();
  const { ultimoLogroDesbloqueado } = useDetectorLogros();

  const [modalSeleccionarTipoVisible, setModalSeleccionarTipoVisible] = useState<boolean>(false);
  const [modalAgregarGastoVisible, setModalAgregarGastoVisible] = useState<boolean>(false);
  const [modalAgregarIngresoVisible, setModalAgregarIngresoVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

  // Hook de filtros
  const {
    gastosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    periodo,
    setPeriodo,
    tipoFiltro,
    setTipoFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    totalFiltrados,
  } = useFiltrosGastos(gastos);

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
      {/* Botón de filtros en esquina superior derecha */}
      <View style={styles.filtroContainer}>
        <TouchableOpacity
          style={[styles.botonFiltro, {
            backgroundColor: mostrarFiltros ? tema.colores.primario : tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Text style={[styles.botonFiltroTexto, {
            color: mostrarFiltros ? '#fff' : tema.colores.texto
          }]}>
            🔍 {mostrarFiltros ? 'Ocultar' : 'Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      <Companero
        mensaje={mensajeCompanero}
        visible={mostrarCompanero}
        key={contadorMensajes}
      />

      <NotificacionNivel visible={subisteDeNivel} nivel={datosJugador.nivel} />

      <NotificacionLogro logroDesbloqueado={ultimoLogroDesbloqueado} />

      {mostrarFiltros && (
        <Filtros
          textoBusqueda={textoBusqueda}
          onBusquedaChange={setTextoBusqueda}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          tipoFiltro={tipoFiltro}
          onTipoChange={setTipoFiltro}
          hayFiltrosActivos={hayFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
          totalFiltrados={totalFiltrados}
        />
      )}

      <ListaGastos
        gastos={gastosFiltrados}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  filtroContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  botonFiltro: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  botonFiltroTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
});
