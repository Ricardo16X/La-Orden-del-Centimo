import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  emoji: string;
  titulo: string;
  subtitulo?: string;
}

export function EstadoVacio({ emoji, titulo, subtitulo }: Props) {
  const { tema } = useTema();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.titulo, { color: tema.colores.texto }]}>{titulo}</Text>
      {subtitulo && (
        <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
          {subtitulo}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
