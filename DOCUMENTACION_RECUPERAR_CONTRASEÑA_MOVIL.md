# Documentación: Recuperar Contraseña - Implementación Móvil

## 📋 Tabla de Contenidos
1. [Flujo General](#flujo-general)
2. [Endpoints de la API](#endpoints-de-la-api)
3. [Pantallas del Flujo](#pantallas-del-flujo)
4. [Implementación Detallada](#implementación-detallada)
5. [Validaciones](#validaciones)
6. [Manejo de Errores](#manejo-de-errores)
7. [Almacenamiento Local](#almacenamiento-local)
8. [Ejemplo de Código](#ejemplo-de-código)

---

## 🔄 Flujo General

El proceso de recuperación de contraseña consta de **3 pasos**:

```
1. ForgotPassword (Solicitar código)
   ↓
2. CodigoRecuperacion (Verificar código)
   ↓
3. ResetPassword (Nueva contraseña)
```

### Diagrama de Flujo

```
┌─────────────────────┐
│  Usuario olvidó     │
│  su contraseña      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  1. ForgotPassword  │
│  - Ingresa email    │
│  - Valida formato   │
│  - POST /forgot-    │
│    password         │
└──────────┬──────────┘
           │
           ▼ (Guarda email)
┌─────────────────────┐
│ 2. CodigoRecuperacion│
│  - Ingresa código   │
│    (6 dígitos)      │
│  - Valida código    │
│  - Verifica token   │
└──────────┬──────────┘
           │
           ▼ (Guarda token)
┌─────────────────────┐
│  3. ResetPassword   │
│  - Nueva contraseña │
│  - Confirmar        │
│  - POST /reset-     │
│    password         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Éxito → Login      │
└─────────────────────┘
```

---

## 🔌 Endpoints de la API

### 1. Solicitar Código de Recuperación

**Endpoint:** `POST /api/usuarios/forgot-password`

**Headers:**
```javascript
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Código de recuperación enviado al correo electrónico"
}
```

**Respuesta de Error (404):**
```json
{
  "success": false,
  "mensaje": "El email no está registrado en el sistema."
}
```

**Respuesta de Error (429 - Rate Limit):**
```json
{
  "success": false,
  "mensaje": "Demasiados intentos. Por favor espera X minutos antes de intentar de nuevo."
}
```

---

### 2. Restablecer Contraseña

**Endpoint:** `POST /api/usuarios/reset-password`

**Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}" // Opcional, depende de la implementación
}
```

**Body:**
```json
{
  "token": "123456",  // Código de 6 dígitos
  "newPassword": "NuevaContraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Contraseña restablecida exitosamente"
}
```

**Respuesta de Error (400):**
```json
{
  "success": false,
  "mensaje": "Token inválido o expirado"
}
```

**Respuesta de Error (400 - Contraseña débil):**
```json
{
  "success": false,
  "mensaje": "La contraseña no cumple con los requisitos de seguridad"
}
```

---

## 📱 Pantallas del Flujo

### Pantalla 1: ForgotPassword (Solicitar Código)

**Campos:**
- **Email** (obligatorio)
  - Tipo: `email`
  - Validación: Formato de email válido
  - Placeholder: `"admin@registrack.com"`

**Funcionalidad:**
1. Usuario ingresa su email
2. Validar formato de email
3. Sanitizar email (remover espacios, caracteres especiales)
4. Llamar a `POST /api/usuarios/forgot-password`
5. Guardar email en almacenamiento local
6. Navegar a pantalla de código

**Validaciones:**
- Email no puede estar vacío
- Formato de email válido (`/^[^@\s]+@[^@\s]+\.[^@\s]+$/`)

**Mensajes:**
- ✅ Éxito: "Se ha enviado un código de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y spam."
- ❌ Error 404: "El email no está registrado en el sistema."
- ❌ Error 429: "Demasiados intentos. Por favor espera X minutos."
- ❌ Error conexión: "No se pudo conectar con el servidor. Verifica tu conexión a internet."

---

### Pantalla 2: CodigoRecuperacion (Verificar Código)

**Campos:**
- **Código** (obligatorio)
  - Tipo: `text` o `number`
  - Validación: Exactamente 6 dígitos numéricos
  - Placeholder: `"123456"`
  - Máximo: 6 caracteres

**Funcionalidad:**
1. Usuario ingresa código de 6 dígitos recibido por email
2. Validar que sea 6 dígitos numéricos
3. Verificar código (actualmente simulado, debería validarse con API)
4. Guardar código como `resetToken` en almacenamiento local
5. Navegar a pantalla de reset

**Validaciones:**
- Código no puede estar vacío
- Formato: `/^\d{6}$/` (exactamente 6 dígitos)

**Mensajes:**
- ✅ Éxito: "El código de recuperación ha sido verificado correctamente."
- ❌ Error: "El código debe tener 6 dígitos."

**Nota:** Actualmente la verificación del código está simulada. En producción, debería validarse con un endpoint de la API.

---

### Pantalla 3: ResetPassword (Nueva Contraseña)

**Campos:**
- **Nueva Contraseña** (obligatorio)
  - Tipo: `password`
  - Validación: Requisitos de seguridad
  - Placeholder: `"Nueva contraseña"`
  
- **Confirmar Contraseña** (obligatorio)
  - Tipo: `password`
  - Validación: Debe coincidir con nueva contraseña
  - Placeholder: `"Confirmar contraseña"`

**Funcionalidad:**
1. Validar que existe `resetToken` en almacenamiento local
2. Usuario ingresa nueva contraseña
3. Validar requisitos de seguridad en tiempo real
4. Usuario confirma contraseña
5. Validar que ambas contraseñas coincidan
6. Llamar a `POST /api/usuarios/reset-password`
7. Limpiar `resetToken` y `emailRecuperacion`
8. Navegar a login

**Validaciones:**
- Nueva contraseña debe cumplir requisitos de seguridad
- Confirmar contraseña debe coincidir con nueva contraseña
- `resetToken` debe existir en almacenamiento local

**Requisitos de Contraseña:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

**Mensajes:**
- ✅ Éxito: "Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión."
- ❌ Error: "Token inválido o expirado. Solicita uno nuevo."
- ❌ Error: "Las contraseñas no coinciden."
- ❌ Error: "La contraseña no cumple con los requisitos de seguridad."

---

## 💻 Implementación Detallada

### Servicio de API (authApiService)

```javascript
// authApiService.js

const BASE_URL = 'https://api-registrack-2.onrender.com'; // o tu URL
const API_ENDPOINTS = {
  FORGOT_PASSWORD: '/api/usuarios/forgot-password',
  RESET_PASSWORD: '/api/usuarios/reset-password'
};

export const authApiService = {
  /**
   * Solicitar código de recuperación
   * @param {string} email - Email del usuario
   * @returns {Promise<{success: boolean, message: string}>}
   */
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.mensaje || data.message || 'Error al enviar solicitud'
        };
      }

      return {
        success: true,
        message: data.mensaje || data.message || 'Código de recuperación enviado'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'No se pudo conectar con el servidor'
      };
    }
  },

  /**
   * Restablecer contraseña
   * @param {string} token - Código de 6 dígitos
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<{success: boolean, message: string}>}
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.mensaje || data.message || data.error || 'Error al restablecer contraseña'
        };
      }

      return {
        success: true,
        message: data.mensaje || data.message || 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor'
      };
    }
  }
};
```

---

### Utilidades

#### Sanitizar Email

```javascript
/**
 * Sanitiza el email removiendo espacios y caracteres especiales
 * @param {string} email - Email a sanitizar
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};
```

#### Validar Contraseña

```javascript
/**
 * Valida la fortaleza de la contraseña
 * @param {string} password - Contraseña a validar
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Obtiene requisitos de contraseña en texto corto
 * @returns {string}
 */
export const getPasswordRequirementsShort = () => {
  return 'Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números';
};
```

---

## ✅ Validaciones

### Email
- ✅ No vacío
- ✅ Formato válido: `/^[^@\s]+@[^@\s]+\.[^@\s]+$/`
- ✅ Sanitizar antes de enviar (trim, lowercase)

### Código de Recuperación
- ✅ No vacío
- ✅ Exactamente 6 dígitos: `/^\d{6}$/`
- ✅ Solo números

### Nueva Contraseña
- ✅ No vacío
- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula
- ✅ Al menos 1 minúscula
- ✅ Al menos 1 número
- ✅ Coincidir con confirmación

---

## ⚠️ Manejo de Errores

### Errores Comunes

| Código | Descripción | Manejo |
|--------|-------------|--------|
| 404 | Email no registrado | Mostrar mensaje: "El email no está registrado en el sistema." |
| 400 | Token inválido/expirado | Redirigir a ForgotPassword con mensaje |
| 400 | Contraseña débil | Mostrar requisitos de contraseña |
| 429 | Rate limit | Mostrar tiempo de espera |
| 500 | Error del servidor | Mostrar mensaje genérico |
| Network | Sin conexión | Mostrar: "Verifica tu conexión a internet" |

### Ejemplo de Manejo

```javascript
try {
  const result = await authApiService.forgotPassword(email);
  
  if (result.success) {
    // Guardar email y navegar
    await AsyncStorage.setItem('emailRecuperacion', email);
    navigation.navigate('CodigoRecuperacion');
  } else {
    // Mostrar error
    Alert.alert('Error', result.message);
  }
} catch (error) {
  Alert.alert(
    'Error de conexión',
    'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  );
}
```

---

## 💾 Almacenamiento Local

### Claves a Usar (AsyncStorage en React Native)

| Clave | Valor | Cuándo Guardar | Cuándo Limpiar |
|-------|-------|----------------|----------------|
| `emailRecuperacion` | Email del usuario | Después de forgotPassword exitoso | Después de resetPassword exitoso |
| `resetToken` | Código de 6 dígitos | Después de verificar código | Después de resetPassword exitoso |

### Implementación AsyncStorage

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar
await AsyncStorage.setItem('emailRecuperacion', email);
await AsyncStorage.setItem('resetToken', codigo);

// Leer
const email = await AsyncStorage.getItem('emailRecuperacion');
const token = await AsyncStorage.getItem('resetToken');

// Eliminar
await AsyncStorage.removeItem('emailRecuperacion');
await AsyncStorage.removeItem('resetToken');

// Limpiar todo
await AsyncStorage.multiRemove(['emailRecuperacion', 'resetToken']);
```

---

## 📝 Ejemplo de Código Completo

### Pantalla 1: ForgotPassword

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService } from '../services/authApiService';
import { sanitizeEmail } from '../utils/sanitizer';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) return 'Por favor ingresa un correo electrónico.';
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(value)) return 'Ingresa un correo válido.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateEmail(email);
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setLoading(true);
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const result = await authApiService.forgotPassword(sanitizedEmail);

      if (result.success) {
        await AsyncStorage.setItem('emailRecuperacion', email);
        Alert.alert(
          '¡Solicitud enviada!',
          'Se ha enviado un código de recuperación a tu correo electrónico.',
          [{ text: 'Continuar', onPress: () => navigation.navigate('CodigoRecuperacion') }]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="admin@registrack.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <Button
        title={loading ? 'Enviando...' : 'Enviar Código'}
        onPress={handleSubmit}
        disabled={loading || !email}
      />
    </View>
  );
};
```

---

### Pantalla 2: CodigoRecuperacion

```javascript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CodigoRecuperacionScreen = ({ navigation }) => {
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Recuperar email guardado
    AsyncStorage.getItem('emailRecuperacion').then(email => {
      if (email) setEmail(email);
    });
  }, []);

  const handleSubmit = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de recuperación.');
      return;
    }

    // Validar formato (6 dígitos)
    if (!/^\d{6}$/.test(codigo)) {
      Alert.alert('Error', 'El código debe tener 6 dígitos.');
      return;
    }

    try {
      // TODO: Validar código con API
      // Por ahora simular verificación
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Guardar token y navegar
      await AsyncStorage.setItem('resetToken', codigo);
      Alert.alert(
        '¡Código válido!',
        'El código ha sido verificado correctamente.',
        [{ text: 'Continuar', onPress: () => navigation.navigate('ResetPassword') }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el código. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="123456"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />
      <Button
        title="Verificar Código"
        onPress={handleSubmit}
        disabled={!codigo}
      />
    </View>
  );
};
```

---

### Pantalla 3: ResetPassword

```javascript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService } from '../services/authApiService';
import { validatePasswordStrength } from '../utils/passwordValidator';

