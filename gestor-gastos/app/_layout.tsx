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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  SplashScreen.hideAsync();

  return (
    <TemaProvider>
      <CategoriasProvider>
        <GastosProvider>
          <NivelProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </NivelProvider>
        </GastosProvider>
      </CategoriasProvider>
    </TemaProvider>
  );
}