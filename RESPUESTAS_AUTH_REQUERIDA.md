# ✅ Respuestas - Información de Autenticación y Roles

Este archivo contiene las respuestas a todas las preguntas sobre autenticación y roles basadas en el análisis del código del frontend web.

---

## 1. ✅ Estructura de Respuesta del Login

### Respuesta Completa del Endpoint `POST /api/usuarios/login`

**Estructura de la Respuesta**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Admin",
      "apellido": "Sistema",
      "correo": "admin@registrack.com",
      "rol": {
        "id": 2,
        "nombre": "administrador",
        "estado": true,
        "permisos": {
          "dashboard": { "leer": true },
          "usuarios": { "crear": true, "leer": true, "actualizar": true, "eliminar": true },
          "empleados": { "crear": true, "leer": true, "actualizar": true, "eliminar": true },
          // ... más módulos
        }
      }
    }
  }
}
```

**Nota**: El código del frontend maneja múltiples estructuras posibles:
- `response.data?.token` o `response.token`
- `response.data?.usuario` o `response.usuario` o `response.user`

### Cómo Vienen los Roles

**✅ RESPUESTA**: El rol viene como un **OBJETO** (no array) dentro del objeto usuario:

```javascript
usuario.rol = {
  id: 2,                    // ID del rol (1=Cliente, 2=Administrador, 3=Empleado)
  nombre: "administrador",  // Nombre del rol en minúsculas
  estado: true,             // Estado activo/inactivo
  permisos: {               // Objeto con permisos por módulo
    dashboard: { leer: true },
    usuarios: { crear: true, leer: true, actualizar: true, eliminar: true },
    // ... más módulos
  }
}
```

**NO es un array de strings**, es un objeto único con la estructura mostrada arriba.

---

## 2. ✅ Detección de Roles Administrativos

### Función Principal: `tieneRolAdministrativo(user)`

**Ubicación**: `src/shared/utils/roleUtils.js`

**Código Completo**:
```javascript
export const tieneRolAdministrativo = (user) => {
  if (!user) {
    return false;
  }

  // 1. Verificar por ID de rol primero (más confiable)
  const roleId = user.rol?.id || user.id_rol || user.idRol || user.rol?.id_rol;
  
  // Según el backend: 1=Cliente, 2=Administrador, 3=Empleado
  // Solo IDs 2 y 3 son administrativos
  if (roleId !== undefined && roleId !== null) {
    const idNum = Number(roleId);
    // Verificar si es administrador (ID 2) o empleado (ID 3)
    if (idNum === 2 || idNum === 3) {
      return true;
    }
    // ID 1 es cliente, no administrativo
    if (idNum === 1) {
      return false;
    }
  }

  // 2. Si el rol es un objeto con permisos, verificar
  if (typeof user.rol === 'object' && user.rol !== null && user.rol.permisos) {
    const esAdmin = esRolAdministrativo(user.rol);
    if (esAdmin) {
      return true;
    }
  }

  // 3. Verificar por nombre del rol
  const roleName = typeof user.rol === 'string' 
    ? user.rol 
    : (user.rol?.nombre || user.rol?.name || user.role || '');

  const roleNameLower = roleName.toLowerCase().trim();
  
  // Roles administrativos conocidos
  const esAdminPorNombre = roleNameLower === 'administrador' || 
         roleNameLower === 'admin' || 
         roleNameLower === 'empleado' || 
         roleNameLower === 'employee' || 
         roleNameLower === 'supervisor' ||
         roleNameLower === 'gerente' ||
         roleNameLower === 'manager';
  
  return esAdminPorNombre;
};
```

### Función Auxiliar: `esRolAdministrativo(rol)`

Esta función verifica si un rol tiene permisos administrativos:

```javascript
export const esRolAdministrativo = (rol) => {
  if (!rol || !rol.permisos) {
    return false;
  }

  const permisos = rol.permisos;

  // Si tiene permiso de dashboard, es administrativo
  if (permisos.dashboard && permisos.dashboard.leer === true) {
    return true;
  }

  // Si tiene cualquier permiso de gestión administrativa, es administrativo
  const modulosAdministrativos = [
    'usuarios', 'empleados', 'roles', 'permisos', 'privilegios',
    'solicitudes', 'citas', 'seguimiento', 'clientes', 'pagos',
    'servicios', 'empresas', 'archivos', 'tipo_archivos',
    'solicitud_cita', 'detalles_orden', 'detalles_procesos', 'servicios_procesos'
  ];

  // Verificar si tiene al menos un permiso activo en algún módulo administrativo
  for (const modulo of modulosAdministrativos) {
    if (permisos[modulo]) {
      const moduloPermisos = permisos[modulo];
      if (
        moduloPermisos.crear === true ||
        moduloPermisos.leer === true ||
        moduloPermisos.actualizar === true ||
        moduloPermisos.eliminar === true
      ) {
        return true;
      }
    }
  }

  return false;
};
```

### Nombres Exactos de Roles Administrativos

**✅ RESPUESTA**: Los nombres se comparan en **minúsculas** (case-insensitive):

- `"administrador"` o `"admin"`
- `"empleado"` o `"employee"`
- `"supervisor"`
- `"gerente"`
- `"manager"`

**IMPORTANTE**: El código normaliza todos los nombres a minúsculas antes de comparar.

### IDs de Roles Administrativos

**✅ RESPUESTA**: Según el backend:
- **ID 1**: Cliente (NO administrativo)
- **ID 2**: Administrador (SÍ administrativo)
- **ID 3**: Empleado (SÍ administrativo)

---

## 3. ✅ Estructura de Roles en el Usuario

### Campo del Rol

**✅ RESPUESTA**: El campo se llama **`rol`** (singular, no plural), y es un **OBJETO** (no array):

```javascript
usuario.rol = {
  id: 2,
  nombre: "administrador",
  estado: true,
  permisos: { ... }
}
```

### Campos Adicionales

El código también busca en estos campos alternativos (para compatibilidad):
- `user.rol?.id` (preferido)
- `user.id_rol`
- `user.idRol`
- `user.rol?.id_rol`

### Estructura Completa del Objeto Usuario

Después del login, el objeto usuario tiene esta estructura:

```javascript
{
  id_usuario: 1,
  nombre: "Admin",
  apellido: "Sistema",
  correo: "admin@registrack.com",
  rol: {
    id: 2,                    // ID del rol
    nombre: "administrador",  // Nombre del rol
    estado: true,             // Estado activo/inactivo
    permisos: {               // Permisos por módulo
      dashboard: {
        leer: true
      },
      usuarios: {
        crear: true,
        leer: true,
        actualizar: true,
        eliminar: true
      },
      // ... más módulos
    }
  }
}
```

---

## 4. ✅ Nombres Exactos de Roles Administrativos

### Lista Completa

**✅ RESPUESTA**: Los nombres se normalizan a minúsculas, pero los valores originales son:

1. **"administrador"** o **"admin"** (ID: 2)
2. **"empleado"** o **"employee"** (ID: 3)
3. **"supervisor"** (roles personalizados)
4. **"gerente"** (roles personalizados)
5. **"manager"** (roles personalizados)

**NOTA**: El código también verifica por **permisos administrativos**, por lo que cualquier rol con permisos de dashboard o módulos administrativos se considera administrativo, incluso si no está en la lista de nombres.

### Verificación por ID (Más Confiable)

```javascript
// IDs administrativos
const roleId = user.rol?.id;
if (roleId === 2 || roleId === 3) {
  // Es administrativo
}
```

---

## 5. ✅ Almacenamiento en AsyncStorage/LocalStorage

### Claves Utilizadas

**✅ RESPUESTA**: El frontend web guarda el usuario en **múltiples claves** para compatibilidad:

```javascript
// Después del login exitoso:
localStorage.setItem('authToken', token);
localStorage.setItem('token', token); // Para compatibilidad
localStorage.setItem('currentUser', JSON.stringify(user)); // PRINCIPAL
localStorage.setItem('user', JSON.stringify(user)); // Para compatibilidad
localStorage.setItem('userData', JSON.stringify(user)); // Para compatibilidad
localStorage.setItem('isAuthenticated', 'true');
```

### Clave Principal

**✅ RESPUESTA**: La clave principal es **`currentUser`**, pero también se guarda en `user` y `userData` para compatibilidad.

### Estructura Guardada

Se guarda el **objeto usuario completo** (sin transformaciones):

```javascript
const user = {
  id_usuario: 1,
  nombre: "Admin",
  apellido: "Sistema",
  correo: "admin@registrack.com",
  rol: {
    id: 2,
    nombre: "administrador",
    estado: true,
    permisos: { ... }
  }
};

