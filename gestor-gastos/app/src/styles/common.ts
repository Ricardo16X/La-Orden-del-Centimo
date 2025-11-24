import { StyleSheet } from 'react-native';

/**
 * Estilos comunes reutilizables en toda la aplicación
 */

export const commonStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Textos
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  texto: {
    fontSize: 16,
  },
  textoSecundario: {
    fontSize: 14,
  },
  textoPequeno: {
    fontSize: 12,
  },

  // Inputs
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  inputMultiline: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Botones
  boton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSecundario: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  botonPequeno: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  // Separadores
  separador: {
    height: 1,
    marginVertical: 10,
  },
  separadorVertical: {
    width: 1,
    marginHorizontal: 10,
  },

  // Sombras
  sombra: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sombraLeve: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },

  // Posicionamiento
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  absoluteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  absoluteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  // Espaciado
  mb10: { marginBottom: 10 },
  mb20: { marginBottom: 20 },
  mt10: { marginTop: 10 },
  mt20: { marginTop: 20 },
  mx10: { marginHorizontal: 10 },
  my10: { marginVertical: 10 },
  p10: { padding: 10 },
  p15: { padding: 15 },
  p20: { padding: 20 },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;
