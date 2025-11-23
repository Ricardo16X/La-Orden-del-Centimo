import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNivel } from '../context/NivelContext';
import { useGastos } from '../context/GastosContext';
import { useTema } from '../context/TemaContext';
import { useEstadisticas } from '../hooks';
import { BarraNivel } from '../components/BarraNivel';
import { SelectorTema } from '../components/SelectorTema';
import { obtenerCategorias } from '../constants/categorias';

export const PerfilScreen = () => {
  const { datosJugador } = useNivel();
  const { gastos } = useGastos();
  const { tema } = useTema();

  // Obtener categorías según el tema
  const categorias = obtenerCategorias(tema.id, tema.categorias);

  // Usar hook de estadísticas
  const { gastosPorCategoria } = useEstadisticas(gastos, categorias);

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>👤 Tu Perfil</Text>

      <SelectorTema />

      <BarraNivel datosJugador={datosJugador} />

      <View style={[styles.seccion, {
        backgroundColor: tema.colores.fondoSecundario,
        borderColor: tema.colores.bordes,
      }]}>
        <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>📊 Estadísticas</Text>

        <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
          <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
            Gastos registrados:
          </Text>
          <Text style={[styles.estatValor, { color: tema.colores.primarioClaro }]}>
            {gastos.length}
          </Text>
        </View>

        <View style={[styles.estadistica, { borderBottomColor: tema.colores.bordes }]}>
          <Text style={[styles.estatLabel, { color: tema.colores.texto }]}>
            Experiencia total:
          </Text>
          <Text style={[styles.estatValor, { color: tema.colores.primarioClaro }]}>
            {datosJugador.xp} XP
          </Text>
        </View>
      </View>

      {gastosPorCategoria.length > 0 ? (
        <View style={[styles.seccion, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}>
          <Text style={[styles.subtitulo, { color: tema.colores.primario }]}>
            🏷️ Por Categoría
          </Text>
          {gastosPorCategoria.map(cat => (
            <View key={cat.id} style={[styles.categoriaItem, {
              borderBottomColor: tema.colores.bordes
            }]}>
              <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
              <View style={styles.categoriaInfo}>
                <Text style={[styles.categoriaNombre, { color: tema.colores.texto }]}>
                  {cat.nombre}
                </Text>
                <Text style={[styles.categoriaDetalle, { color: tema.colores.textoSecundario }]}>
                  {cat.cantidad} gastos • {cat.total.toFixed(2)} {tema.moneda}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.seccion, {
          backgroundColor: tema.colores.fondoSecundario,
          borderColor: tema.colores.bordes,
        }]}>
          <Text style={[styles.vacio, { color: tema.colores.textoSecundario }]}>
            No hay gastos registrados todavía.
          </Text>
        </View>
      )}
    </ScrollView>
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
  seccion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  estadistica: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  estatLabel: {
    fontSize: 16,
  },
  estatValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoriaEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriaDetalle: {
    fontSize: 14,
    marginTop: 2,
  },
  vacio: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
