import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

interface Props {
  onPress: () => void;
}

export const BotonAgregar = ({ onPress }: Props) => {
  const { tema } = useTema();
  
  return (
    <TouchableOpacity 
      style={[styles.boton, {
        backgroundColor: tema.colores.acento,
        borderColor: tema.colores.primario,
      }]} 
      onPress={onPress}
    >
      <Text style={[styles.texto, { color: tema.colores.primarioClaro }]}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  texto: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});