localStorage.setItem('currentUser', JSON.stringify(user));
```

---

## 6. ✅ Verificación de Permisos del Dashboard

### Verificación de Permisos

**✅ RESPUESTA**: El dashboard tiene una verificación de permisos específica:

**Ubicación**: `src/routes/routes.jsx`

```javascript
<Route 
  path="dashboard" 
  element={
    <PermissionGuard 
      modulo="gestion_dashboard" 
      accion="leer" 
      fallback={<AccessDenied message="No tienes permisos para acceder al dashboard." />}
    >
      <Dashboard />
    </PermissionGuard>
  } 
/>
```

### Cómo Funciona

1. **Primero** se verifica el permiso específico: `gestion_dashboard.leer`
2. **Si no tiene ese permiso**, se verifica si tiene un rol administrativo
3. **Si es administrativo**, tiene acceso automático

### Función de Verificación

El `PermissionGuard` verifica:
- Si el usuario tiene el permiso específico en `usuario.rol.permisos.gestion_dashboard.leer`
- O si es administrador (tiene acceso total)

---

## 📋 Resumen para Implementación Móvil

### 1. Estructura del Usuario Después del Login

```javascript
const user = {
  id_usuario: 1,
  nombre: "Admin",
  apellido: "Sistema",
  correo: "admin@registrack.com",
  rol: {                    // OBJETO (no array)
    id: 2,                  // 1=Cliente, 2=Admin, 3=Empleado
    nombre: "administrador", // En minúsculas
    estado: true,
    permisos: {
      dashboard: { leer: true },
      usuarios: { crear: true, leer: true, actualizar: true, eliminar: true },
      // ... más módulos
    }
  }
};
```

### 2. Función para Verificar si es Administrativo

```javascript
const tieneRolAdministrativo = (user) => {
  if (!user || !user.rol) return false;

  // 1. Verificar por ID (más confiable)
  const roleId = user.rol?.id || user.id_rol;
  if (roleId === 2 || roleId === 3) return true; // 2=Admin, 3=Empleado
  if (roleId === 1) return false; // 1=Cliente

  // 2. Verificar por permisos
  if (user.rol.permisos?.dashboard?.leer === true) return true;
  
  // Verificar módulos administrativos
  const modulosAdmin = ['usuarios', 'empleados', 'roles', 'solicitudes', 'citas', 'clientes', 'pagos'];
  for (const modulo of modulosAdmin) {
    if (user.rol.permisos?.[modulo]?.leer === true) return true;
  }

  // 3. Verificar por nombre (case-insensitive)
  const roleName = (user.rol?.nombre || user.rol || '').toLowerCase();
  const rolesAdmin = ['administrador', 'admin', 'empleado', 'employee', 'supervisor', 'gerente', 'manager'];
  return rolesAdmin.includes(roleName);
};
```

### 3. Almacenamiento en AsyncStorage (Móvil)

```javascript
// Guardar después del login
await AsyncStorage.setItem('authToken', token);
await AsyncStorage.setItem('token', token); // Compatibilidad
await AsyncStorage.setItem('currentUser', JSON.stringify(user)); // PRINCIPAL
await AsyncStorage.setItem('user', JSON.stringify(user)); // Compatibilidad
await AsyncStorage.setItem('userData', JSON.stringify(user)); // Compatibilidad
await AsyncStorage.setItem('isAuthenticated', 'true');

