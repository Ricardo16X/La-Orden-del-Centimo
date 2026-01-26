/**
 * Hook para manejar copias de seguridad y restauración
 */

import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage-keys';

interface DatosBackup {
  version: string;
  fecha: string;
  datos: {
    gastos?: string;
    categorias?: string;
    presupuestos?: string;
    tarjetas?: string;
    recordatorios?: string;
    tema?: string;
  };
}

export const useBackup = () => {
  /**
   * Crea una copia de seguridad completa de todos los datos
   */
  const crearBackup = async (): Promise<boolean> => {
    try {
      // Recopilar todos los datos
      const datos: DatosBackup = {
        version: '1.0.0',
        fecha: new Date().toISOString(),
        datos: {},
      };

      // Cargar todos los datos desde AsyncStorage
      const [gastos, categorias, presupuestos, tarjetas, recordatorios, tema] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.GASTOS),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIAS),
        AsyncStorage.getItem(STORAGE_KEYS.PRESUPUESTOS),
        AsyncStorage.getItem(STORAGE_KEYS.TARJETAS),
        AsyncStorage.getItem(STORAGE_KEYS.RECORDATORIOS),
        AsyncStorage.getItem(STORAGE_KEYS.TEMA),
      ]);

      if (gastos) datos.datos.gastos = gastos;
      if (categorias) datos.datos.categorias = categorias;
      if (presupuestos) datos.datos.presupuestos = presupuestos;
      if (tarjetas) datos.datos.tarjetas = tarjetas;
      if (recordatorios) datos.datos.recordatorios = recordatorios;
      if (tema) datos.datos.tema = tema;

      // Convertir a JSON
      const jsonString = JSON.stringify(datos, null, 2);

      // Crear archivo temporal
      const fechaFormateada = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      const filename = `gestor-gastos-backup-${fechaFormateada}.json`;
      const file = new File(Paths.cache, filename);

      await file.write(jsonString);

      // Compartir el archivo
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Guardar copia de seguridad',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creando backup:', error);
      Alert.alert('Error', 'No se pudo crear la copia de seguridad');
      return false;
    }
  };

  /**
   * Restaura los datos desde una copia de seguridad
   */
  const restaurarBackup = async (): Promise<boolean> => {
    try {
      // Seleccionar archivo
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return false;
      }

      const fileUri = result.assets[0].uri;

      // Leer el archivo
      const file = new File(fileUri);
      const contenido = await file.text();

      // Parsear el JSON
      const backup: DatosBackup = JSON.parse(contenido);

      // Validar estructura básica
      if (!backup.version || !backup.datos) {
        Alert.alert('Error', 'El archivo de copia de seguridad no es válido');
        return false;
      }

      // Confirmar restauración
      return new Promise((resolve) => {
        Alert.alert(
          'Restaurar datos',
          `¿Estás seguro de restaurar los datos desde ${new Date(backup.fecha).toLocaleDateString('es-ES')}? Esto sobrescribirá todos tus datos actuales.`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Restaurar',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Restaurar todos los datos
                  const promesas = [];

                  if (backup.datos.gastos) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.GASTOS, backup.datos.gastos));
                  }
                  if (backup.datos.categorias) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.CATEGORIAS, backup.datos.categorias));
                  }
                  if (backup.datos.presupuestos) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.PRESUPUESTOS, backup.datos.presupuestos));
                  }
                  if (backup.datos.tarjetas) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.TARJETAS, backup.datos.tarjetas));
                  }
                  if (backup.datos.recordatorios) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.RECORDATORIOS, backup.datos.recordatorios));
                  }
                  if (backup.datos.tema) {
                    promesas.push(AsyncStorage.setItem(STORAGE_KEYS.TEMA, backup.datos.tema));
                  }

                  await Promise.all(promesas);

                  Alert.alert(
                    'Éxito',
                    'Datos restaurados correctamente. Reinicia la app para ver los cambios.',
                    [{ text: 'OK' }]
                  );

                  resolve(true);
                } catch (error) {
                  console.error('Error restaurando backup:', error);
                  Alert.alert('Error', 'No se pudo restaurar la copia de seguridad');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error restaurando backup:', error);
      Alert.alert('Error', 'No se pudo leer el archivo de copia de seguridad');
      return false;
    }
  };

  return {
    crearBackup,
    restaurarBackup,
  };
};
