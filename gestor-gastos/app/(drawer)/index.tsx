import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
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
import { useAlertasDiarias } from '../src/hooks/useAlertasDiarias';
import { Gasto } from '../src/types';

const TIPO_CHIPS: { label: string; value: 'todos' | 'gasto' | 'ingreso' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Gastos', value: 'gasto' },
  { label: 'Ingresos', value: 'ingreso' },
];

export default function HomeScreen() {
  const { gastos, agregarGasto, editarGasto, eliminarGasto } = useGastos();
  const { tema } = useTema();
  const { modalVisible, descartarAlertas } = useAlertasDiarias();

  const [modalSeleccionarTipoVisible, setModalSeleccionarTipoVisible] = useState(false);
  const [modalAgregarGastoVisible, setModalAgregarGastoVisible] = useState(false);
  const [modalAgregarIngresoVisible, setModalAgregarIngresoVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);

  const {
    gastosFiltrados,
    textoBusqueda,
    setTextoBusqueda,
    etiquetaMes,
    esMesActual,
    irMesAnterior,
    irMesSiguiente,
    irMesActual,
    tipoFiltro,
    setTipoFiltro,
  } = useFiltrosGastos(gastos);

  const handleAgregarGasto = useCallback((monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'gasto', moneda, nota: nota || undefined, fecha, tarjetaId });
  }, [agregarGasto]);

  const handleAgregarIngreso = useCallback((monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string) => {
    agregarGasto({ monto, descripcion, categoria, tipo: 'ingreso', moneda, nota: nota || undefined, fecha });
  }, [agregarGasto]);

  const handleEditar = useCallback((id: string, monto: number, descripcion: string, categoria: string, nota: string, fecha: string, moneda: string, tarjetaId?: string) => {
    editarGasto(id, { monto, descripcion, categoria, nota: nota || undefined, fecha, moneda, tarjetaId });
  }, [editarGasto]);

  const handleAbrirEditar = useCallback((gasto: Gasto) => {
    setGastoAEditar(gasto);
    setModalEditarVisible(true);
  }, []);

  const handleSeleccionarTipo = useCallback((tipo: 'gasto' | 'ingreso') => {
    if (tipo === 'gasto') setModalAgregarGastoVisible(true);
    else setModalAgregarIngresoVisible(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>

      {/* Navegador de mes */}
      <View style={[styles.navMes, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
        <TouchableOpacity onPress={irMesAnterior} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.navMesFlecha, { color: tema.colores.primario }]}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={irMesActual} disabled={esMesActual}>
          <Text style={[styles.navMesEtiqueta, { color: tema.colores.texto }]}>{etiquetaMes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={irMesSiguiente} disabled={esMesActual} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.navMesFlecha, { color: esMesActual ? tema.colores.bordes : tema.colores.primario }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda + Chips tipo */}
      <View style={styles.filtrosBar}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
            color: tema.colores.texto,
          }]}
          placeholder="🔍 Buscar..."
          placeholderTextColor={tema.colores.textoSecundario}
          value={textoBusqueda}
          onChangeText={setTextoBusqueda}
        />
        <View style={styles.chipRow}>
          {TIPO_CHIPS.map(chip => {
            const activo = tipoFiltro === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activo ? tema.colores.primario : tema.colores.fondoSecundario,
                    borderColor: activo ? tema.colores.primario : tema.colores.bordes,
                  },
                ]}
                onPress={() => setTipoFiltro(chip.value)}
              >
                <Text style={[styles.chipTexto, { color: activo ? '#fff' : tema.colores.textoSecundario }]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ListaGastos
        gastos={gastosFiltrados}
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
  navMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  navMesFlecha: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  navMesEtiqueta: {
    fontSize: 16,
    fontWeight: '700',
  },
  filtrosBar: {
    gap: 8,
    marginBottom: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
});
