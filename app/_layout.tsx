import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Establecer título y favicon de la página en web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Registrack';
      
      // Obtener la URI del logo usando require (Metro/Webpack lo resuelve automáticamente)
      try {
        // En web, require() devuelve una URL que podemos usar directamente
        const logoUri = require('@/assets/images/logo.png');
        
        // Configurar favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = typeof logoUri === 'string' ? logoUri : logoUri.default || logoUri;
        
        // También agregar apple-touch-icon para mejor compatibilidad
        let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
        appleLink.href = typeof logoUri === 'string' ? logoUri : logoUri.default || logoUri;
      } catch (error) {
        console.error('Error loading favicon:', error);
        // Fallback: usar la ruta relativa
        const fallbackPath = '/assets/images/logo.png';
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = fallbackPath;
      }
    }
  }, []);

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
          <Stack.Screen name="solicitudes-finalizadas" options={{ title: 'Solicitudes Finalizadas' }} />
          <Stack.Screen name="mis-procesos" options={{ title: 'Mis Procesos' }} />
          <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
