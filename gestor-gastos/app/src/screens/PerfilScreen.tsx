import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useNivel } from '../context/NivelContext';
import { useTema } from '../context/TemaContext';
import { useBackup } from '../hooks';
import { ModalPersonalizacion } from '../components/ModalPersonalizacion';
import { ModalProgreso } from '../components/ModalProgreso';
import { ModalExportar } from '../components/ModalExportar';

export const PerfilScreen = () => {
  const { datosJugador } = useNivel();
  const { tema } = useTema();
  const { crearBackup, restaurarBackup } = useBackup();

  const [modalPersonalizacionVisible, setModalPersonalizacionVisible] = useState(false);
  const [modalProgresoVisible, setModalProgresoVisible] = useState(false);
  const [modalExportarVisible, setModalExportarVisible] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.colores.fondo }]}>
      <Text style={[styles.titulo, { color: tema.colores.primario }]}>👤 Tu Perfil</Text>
      <Text style={[styles.subtitulo, { color: tema.colores.textoSecundario }]}>
        Personalización y progreso
      </Text>

      {/* Menú de opciones */}
      <View style={styles.menu}>
        {/* Personalización */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => setModalPersonalizacionVisible(true)}
        >
          <View style={[styles.menuIcono, { backgroundColor: tema.colores.primario }]}>
            <Text style={styles.menuIconoTexto}>🎨</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Personalización
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Cambia el tema y apariencia
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Progreso */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => setModalProgresoVisible(true)}
        >
          <View style={[styles.menuIcono, { backgroundColor: tema.colores.primarioClaro }]}>
            <Text style={styles.menuIconoTexto}>⭐</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Tu Progreso
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              {`Nivel ${datosJugador.nivel} • ${datosJugador.xp} XP`}
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Exportar Datos */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={() => setModalExportarVisible(true)}
        >
          <View style={[styles.menuIcono, { backgroundColor: tema.colores.primario }]}>
            <Text style={styles.menuIconoTexto}>📤</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Exportar Datos
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Comparte tus gastos y resúmenes
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Crear Copia de Seguridad */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={async () => {
            const exito = await crearBackup();
            if (exito) {
              Alert.alert('Éxito', 'Copia de seguridad creada correctamente');
            }
          }}
        >
          <View style={[styles.menuIcono, { backgroundColor: '#10b981' }]}>
            <Text style={styles.menuIconoTexto}>💾</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Copia de Seguridad
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Guarda todos tus datos de forma segura
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>

        {/* Restaurar Copia de Seguridad */}
        <TouchableOpacity
          style={[styles.menuItem, {
            backgroundColor: tema.colores.fondoSecundario,
            borderColor: tema.colores.bordes,
          }]}
          onPress={restaurarBackup}
        >
          <View style={[styles.menuIcono, { backgroundColor: '#6366f1' }]}>
            <Text style={styles.menuIconoTexto}>📥</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitulo, { color: tema.colores.texto }]}>
              Restaurar Backup
            </Text>
            <Text style={[styles.menuDescripcion, { color: tema.colores.textoSecundario }]}>
              Recupera tus datos desde un archivo
            </Text>
          </View>
          <Text style={[styles.menuFlecha, { color: tema.colores.textoSecundario }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <ModalPersonalizacion
        visible={modalPersonalizacionVisible}
        onClose={() => setModalPersonalizacionVisible(false)}
      />

      <ModalProgreso
        visible={modalProgresoVisible}
        onClose={() => setModalProgresoVisible(false)}
      />

      <ModalExportar
        visible={modalExportarVisible}
        onClose={() => setModalExportarVisible(false)}
      />
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
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  menu: {
    gap: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
  },
  menuIcono: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconoTexto: {
    fontSize: 24,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescripcion: {
    fontSize: 13,
  },
  menuFlecha: {
    fontSize: 32,
    fontWeight: '300',
  },
});
