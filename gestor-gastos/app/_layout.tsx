/**
 * Layout raíz de la aplicación
 * Configura los providers de contexto y la navegación principal
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { GastosProvider } from './src/context/GastosContext';
import { TemaProvider, useTema } from './src/context/TemaContext';
import { CategoriasProvider } from './src/context/CategoriasContext';
import { PresupuestosProvider } from './src/context/PresupuestosContext';
import { TarjetasProvider } from './src/context/TarjetasContext';
import { RecordatoriosProvider } from './src/context/RecordatoriosContext';
import { MetasProvider } from './src/context/MetasContext';
import { BalanceProvider } from './src/context/BalanceContext';
import { CuotasProvider } from './src/context/CuotasContext';
import { MonedasProvider } from './src/context/MonedasContext';

SplashScreen.preventAutoHideAsync();

function NavigationContent() {
  const { tema } = useTema();

  return (
    <View style={{ flex: 1, backgroundColor: tema.colores.fondo }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tema.colores.fondo },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="categorias" />
        <Stack.Screen name="presupuestos" />
        <Stack.Screen name="tarjetas" />
        <Stack.Screen name="recordatorios" />
        <Stack.Screen name="metas" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}

export default function RootLayout() {
  SplashScreen.hideAsync();

  return (
    <TemaProvider>
      <MonedasProvider>
        <CategoriasProvider>
          <GastosProvider>
            <PresupuestosProvider>
              <TarjetasProvider>
                <CuotasProvider>
                  <RecordatoriosProvider>
                    <MetasProvider>
                      <BalanceProvider>
                        <NavigationContent />
                      </BalanceProvider>
                    </MetasProvider>
                  </RecordatoriosProvider>
                </CuotasProvider>
              </TarjetasProvider>
            </PresupuestosProvider>
          </GastosProvider>
        </CategoriasProvider>
      </MonedasProvider>
    </TemaProvider>
  );
}