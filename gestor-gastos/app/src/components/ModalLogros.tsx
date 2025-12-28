import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useLogros } from '../context/LogrosContext';
import { CategoriaLogro } from '../types/logros';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalLogros = ({ visible, onClose }: Props) => {
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tema.colores.fondo }]}>
          <View style={styles.header}>
            <Text style={[styles.titulo, { color: tema.colores.primario }]}>
              🏆 Tus Logros
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.resumen, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
            <Text style={[styles.resumenTexto, { color: tema.colores.texto }]}>
              {totalLogrosDesbloqueados} / {logros.length} desbloqueados
            </Text>
            <Text style={[styles.porcentaje, { color: tema.colores.primario }]}>
              {porcentajeCompletado.toFixed(0)}%
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                        opacity: logro.desbloqueado ? 1 : 0.6,
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
      </View>
    </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cerrar: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  resumenTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  porcentaje: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriaContainer: {
    marginBottom: 24,
  },
  tituloCategoria: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logroCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
  },
  logroIcono: {
    fontSize: 32,
    marginRight: 12,
  },
  logroInfo: {
    flex: 1,
  },
  logroNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  logroDescripcion: {
    fontSize: 12,
    marginBottom: 6,
  },
  progresoContainer: {
    marginTop: 6,
  },
  barraProgreso: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 3,
  },
  barraProgresoFill: {
    height: '100%',
    borderRadius: 3,
  },
  progresoTexto: {
    fontSize: 10,
    fontWeight: '600',
  },
  recompensaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  recompensa: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  fechaDesbloqueo: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});
