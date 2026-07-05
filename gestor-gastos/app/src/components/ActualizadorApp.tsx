import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import * as Updates from 'expo-updates';
import { useTema } from '../context/TemaContext';

export const ActualizadorApp = () => {
  const { tema } = useTema();
  const { isUpdatePending } = Updates.useUpdates();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isUpdatePending) {
      setModalVisible(true);
    }
  }, [isUpdatePending]);

  const aplicarActualizacion = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error al recargar la aplicación:', error);
      setModalVisible(false);
    }
  };

  if (!modalVisible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: tema.colores.fondoSecundario, borderColor: tema.colores.bordes }]}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={[styles.titulo, { color: tema.colores.primario }]}>
            ¡Nueva actualización!
          </Text>
          <Text style={[styles.descripcion, { color: tema.colores.texto }]}>
            Hemos descargado mejoras para La Orden del Céntimo. Para aplicar los cambios de inmediato, presiona el botón para reiniciar la aplicación.
          </Text>

          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.botonAplicar, { backgroundColor: tema.colores.primario }]}
              onPress={aplicarActualizacion}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotonAplicar}>Aplicar y Reiniciar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonMasTarde, { borderColor: tema.colores.bordes }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.textoBotonMasTarde, { color: tema.colores.texto }]}>Más tarde</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 48,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  botones: {
    width: '100%',
    gap: 10,
  },
  botonAplicar: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonAplicar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  botonMasTarde: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  textoBotonMasTarde: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
