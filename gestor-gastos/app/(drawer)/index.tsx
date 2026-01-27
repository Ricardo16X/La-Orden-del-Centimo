import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGastos } from '../src/context/GastosContext';
import { useTema } from '../src/context/TemaContext';
import { useFiltrosGastos } from '../src/hooks';
import { ListaGastos } from '../src/components/ListaGastos';
import { BotonAgregar } from '../src/components/BotonAgregar';
import { ModalAgregarGasto } from '../src/components/ModalAgregarGasto';
import { ModalAgregarIngreso } from '../src/components/ModalAgregarIngreso';
import { ModalEditarGasto } from '../src/components/ModalEditarGasto';
import { ModalSeleccionarTipo } from '../src/components/ModalSeleccionarTipo';
import { ModalAlertasDiarias } from '../src/components/ModalAlertasDiarias';
import { Filtros } from '../src/components/Filtros';
import { useAlertasDiarias } from '../src/hooks/useAlertasDiarias';
import { Gasto } from '../src/types';

export default function HomeScreen() {
  const { gastos, agregarGasto, editarGasto, eliminarGasto } = useGastos();
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

  const [modalSeleccionarTipoVisible, setModalSeleccionarTipoVisible] = useState<boolean>(false);
  const [modalAgregarGastoVisible, setModalAgregarGastoVisible] = useState<boolean>(false);
  const [modalAgregarIngresoVisible, setModalAgregarIngresoVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

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

  const handleAgregarGasto = (monto: number, descripcion: string, categoria: string, moneda?: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'gasto', moneda });
  };

  const handleAgregarIngreso = (monto: number, descripcion: string, categoria: string, moneda?: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'ingreso', moneda });
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
      <View style={styles.headerContainer}>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          Mis Gastos
        </Text>
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
            {mostrarFiltros ? 'Ocultar' : 'Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

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

      <ModalAlertasDiarias
        visible={modalVisible}
        onClose={descartarAlertas}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
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