// Leer usuario
const userStr = await AsyncStorage.getItem('currentUser');
const user = JSON.parse(userStr);
```

### 4. Verificación de Permisos del Dashboard

```javascript
const tienePermisoDashboard = (user) => {
  if (!user || !user.rol) return false;
  
  // Verificar permiso específico
  if (user.rol.permisos?.gestion_dashboard?.leer === true) return true;
  
  // Si es administrativo, tiene acceso automático
  return tieneRolAdministrativo(user);
};
```

---

## 🔍 Ejemplo de Código Completo para Móvil

```javascript
// utils/authUtils.js
export const tieneRolAdministrativo = (user) => {
  if (!user || !user.rol) {
    console.log('⚠️ Usuario no proporcionado o sin rol');
    return false;
  }

  // 1. Verificar por ID de rol (más confiable)
  const roleId = user.rol?.id || user.id_rol || user.idRol;
  console.log('🔍 RoleId:', roleId);
  
  if (roleId !== undefined && roleId !== null) {
    const idNum = Number(roleId);
    // 2=Administrador, 3=Empleado son administrativos
    if (idNum === 2 || idNum === 3) {
      console.log('✅ Rol administrativo detectado por ID:', idNum);
      return true;
    }
    // 1=Cliente no es administrativo
    if (idNum === 1) {
      console.log('❌ ID 1 = Cliente (no administrativo)');
      return false;
    }
  }

  // 2. Verificar por permisos
  if (user.rol.permisos) {
    // Si tiene permiso de dashboard, es administrativo
    if (user.rol.permisos.dashboard?.leer === true) {
      console.log('✅ Rol administrativo detectado por permiso dashboard');
      return true;
    }
    
    // Verificar módulos administrativos
    const modulosAdmin = [
      'usuarios', 'empleados', 'roles', 'permisos', 'privilegios',
      'solicitudes', 'citas', 'seguimiento', 'clientes', 'pagos',
      'servicios', 'empresas', 'archivos'
    ];
    
    for (const modulo of modulosAdmin) {
      const moduloPermisos = user.rol.permisos[modulo];
      if (moduloPermisos && (
        moduloPermisos.crear === true ||
        moduloPermisos.leer === true ||
        moduloPermisos.actualizar === true ||
        moduloPermisos.eliminar === true
      )) {
        console.log('✅ Rol administrativo detectado por permiso:', modulo);
        return true;
      }
    }
  }

  // 3. Verificar por nombre del rol
  const roleName = typeof user.rol === 'string' 
    ? user.rol 
    : (user.rol?.nombre || user.rol?.name || user.role || '');
  
  const roleNameLower = roleName.toLowerCase().trim();
  console.log('🔍 Nombre del rol:', roleNameLower);
  
  const rolesAdmin = [
    'administrador', 'admin', 
    'empleado', 'employee',
    'supervisor', 'gerente', 'manager'
  ];
  
  if (rolesAdmin.includes(roleNameLower)) {
    console.log('✅ Rol administrativo detectado por nombre:', roleNameLower);
    return true;
  }

  console.log('❌ No es un rol administrativo');
  return false;
};

// Uso en el componente de login
import { tieneRolAdministrativo } from '../utils/authUtils';

const handleLogin = async (email, password) => {
  const result = await authApiService.login({ email, password });
  
  if (result.success) {
    const user = result.user;
    
    // Verificar si es administrativo
    const esAdmin = tieneRolAdministrativo(user);
    
    if (esAdmin) {
      // Redirigir a dashboard
      navigation.navigate('Dashboard');
    } else {
      // Redirigir a landing/home
      navigation.navigate('Home');
    }
  }
};
```

---

## ✅ Checklist de Implementación

- [x] Estructura de respuesta del login identificada
- [x] Función de verificación de roles administrativos documentada
- [x] Estructura del objeto usuario documentada
- [x] Nombres exactos de roles identificados
- [x] Claves de localStorage/AsyncStorage documentadas
- [x] Verificación de permisos del dashboard documentada
- [x] Código de ejemplo para móvil proporcionado

---

**Última actualización**: Enero 2025
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

