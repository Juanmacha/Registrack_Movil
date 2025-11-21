import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthResponse, Usuario } from '@/types/auth';

const STORAGE_KEYS = {
  authToken: 'authToken',
  token: 'token',
  currentUser: 'currentUser',
  user: 'user',
  userData: 'userData',
  isAuthenticated: 'isAuthenticated',
};

const SECURE_TOKEN_KEY = STORAGE_KEYS.authToken;

type AuthLike = Partial<AuthResponse> & {
  data?: Partial<AuthResponse> & Record<string, unknown>;
  payload?: Partial<AuthResponse> & Record<string, unknown>;
  result?: Partial<AuthResponse> & Record<string, unknown>;
  [key: string]: unknown;
};

const extractAuthPayload = (raw: AuthLike): { token?: string | null; usuario?: Usuario | null } => {
  // DEBUG: Log para ver la estructura completa
  console.log('🔍 DEBUG EXTRACT - Estructura completa recibida:', JSON.stringify(raw, null, 2));
  
  const sources = [raw, raw?.data, raw?.payload, raw?.result].filter(Boolean) as AuthLike[];

  for (const source of sources) {
    // Buscar token en múltiples ubicaciones
    const token =
      (source.token as string | undefined) ??
      (source.accessToken as string | undefined) ??
      ((source as { data?: { token?: string } }).data?.token as string | undefined);
    
    // Buscar usuario en múltiples ubicaciones
    const usuario =
      (source.usuario as Usuario | undefined) ??
      (source.user as Usuario | undefined) ??
      (source.usuarioData as Usuario | undefined) ??
      (source.userData as Usuario | undefined) ??
      ((source as { data?: { usuario?: Usuario; user?: Usuario } }).data?.usuario as Usuario | undefined) ??
      ((source as { data?: { usuario?: Usuario; user?: Usuario } }).data?.user as Usuario | undefined);

    console.log('🔍 DEBUG EXTRACT - Token encontrado:', token ? 'Sí' : 'No');
    console.log('🔍 DEBUG EXTRACT - Usuario encontrado:', usuario ? 'Sí' : 'No');
    if (usuario) {
      console.log('🔍 DEBUG EXTRACT - Usuario.rol:', usuario.rol);
      console.log('🔍 DEBUG EXTRACT - Tipo de rol:', typeof usuario.rol);
    }

    if (token && usuario) {
      return { token, usuario };
    }
  }

  const fallbackToken =
    (raw.token as string | undefined) ??
    (raw.accessToken as string | undefined) ??
    (raw.data?.token as string | undefined) ??
    (raw.payload?.token as string | undefined) ??
    (raw.result?.token as string | undefined) ??
    null;

  const fallbackUser =
    (raw.usuario as Usuario | undefined) ??
    (raw.user as Usuario | undefined) ??
    (raw.data?.usuario as Usuario | undefined) ??
    (raw.data?.user as Usuario | undefined) ??
    (raw.data?.usuarioData as Usuario | undefined) ??
    (raw.payload?.usuario as Usuario | undefined) ??
    (raw.payload?.user as Usuario | undefined) ??
    (raw.result?.usuario as Usuario | undefined) ??
    (raw.result?.user as Usuario | undefined) ??
    null;

  return { token: fallbackToken ?? undefined, usuario: fallbackUser ?? undefined };
};

export const persistSession = async (data: AuthResponse | AuthLike) => {
  // DEBUG: Log para ver qué se recibe
  console.log('🔍 DEBUG STORAGE - Datos recibidos:', JSON.stringify(data, null, 2));
  
  const { token, usuario } = extractAuthPayload(data);
  console.log('🔍 DEBUG STORAGE - Token extraído:', token ? 'Token presente' : 'Token faltante');
  console.log('🔍 DEBUG STORAGE - Usuario extraído:', JSON.stringify(usuario, null, 2));
  console.log('🔍 DEBUG STORAGE - Roles del usuario:', usuario?.roles);
  console.log('🔍 DEBUG STORAGE - Tipo de roles:', typeof usuario?.roles);

  if (!token || !usuario) {
    throw new Error('Respuesta de autenticación inválida.');
  }

  const userString = JSON.stringify(usuario);

  const entries: [string, string][] = [
    [STORAGE_KEYS.authToken, token],
    [STORAGE_KEYS.token, token],
    [STORAGE_KEYS.currentUser, userString],
    [STORAGE_KEYS.user, userString],
    [STORAGE_KEYS.userData, userString],
    [STORAGE_KEYS.isAuthenticated, 'true'],
  ];

  await AsyncStorage.multiSet(entries);

  if (!__DEV__) {
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  }

  return { token, usuario };
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  if (!__DEV__) {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  }
};

export const getStoredSession = async (): Promise<{ token: string | null; usuario: Usuario | null }> => {
  const values = await AsyncStorage.multiGet([
    STORAGE_KEYS.authToken,
    STORAGE_KEYS.userData,
    STORAGE_KEYS.user,
    STORAGE_KEYS.currentUser,
  ]);

  const token = values.find(([key]) => key === STORAGE_KEYS.authToken)?.[1] ?? null;

  let usuario: Usuario | null = null;
  for (const [, value] of values) {
    if (value) {
      try {
        usuario = JSON.parse(value) as Usuario;
        break;
      } catch {
        // ignore parsing errors
      }
    }
  }

  if (!token && !__DEV__) {
    const secureToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    if (secureToken) {
      return { token: secureToken, usuario };
    }
  }

  return { token, usuario };
};

