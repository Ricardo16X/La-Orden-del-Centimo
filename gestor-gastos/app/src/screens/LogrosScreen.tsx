import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useLogros } from '../context/LogrosContext';
import { CategoriaLogro } from '../types/logros';

export const LogrosScreen = () => {
  const { tema } = useTema();
  const { logros, totalLogrosDesbloqueados, porcentajeCompletado } = useLogros();

  const logrosPorCategoria = logros.reduce((acc, logro) => {
    if (!acc[logro.categoria]) {
      acc[logro.categoria] = [];
    }
    acc[logro.categoria].push(logro);
    return acc;
  }, {} as Record<CategoriaLogro, typeof logros>);

  const obtenerTituloCategoria = (categoria: CategoriaLogro): string => {
    const titulos: Record<CategoriaLogro, string> = {
      registro: '📝 Registro',
      ahorro: '💰 Ahorro',
      presupuesto: '📊 Presupuesto',
      disciplina: '💪 Disciplina',
      crecimiento: '📈 Crecimiento',
    };
    return titulos[categoria];
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: tema.colores.primario }]}>
          🏆 Logros
        </Text>
        <View style={[styles.resumen, { backgroundColor: tema.colores.fondoSecundario }]}>
          <Text style={[styles.resumenTexto, { color: tema.colores.texto }]}>
            {totalLogrosDesbloqueados} / {logros.length} desbloqueados
          </Text>
          <Text style={[styles.porcentaje, { color: tema.colores.primario }]}>
            {porcentajeCompletado.toFixed(0)}%
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(logrosPorCategoria).map(([categoria, logrosCategoria]) => (
          <View key={categoria} style={styles.categoriaContainer}>
            <Text style={[styles.tituloCategoria, { color: tema.colores.texto }]}>
              {obtenerTituloCategoria(categoria as CategoriaLogro)}
            </Text>

            {logrosCategoria.map(logro => (
              <View
                key={logro.id}
                style={[
                  styles.logroCard,
                  {
                    backgroundColor: logro.desbloqueado
                      ? tema.colores.fondoSecundario
                      : tema.colores.fondo,
                    borderColor: logro.desbloqueado
                      ? tema.colores.primario
                      : tema.colores.bordes,
                    opacity: logro.desbloqueado ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={styles.logroIcono}>
                  {logro.desbloqueado ? logro.icono : '🔒'}
                </Text>

                <View style={styles.logroInfo}>
                  <Text
                    style={[
                      styles.logroNombre,
                      {
                        color: logro.desbloqueado
                          ? tema.colores.primario
                          : tema.colores.textoSecundario,
                      },
                    ]}
                  >
                    {logro.nombre}
                  </Text>

                  <Text
                    style={[
                      styles.logroDescripcion,
                      {
                        color: logro.desbloqueado
                          ? tema.colores.texto
                          : tema.colores.textoSecundario,
                      },
                    ]}
                  >
                    {logro.desbloqueado ? logro.descripcion : '???'}
                  </Text>

                  {!logro.desbloqueado && logro.meta && (
                    <View style={styles.progresoContainer}>
                      <View
                        style={[
                          styles.barraProgreso,
                          { backgroundColor: tema.colores.bordes },
                        ]}
                      >
                        <View
                          style={[
                            styles.barraProgresoFill,
                            {
                              backgroundColor: tema.colores.primario,
                              width: `${logro.progreso || 0}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progresoTexto,
                          { color: tema.colores.textoSecundario },
                        ]}
                      >
                        {logro.valorActual || 0} / {logro.meta}
                      </Text>
                    </View>
                  )}

                  {logro.desbloqueado && (
                    <View style={styles.recompensaContainer}>
                      <Text
                        style={[
                          styles.recompensa,
                          { color: tema.colores.acento },
                        ]}
                      >
                        +{logro.xpRecompensa} XP
                      </Text>
                      {logro.fechaDesbloqueo && (
                        <Text
                          style={[
                            styles.fechaDesbloqueo,
                            { color: tema.colores.textoSecundario },
                          ]}
                        >
                          {new Date(logro.fechaDesbloqueo).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resumenTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  porcentaje: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoriaContainer: {
    marginBottom: 24,
  },
  tituloCategoria: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logroCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  logroIcono: {
    fontSize: 40,
    marginRight: 16,
  },
  logroInfo: {
    flex: 1,
  },
  logroNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logroDescripcion: {
    fontSize: 13,
    marginBottom: 8,
  },
  progresoContainer: {
    marginTop: 8,
  },
  barraProgreso: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barraProgresoFill: {
    height: '100%',
    borderRadius: 3,
  },
  progresoTexto: {
    fontSize: 11,
    fontWeight: '600',
  },
  recompensaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recompensa: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  fechaDesbloqueo: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
