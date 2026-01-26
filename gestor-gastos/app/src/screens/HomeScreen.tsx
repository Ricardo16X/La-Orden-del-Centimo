import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGastos } from '../context/GastosContext';
import { useTema } from '../context/TemaContext';
import { useFiltrosGastos } from '../hooks';
import { Balance } from '../components/Balance';
import { ListaGastos } from '../components/ListaGastos';
import { BotonAgregar } from '../components/BotonAgregar';
import { ModalAgregarGasto } from '../components/ModalAgregarGasto';
import { ModalAgregarIngreso } from '../components/ModalAgregarIngreso';
import { ModalEditarGasto } from '../components/ModalEditarGasto';
import { ModalSeleccionarTipo } from '../components/ModalSeleccionarTipo';
import { AlertasPresupuesto } from '../components/AlertasPresupuesto';
import { ModalAlertasDiarias } from '../components/ModalAlertasDiarias';
import { Filtros } from '../components/Filtros';
import { ResumenMetas } from '../components/ResumenMetas';
import { ResumenBalance } from '../components/ResumenBalance';
import { useAlertasDiarias } from '../hooks/useAlertasDiarias';
import { Gasto } from '../types';

export const HomeScreen = () => {
  const { gastos, agregarGasto, editarGasto, eliminarGasto, totalGastado, totalIngresos } = useGastos();
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

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

  const handleAgregarGasto = (monto: number, descripcion: string, categoria: string, moneda?: string) => {
    // VERSIÓN NUEVA CON SOPORTE MULTI-MONEDA
    console.log('🏠🏠🏠 HomeScreen - handleAgregarGasto recibió:', { monto, descripcion, categoria, moneda });
    const gastoData = { monto, descripcion, categoria, tipo: 'gasto' as const, moneda };
    console.log('🏠🏠🏠 HomeScreen - enviando a agregarGasto:', gastoData);
    agregarGasto(gastoData);
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
            🔍 {mostrarFiltros ? 'Ocultar' : 'Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      <ResumenBalance />

      <AlertasPresupuesto />

      <ResumenMetas />

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
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
