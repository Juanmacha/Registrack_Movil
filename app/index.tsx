import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { tieneRolAdministrativo } from '@/utils/roles';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    
    // Redirigir según el rol del usuario
    if (tieneRolAdministrativo(user)) {
      router.replace('/dashboard');
    } else {
      // Para clientes, redirigir a Mis Procesos (primera opción del menú de cliente)
      router.replace('/(tabs)/mis-procesos');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, user]);

  // No mostrar nada, redirigir inmediatamente
  return null;
}