const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar que existe token
    AsyncStorage.getItem('resetToken').then(token => {
      if (!token) {
        Alert.alert(
          'Token no encontrado',
          'No se encontró el código de recuperación. Por favor, solicita uno nuevo.',
          [{ text: 'OK', onPress: () => navigation.navigate('ForgotPassword') }]
        );
      } else {
        setToken(token);
      }
    });
  }, []);

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordError(validation.isValid ? '' : validation.errors[0]);
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    // Validar fortaleza
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      Alert.alert('Contraseña no válida', validation.errors[0]);
      return;
    }

    // Validar coincidencia
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No se encontró el token de recuperación.');
      return;
    }

    try {
      const result = await authApiService.resetPassword(token, newPassword);

      if (result.success) {
        // Limpiar almacenamiento
        await AsyncStorage.multiRemove(['resetToken', 'emailRecuperacion']);
        
        Alert.alert(
          '¡Contraseña restablecida!',
          'Tu contraseña ha sido actualizada correctamente.',
          [{ text: 'Ir al Login', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo restablecer la contraseña.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nueva contraseña"
        value={newPassword}
        onChangeText={handlePasswordChange}
        secureTextEntry={!showPassword}
        style={styles.input}
      />
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <TextInput
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        style={styles.input}
      />

      <Button
        title="Restablecer Contraseña"
        onPress={handleReset}
        disabled={!newPassword || !confirmPassword || !!passwordError}
      />
    </View>
  );
};
```

---

## 🔐 Configuración de API

```javascript
// apiConfig.js

export const API_CONFIG = {
  BASE_URL: 'https://api-registrack-2.onrender.com', // Cambiar según entorno
  ENDPOINTS: {
    FORGOT_PASSWORD: '/api/usuarios/forgot-password',
    RESET_PASSWORD: '/api/usuarios/reset-password'
  }
};
```

---

## 📌 Notas Importantes

1. **Seguridad:**
   - Nunca mostrar el token en logs de producción
   - Sanitizar inputs antes de enviar
   - Validar en cliente Y servidor

2. **UX:**
   - Mostrar indicadores de carga
   - Mensajes de error claros y útiles
   - Permitir volver atrás en cada pantalla

3. **Validación del Código:**
   - Actualmente está simulada (línea 60 en `codigoRecuperacion.jsx`)
   - En producción, debería validarse con un endpoint de la API

4. **Rate Limiting:**
   - El backend implementa rate limiting
   - Mostrar tiempo de espera al usuario
   - Deshabilitar botón durante el tiempo de espera

5. **Tokens:**
   - Los tokens tienen expiración
   - Si expira, redirigir a ForgotPassword

---

## ✅ Checklist de Implementación

### ForgotPassword
- [ ] Campo de email
- [ ] Validación de formato
- [ ] Sanitización de email
- [ ] Llamada a API
- [ ] Manejo de errores (404, 429, network)
- [ ] Guardar email en AsyncStorage
- [ ] Navegación a CodigoRecuperacion
- [ ] Loading state
- [ ] Mensajes de éxito/error

### CodigoRecuperacion
- [ ] Campo de código (6 dígitos)
- [ ] Validación de formato
- [ ] Límite de 6 caracteres
- [ ] Teclado numérico
- [ ] Verificación de código (API o simulada)
- [ ] Guardar token en AsyncStorage
- [ ] Navegación a ResetPassword
- [ ] Opción de solicitar nuevo código

### ResetPassword
- [ ] Campo de nueva contraseña
- [ ] Campo de confirmar contraseña
- [ ] Validación de fortaleza en tiempo real
- [ ] Validación de coincidencia
- [ ] Mostrar/ocultar contraseña
- [ ] Verificar existencia de token
- [ ] Llamada a API
- [ ] Limpiar AsyncStorage después de éxito
- [ ] Navegación a Login
- [ ] Manejo de errores

---

## 📚 Referencias

- **Archivos Web:**
  - `src/features/auth/pages/forgotPassword.jsx`
  - `src/features/auth/pages/codigoRecuperacion.jsx`
  - `src/features/auth/pages/resetPassword.jsx`
  - `src/features/auth/services/authApiService.js`

- **Utilidades:**
  - `src/shared/utils/sanitizer.js` - Función `sanitizeEmail`
  - `src/shared/utils/passwordValidator.js` - Validación de contraseña
  - `src/shared/config/apiConfig.js` - Configuración de endpoints

---

**Última actualización:** Diciembre 2024
