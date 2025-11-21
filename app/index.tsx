import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    // Redirigir inmediatamente: login si no hay sesión, tabs si hay sesión
    const target = isAuthenticated ? '/(tabs)/index' : '/login';
    router.replace(target);
  }, [isAuthenticated, loading, router]);

  // No mostrar nada, redirigir inmediatamente
  return null;
}

