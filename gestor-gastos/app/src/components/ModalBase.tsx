import { Modal, View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ReactNode } from 'react';
import { useTema } from '../context/TemaContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /**
   * Si el modal tiene inputs de texto, usa 'center' para mejor UX con teclado
   * Si es solo lectura/selección, usa 'bottom' (default)
   */
  position?: 'bottom' | 'center';
  /**
   * Altura máxima del modal (default: 90% para bottom, 80% para center)
   */
  maxHeight?: string;
}

/**
 * Componente base para modales que maneja correctamente el teclado
 * y proporciona una UX consistente
 */
export const ModalBase = ({
  visible,
  onClose,
  children,
  title,
  position = 'bottom',
  maxHeight,
}: Props) => {
  const { tema } = useTema();

  const defaultMaxHeight = position === 'bottom' ? '90%' : '80%';
  const finalMaxHeight = maxHeight || defaultMaxHeight;

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
        <View style={[
          styles.overlay,
          position === 'center' && styles.overlayCenter
        ]}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: tema.colores.fondo,
                maxHeight: finalMaxHeight,
              },
              position === 'bottom' ? styles.modalBottom : styles.modalCenter,
            ]}
          >
            {/* Header con título y botón cerrar */}
            {title && (
              <View style={styles.header}>
                <Text style={[styles.titulo, { color: tema.colores.primario }]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.cerrar, { color: tema.colores.texto }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contenido con scroll */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {children}
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
  overlayCenter: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 20,
    padding: 20,
  },
  modalBottom: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modalCenter: {
    borderRadius: 20,
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
  scrollContent: {
    flexGrow: 1,
  },
});
