import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage-keys';

const BACKUP_VERSION = '2.0';
const APP_NAME = 'LaOrdenDelCentimo';

// Claves con nombre fijo en TemaContext (no están en STORAGE_KEYS)
const TEMA_MANUAL_KEY = '@tema_manual_id';
const MONEDA_LEGACY_KEY = '@moneda';

interface DatosBackup {
  version: string;
  appName: string;
  fecha: string;
  datos: {
    // Datos financieros
    gastos?: string;
    categorias?: string;
    presupuestos?: string;
    tarjetas?: string;
    metas?: string;
    cuotas?: string;
    monedas?: string;
    gastosRecurrentes?: string;
    recordatorios?: string;
    // Configuración
    tema?: string;
    modoOscuroAuto?: string;
    temaManualId?: string;
    monedaLegacy?: string;
  };
}

// Qué guardar y con qué clave dentro del JSON
const CLAVES_BACKUP: Array<{ storage: string; campo: keyof DatosBackup['datos'] }> = [
  { storage: STORAGE_KEYS.GASTOS,            campo: 'gastos' },
  { storage: STORAGE_KEYS.CATEGORIAS,        campo: 'categorias' },
  { storage: STORAGE_KEYS.PRESUPUESTOS,      campo: 'presupuestos' },
  { storage: STORAGE_KEYS.TARJETAS,          campo: 'tarjetas' },
  { storage: STORAGE_KEYS.METAS,             campo: 'metas' },
  { storage: STORAGE_KEYS.CUOTAS,            campo: 'cuotas' },
  { storage: STORAGE_KEYS.MONEDAS,           campo: 'monedas' },
  { storage: STORAGE_KEYS.GASTOS_RECURRENTES, campo: 'gastosRecurrentes' },
  { storage: STORAGE_KEYS.RECORDATORIOS,     campo: 'recordatorios' },
  { storage: STORAGE_KEYS.TEMA,              campo: 'tema' },
  { storage: STORAGE_KEYS.MODO_OSCURO_AUTO,  campo: 'modoOscuroAuto' },
  { storage: TEMA_MANUAL_KEY,                campo: 'temaManualId' },
  { storage: MONEDA_LEGACY_KEY,              campo: 'monedaLegacy' },
];

export const useBackup = () => {
  const crearBackup = async (): Promise<boolean> => {
    try {
      const valores = await Promise.all(
        CLAVES_BACKUP.map(({ storage }) => AsyncStorage.getItem(storage))
      );

      const datos: DatosBackup['datos'] = {};
      CLAVES_BACKUP.forEach(({ campo }, i) => {
        if (valores[i] !== null) {
          datos[campo] = valores[i]!;
        }
      });

      const backup: DatosBackup = {
        version: BACKUP_VERSION,
        appName: APP_NAME,
        fecha: new Date().toISOString(),
        datos,
      };

      const json = JSON.stringify(backup, null, 2);

      const fecha = new Date().toLocaleDateString('es-GT', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).replace(/\//g, '-');
      const filename = `orden-centimo-backup-${fecha}.json`;
      const file = new File(Paths.cache, filename);
      await file.write(json);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
        return false;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Guardar copia de seguridad',
        UTI: 'public.json',
      });

      return true;
    } catch (error) {
      console.error('Error creando backup:', error);
      Alert.alert('Error', 'No se pudo crear la copia de seguridad');
      return false;
    }
  };

  const restaurarBackup = async (): Promise<boolean> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return false;

      const file = new File(result.assets[0].uri);
      const contenido = await file.text();
      const backup: DatosBackup = JSON.parse(contenido);

      if (!backup.datos || !backup.version) {
        Alert.alert('Archivo inválido', 'Este archivo no es una copia de seguridad válida.');
        return false;
      }

      // Contar cuántos campos tiene el backup para informar al usuario
      const numColecciones = Object.keys(backup.datos).length;
      const fechaStr = new Date(backup.fecha).toLocaleDateString('es-GT', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Restaurar copia de seguridad',
          `Backup del ${fechaStr}\n${numColecciones} colecciones encontradas.\n\n⚠️ Esto reemplazará todos tus datos actuales.`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Restaurar',
              style: 'destructive',
              onPress: async () => {
                try {
                  const promesas: Promise<void>[] = [];

                  // Mapa de campos v2 → storage key
                  const mapaRestore: Record<string, string> = {};
                  CLAVES_BACKUP.forEach(({ storage, campo }) => {
                    mapaRestore[campo] = storage;
                  });

                  // Restaurar campos presentes en el backup
                  for (const [campo, valor] of Object.entries(backup.datos)) {
                    const key = mapaRestore[campo];
                    if (key && valor) {
                      promesas.push(AsyncStorage.setItem(key, valor));
                    }
                  }

                  // Compatibilidad v1: los campos tenían nombres distintos
                  if (backup.version === '1.0.0') {
                    // v1 no tenía metas, cuotas, monedas ni gastosRecurrentes — no hay nada extra que mapear
                    // Los campos gastos/categorias/presupuestos/tarjetas/recordatorios/tema coinciden
                  }

                  await Promise.all(promesas);

                  Alert.alert(
                    '✅ Restauración completada',
                    'Tus datos han sido restaurados. Cierra y vuelve a abrir la app para ver los cambios.',
                    [{ text: 'Entendido' }]
                  );

                  resolve(true);
                } catch (err) {
                  console.error('Error restaurando backup:', err);
                  Alert.alert('Error', 'No se pudieron restaurar los datos.');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error leyendo backup:', error);
      Alert.alert('Error', 'No se pudo leer el archivo. Asegúrate de seleccionar un backup válido.');
      return false;
    }
  };

  return { crearBackup, restaurarBackup };
};
