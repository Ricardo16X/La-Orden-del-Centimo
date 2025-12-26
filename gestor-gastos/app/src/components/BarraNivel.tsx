import { View, Text, StyleSheet } from 'react-native';
import { DatosJugador } from '../types';
import { useTema } from '../context/TemaContext';

interface Props {
  datosJugador: DatosJugador;
}

export const BarraNivel = ({ datosJugador }: Props) => {
  const { tema } = useTema();
  
  const xpEnNivelActual = datosJugador.xp - (datosJugador.nivel > 1 
    ? obtenerXPNivelAnterior(datosJugador.nivel) 
    : 0);
  const xpNecesarioParaNivel = datosJugador.xpParaSiguienteNivel - (datosJugador.nivel > 1
    ? obtenerXPNivelAnterior(datosJugador.nivel)
    : 0);
  const porcentaje = (xpEnNivelActual / xpNecesarioParaNivel) * 100;

  return (
    <View style={[styles.container, {
      backgroundColor: tema.colores.fondoSecundario,
      borderColor: tema.colores.primario,
    }]}>
      <View style={styles.header}>
        <View style={styles.nivelContainer}>
          <Text style={[styles.nivelTexto, { color: tema.colores.primarioClaro }]}>
            Nivel {datosJugador.nivel}
          </Text>
          <Text style={[styles.titulo, { color: tema.colores.texto }]}>
            {`⚔️ ${datosJugador.titulo}`}
          </Text>
        </View>
        <Text style={[styles.xpTexto, { color: tema.colores.textoSecundario }]}>
          {`${xpEnNivelActual}/${xpNecesarioParaNivel} XP`}
        </Text>
      </View>
      
      <View style={[styles.barraFondo, { 
        backgroundColor: tema.colores.fondo,
        borderColor: tema.colores.bordes,
      }]}>
        <View style={[styles.barraProgreso, { 
          width: `${porcentaje}%`,
          backgroundColor: tema.colores.primarioClaro,
        }]} />
      </View>
    </View>
  );
};

const obtenerXPNivelAnterior = (nivel: number): number => {
  const niveles = [0, 0, 50, 120, 220, 350, 520, 730, 1000, 1350, 1800, 2350, 3000];
  return niveles[nivel - 1] || 0;
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nivelContainer: {
    flex: 1,
  },
  nivelTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  xpTexto: {
    fontSize: 14,
  },
  barraFondo: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
  },
  barraProgreso: {
    height: '100%',
  },
});