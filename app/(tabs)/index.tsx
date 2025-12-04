import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    router.replace('/login');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hola, {user?.nombre ?? 'Registrack'} 👋</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Sesión activa</ThemedText>
        <ThemedText>Ya puedes navegar por la app o cerrar sesión para volver al login.</ThemedText>
        {user && tieneRolAdministrativo(user) ? (
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => router.push('/dashboard')}>
            <Text style={styles.dashboardText}>📊 Ir al Dashboard</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => router.push('/mis-procesos')}>
            <Text style={styles.dashboardText}>📋 Mis Procesos</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.logoutButton, loading && { opacity: 0.8 }]} onPress={handleLogout} disabled={loading}>
          <Text style={styles.logoutText}>{loading ? 'Cerrando...' : 'Cerrar sesión'}</Text>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Explorar módulos</ThemedText>
        <ThemedText>
          Esta es la pestaña principal. Ajusta el contenido según el rol administrativo o cliente.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0px 6px 12px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  dashboardButton: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dashboardText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
