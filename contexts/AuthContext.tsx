import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApiService, LoginDto, RegisterDto, setAuthToken } from '@/services/authApiService';
import { persistSession, clearSession, getStoredSession } from '@/storage/authStorage';
import { AuthResponse, Usuario } from '@/types/auth';
import { ApiClientError, obtenerMensajeErrorUsuario } from '@/utils/apiError';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginDto) => Promise<Usuario>;
  register: (payload: RegisterDto) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { token: storedToken, usuario } = await getStoredSession();
        if (storedToken && (await authApiService.isTokenValid(storedToken))) {
          setTokenState(storedToken);
          setUser(usuario ?? null);
          setAuthToken(storedToken);
        } else {
          await clearSession();
        }
      } catch (error) {
        console.error('Error restaurando la sesión', error);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginDto) => {
    try {
      const response = await authApiService.login(payload);
      console.log('🔍 DEBUG AUTH CONTEXT - Respuesta del servicio:', JSON.stringify(response, null, 2));
      
      const { token: newToken, usuario } = await persistSession(response);
      console.log('🔍 DEBUG AUTH CONTEXT - Usuario después de persistSession:', JSON.stringify(usuario, null, 2));
      console.log('🔍 DEBUG AUTH CONTEXT - Roles del usuario:', usuario?.roles);
      
      setTokenState(newToken);
      setUser(usuario);
      setAuthToken(newToken);
      return usuario;
    } catch (error) {
      // Preservar el error original si es ApiClientError para mantener el status
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiClientError;
        const message = obtenerMensajeErrorUsuario(apiError);
        const newError = new Error(message) as ApiClientError;
        newError.status = apiError.status;
        newError.retryAfterMinutes = apiError.retryAfterMinutes;
        throw newError;
      }
      const message = obtenerMensajeErrorUsuario(error as ApiClientError);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (payload: RegisterDto) => {
    try {
      return await authApiService.register(payload);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as ApiClientError);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setTokenState(null);
    setAuthToken(null);
    await clearSession();
  }, []);

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!user?.roles) {
        return false;
      }
      const list = Array.isArray(roles) ? roles : [roles];
      return user.roles.some((rol) => {
        const roleName = typeof rol === 'string' ? rol : rol.nombre ?? '';
        return list.some((target) => roleName?.toUpperCase() === target.toUpperCase());
      });
    },
    [user?.roles],
  );

  const hasPermission = useCallback(
    (permissions: string | string[]) => {
      if (!user?.permisos) {
        return false;
      }
      const list = Array.isArray(permissions) ? permissions : [permissions];
      return list.some((permiso) => user.permisos?.includes(permiso));
    },
    [user?.permisos],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
      hasRole,
      hasPermission,
    }),
    [user, token, loading, login, register, logout, hasRole, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return context;
};

