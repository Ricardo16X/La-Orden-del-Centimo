/**
 * Layout raíz de la aplicación
 * Configura los providers de contexto y la navegación principal
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GastosProvider } from './src/context/GastosContext';
import { NivelProvider } from './src/context/NivelContext';
import { TemaProvider } from './src/context/TemaContext';
import { CategoriasProvider } from './src/context/CategoriasContext';
import { PresupuestosProvider } from './src/context/PresupuestosContext';
import { TarjetasProvider } from './src/context/TarjetasContext';
import { RecordatoriosProvider } from './src/context/RecordatoriosContext';
import { MetasProvider } from './src/context/MetasContext';
import { BalanceProvider } from './src/context/BalanceContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  SplashScreen.hideAsync();

  return (
    <TemaProvider>
      <CategoriasProvider>
        <GastosProvider>
          <PresupuestosProvider>
            <TarjetasProvider>
              <RecordatoriosProvider>
                <MetasProvider>
                  <BalanceProvider>
                    <NivelProvider>
                      <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                      <StatusBar style="auto" />
                    </NivelProvider>
                  </BalanceProvider>
                </MetasProvider>
              </RecordatoriosProvider>
            </TarjetasProvider>
          </PresupuestosProvider>
        </GastosProvider>
      </CategoriasProvider>
    </TemaProvider>
  );
}