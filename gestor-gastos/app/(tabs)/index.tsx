import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGastos } from '../src/context/GastosContext';
import { useNivel } from '../src/context/NivelContext';
import { useTema } from '../src/context/TemaContext';
import { TotalGastado } from '../src/components/TotalGastado';
import { ListaGastos } from '../src/components/ListaGastos';
import { Companero } from '../src/components/Companero';
import { BotonAgregar } from '../src/components/BotonAgregar';
import { ModalAgregarGasto } from '../src/components/ModalAgregarGasto';
import { ModalEditarGasto } from '../src/components/ModalEditarGasto';
import { NotificacionNivel } from '../src/components/NotificacionNivel';
import { obtenerFraseAleatoria, obtenerFraseSegunMonto } from '../src/constants/companero';
import { XP_POR_GASTO } from '../src/constants/niveles';
import { Gasto } from '../src/types';

export default function HomeScreen() {
  const { gastos, agregarGasto, editarGasto, eliminarGasto, totalGastado, ultimoGastoAgregado } = useGastos();
  const { datosJugador, ganarXP, subisteDeNivel } = useNivel();
  const { tema } = useTema();
  const [mensajeCompanero, setMensajeCompanero] = useState<string>('');
  const [mostrarCompanero, setMostrarCompanero] = useState<boolean>(false);
  const [contadorMensajes, setContadorMensajes] = useState<number>(0);
  const [modalAgregarVisible, setModalAgregarVisible] = useState<boolean>(false);
  const [modalEditarVisible, setModalEditarVisible] = useState<boolean>(false);
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);
  
  const ultimoGastoIdProcesado = useRef<string | null>(null);

  // Mensaje de bienvenida
  useEffect(() => {
    const timer = setTimeout(() => {
      const fraseBienvenida = obtenerFraseAleatoria('bienvenida', tema.id);
      setMensajeCompanero(fraseBienvenida);
      setMostrarCompanero(true);
      setContadorMensajes(prev => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [tema.id]);

  // Mensaje cuando se agrega un gasto
  useEffect(() => {
    if (ultimoGastoAgregado && ultimoGastoAgregado.id !== ultimoGastoIdProcesado.current) {
      ultimoGastoIdProcesado.current = ultimoGastoAgregado.id;
      
      ganarXP(XP_POR_GASTO);

      const frase = obtenerFraseSegunMonto(ultimoGastoAgregado.monto, tema.id);
      setMensajeCompanero(frase);
      setMostrarCompanero(true);
      setContadorMensajes(prev => prev + 1);
      
      const mostrarExtra = Math.random() > 0.7;
      if (mostrarExtra) {
        setTimeout(() => {
          const tipoExtra = Math.random() > 0.5 ? 'motivacional' : 'consejo';
          setMensajeCompanero(obtenerFraseAleatoria(tipoExtra, tema.id));
          setMostrarCompanero(true);
          setContadorMensajes(prev => prev + 1);
        }, 3800);
      }
    }
  }, [ultimoGastoAgregado, tema.id]);

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
}

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