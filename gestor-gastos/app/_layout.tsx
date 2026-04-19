/**
 * Layout raíz de la aplicación
 * Configura los providers de contexto y la navegación principal
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { ToastProvider } from './src/context/ToastContext';
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
import { GastosRecurrentesProvider } from './src/context/GastosRecurrentesContext';
import { useGeneradorGastosRecurrentes } from './src/hooks/useGeneradorGastosRecurrentes';

SplashScreen.preventAutoHideAsync();

function NavigationContent() {
  const { tema } = useTema();
  useGeneradorGastosRecurrentes();

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
        <Stack.Screen name="categorias" options={{
          headerShown: true,
          title: 'Categorías',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="presupuestos" options={{
          headerShown: true,
          title: 'Presupuestos',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="tarjetas" options={{
          headerShown: true,
          title: 'Tarjetas de Crédito',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="recordatorios" options={{
          headerShown: true,
          title: 'Recordatorios',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="metas" options={{
          headerShown: true,
          title: 'Metas de Ahorro',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="gastosRecurrentes" options={{
          headerShown: true,
          title: 'Gastos Recurrentes',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="transferencias" options={{
          headerShown: true,
          title: 'Transferencias',
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}

export default function RootLayout() {
  SplashScreen.hideAsync();

  return (
    <ToastProvider>
    <TemaProvider>
      <MonedasProvider>
        <CategoriasProvider>
          <GastosProvider>
            <GastosRecurrentesProvider>
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
            </GastosRecurrentesProvider>
          </GastosProvider>
        </CategoriasProvider>
      </MonedasProvider>
    </TemaProvider>
    </ToastProvider>
  );
}