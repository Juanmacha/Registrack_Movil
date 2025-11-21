# 📊 Flujo de Datos del Perfil

Este documento explica de dónde viene la información que se muestra en el perfil del usuario.

## 🔄 Flujo Completo de Datos

```
1. Usuario hace login
   ↓
2. authApiService.login() → POST /api/usuarios/login
   ↓
3. API devuelve respuesta con estructura:
   {
     "success": true,
     "data": {
       "token": "...",
       "usuario": {
         "id_usuario": 1,
         "nombre": "Admin",
         "apellido": "Sistema",
         "correo": "admin@registrack.com",
         "rol": { ... }
         // ⚠️ AQUÍ: ¿Viene documento y tipo_documento?
       }
     }
   }
   ↓
4. persistSession() extrae el objeto usuario de la respuesta
   ↓
5. Se guarda en AsyncStorage como JSON string
   ↓
6. AuthContext obtiene el usuario de AsyncStorage (getStoredSession)
   ↓
7. ProfileScreen usa useAuth() → obtiene el objeto usuario
   ↓
8. Se muestran los campos: nombre, apellido, correo, documento, etc.
```

## 📍 Ubicación del Código

### 1. Perfil (`app/profile.tsx`)
```typescript
const { user } = useAuth(); // ← Obtiene el usuario del contexto
// Muestra: user.nombre, user.apellido, user.correo, user.documento, etc.
```

### 2. AuthContext (`contexts/AuthContext.tsx`)
```typescript
// Al hacer login:
const response = await authApiService.login(payload);
const { token, usuario } = await persistSession(response);
setUser(usuario); // ← Guarda el usuario en el estado

// Al iniciar la app:
const { token, usuario } = await getStoredSession();
setUser(usuario); // ← Restaura el usuario desde AsyncStorage
```

### 3. Storage (`storage/authStorage.ts`)
```typescript
// Extrae el usuario de la respuesta de la API
const extractAuthPayload = (raw: AuthLike) => {
  // Busca usuario en: raw.usuario, raw.data.usuario, raw.user, etc.
  return { token, usuario };
};

// Guarda en AsyncStorage
await AsyncStorage.setItem('currentUser', JSON.stringify(usuario));
```

### 4. API Service (`services/authApiService.ts`)
```typescript
async login(payload: LoginDto): Promise<AuthResponse> {
  const response = await apiClient.post('/api/usuarios/login', payload);
  return response.data; // ← Devuelve exactamente lo que la API responde
}
```

## ⚠️ Problema Identificado

**La información del perfil viene DIRECTAMENTE de la respuesta del login.**

Según la documentación en `RESPUESTAS_AUTH_REQUERIDA.md`, la respuesta del login incluye:
- ✅ `id_usuario`
- ✅ `nombre`
- ✅ `apellido`
- ✅ `correo`
- ✅ `rol`
- ❓ `documento` - **NO está documentado en la respuesta del login**
- ❓ `tipo_documento` - **NO está documentado en la respuesta del login**
- ❓ `telefono` - **NO está documentado en la respuesta del login**

## 🔍 Verificación Necesaria

Para que el documento aparezca en el perfil, necesitamos verificar:

1. **¿La API del login devuelve `documento` y `tipo_documento`?**
   - Revisar los logs de la consola: `🔍 DEBUG STORAGE - Usuario extraído`
   - Ver qué campos tiene realmente el objeto usuario

2. **Si NO viene en el login, opciones:**
   - Hacer una llamada adicional a un endpoint de perfil (ej: `GET /api/usuarios/perfil`)
   - O modificar el backend para incluir estos campos en la respuesta del login

## 📝 Logs de Debug

Los logs actuales muestran:
- `🔍 DEBUG STORAGE - Usuario extraído` - Muestra el objeto usuario completo
- `🔍 DEBUG PROFILE - Usuario completo` - Muestra todos los campos disponibles

Revisa estos logs en la consola para ver qué campos tiene realmente el usuario.

