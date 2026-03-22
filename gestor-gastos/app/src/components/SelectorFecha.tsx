/**
 * Selector de fecha discreto para formularios de transacción.
 * Muestra un chip con la fecha actual. Al tocarlo abre un picker
 * simple con navegación por día y por mes. No permite fechas futuras.
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const MESES_CORTO = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

interface Props {
  fecha: string;       // ISO string
  onChange: (fecha: string) => void;
}

export const SelectorFecha = ({ fecha, onChange }: Props) => {
  const { tema } = useTema();
  const [modalVisible, setModalVisible] = useState(false);

  const fechaDate = new Date(fecha);
  const hoy = new Date();
  const esHoy = fechaDate.toDateString() === hoy.toDateString();

  const chipLabel = esHoy
    ? `Hoy · ${fechaDate.getDate()} ${MESES_CORTO[fechaDate.getMonth()]}`
    : `${fechaDate.getDate()} ${MESES_CORTO[fechaDate.getMonth()]} ${fechaDate.getFullYear()}`;

  const aplicar = (nueva: Date) => {
    // No permitir fechas futuras
    if (nueva > hoy) return;
    onChange(nueva.toISOString());
  };

  const irDiaAnterior = () => {
    const nueva = new Date(fechaDate);
    nueva.setDate(nueva.getDate() - 1);
    aplicar(nueva);
  };

  const irDiaSiguiente = () => {
    const nueva = new Date(fechaDate);
    nueva.setDate(nueva.getDate() + 1);
    aplicar(nueva);
  };

  const irMesAnterior = () => {
    const nueva = new Date(fechaDate);
    nueva.setMonth(nueva.getMonth() - 1);
    aplicar(nueva);
  };

  const irMesSiguiente = () => {
    const nueva = new Date(fechaDate);
    nueva.setMonth(nueva.getMonth() + 1);
    aplicar(nueva);
  };

  const volverAHoy = () => {
    onChange(new Date().toISOString());
  };

  const esDiaSiguienteDisponible = () => {
    const siguiente = new Date(fechaDate);
    siguiente.setDate(siguiente.getDate() + 1);
    return siguiente <= hoy;
  };

  const esMesSiguienteDisponible = () => {
    const siguiente = new Date(fechaDate);
    siguiente.setMonth(siguiente.getMonth() + 1);
    return siguiente <= hoy;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.chip,
          {
            borderColor: esHoy ? tema.colores.bordes : tema.colores.primario,
            backgroundColor: tema.colores.fondo,
          },
        ]}
      >
        <Text style={[styles.chipTexto, { color: esHoy ? tema.colores.textoSecundario : tema.colores.primario }]}>
          📅 {chipLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.picker, { backgroundColor: tema.colores.fondo, borderColor: tema.colores.bordes }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.titulo, { color: tema.colores.texto }]}>
              Fecha del registro
            </Text>

            {/* Navegación por mes */}
            <View style={styles.fila}>
              <TouchableOpacity onPress={irMesAnterior} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.flechaDoble, { color: tema.colores.primario }]}>‹‹</Text>
              </TouchableOpacity>
              <Text style={[styles.mesLabel, { color: tema.colores.textoSecundario }]}>
                {MESES[fechaDate.getMonth()]} {fechaDate.getFullYear()}
              </Text>
              <TouchableOpacity
                onPress={irMesSiguiente}
                disabled={!esMesSiguienteDisponible()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.flechaDoble, { color: esMesSiguienteDisponible() ? tema.colores.primario : tema.colores.bordes }]}>
                  ››
                </Text>
              </TouchableOpacity>
            </View>

            {/* Navegación por día */}
            <View style={styles.fila}>
              <TouchableOpacity onPress={irDiaAnterior} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.flecha, { color: tema.colores.primario }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.diaLabel, { color: tema.colores.texto }]}>
                {fechaDate.getDate()} de {MESES[fechaDate.getMonth()].toLowerCase()}
              </Text>
              <TouchableOpacity
                onPress={irDiaSiguiente}
                disabled={!esDiaSiguienteDisponible()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.flecha, { color: esDiaSiguienteDisponible() ? tema.colores.primario : tema.colores.bordes }]}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botones */}
            <View style={styles.botones}>
              {!esHoy && (
                <TouchableOpacity
                  onPress={() => { volverAHoy(); }}
                  style={[styles.botonHoy, { borderColor: tema.colores.bordes }]}
                >
                  <Text style={[styles.botonHoyTexto, { color: tema.colores.textoSecundario }]}>
                    Hoy
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.botonListo, { backgroundColor: tema.colores.primario, flex: esHoy ? 1 : undefined }]}
              >
                <Text style={styles.botonListoTexto}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  picker: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flechaDoble: {
    fontSize: 20,
    fontWeight: '300',
    paddingHorizontal: 4,
  },
  flecha: {
    fontSize: 28,
    fontWeight: '300',
    paddingHorizontal: 4,
  },
  mesLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  diaLabel: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonHoy: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonHoyTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  botonListo: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonListoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
