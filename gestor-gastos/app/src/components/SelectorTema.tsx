import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTema } from '../context/TemaContext';

export const SelectorTema = () => {
  const { tema, cambiarTema, temasDisponibles } = useTema();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {temasDisponibles.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.temaBoton,
              {
                backgroundColor: t.colores.fondoSecundario,
                borderColor: tema.id === t.id ? t.colores.primario : t.colores.bordes,
                borderWidth: tema.id === t.id ? 3 : 2,
              }
            ]}
            onPress={() => cambiarTema(t.id)}
          >
            <Text style={styles.temaEmoji}>{t.emoji}</Text>
            <Text style={[styles.temaNombre, { color: t.colores.texto }]}>
              {t.nombre}
            </Text>
            {tema.id === t.id && (
              <View style={[styles.indicadorSeleccionado, { backgroundColor: t.colores.primario }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  temaBoton: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  temaEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  temaNombre: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  indicadorSeleccionado: {
    position: 'absolute',
    bottom: 8,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});