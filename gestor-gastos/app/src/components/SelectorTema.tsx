import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

export const SelectorTema = () => {
  const { tema, cambiarTema, temasDisponibles } = useTema();

  return (
    <View style={styles.container}>
      <View style={styles.temas}>
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
              <Text style={styles.seleccionado}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  temas: {
    flexDirection: 'row',
    gap: 15,
  },
  temaBoton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  temaEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  temaNombre: {
    fontSize: 14,
    fontWeight: '600',
  },
  seleccionado: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 20,
    color: '#4CAF50',
  },
});