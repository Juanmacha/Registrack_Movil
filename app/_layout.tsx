import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
          <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
          <Stack.Screen name="forgot-password" options={{ title: 'Recuperar contraseña' }} />
          <Stack.Screen name="codigo-recuperacion" options={{ title: 'Código de verificación' }} />
          <Stack.Screen name="reset-password" options={{ title: 'Restablecer contraseña' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Panel de Administración' }} />
          <Stack.Screen name="solicitudes" options={{ title: 'Solicitudes' }} />
          <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
