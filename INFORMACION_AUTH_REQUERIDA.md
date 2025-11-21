# 📋 Información Requerida del Frontend Web - Autenticación y Roles

Este archivo contiene las preguntas específicas que necesitamos responder para que la autenticación y detección de roles funcione correctamente en la app móvil.

## 🔍 Información Crítica Necesaria

### 1. Estructura de Respuesta del Login

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `POST /api/usuarios/login`?

**Necesitamos saber**:
- ¿Cómo vienen los roles en la respuesta?
- ¿Vienen como array de strings, objetos, o ambos?
- ¿Qué campos tiene cada rol si es un objeto?

**Ejemplo de lo que necesitamos**:
```json
{
  "token": "...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "admin@example.com",
    "roles": [
      // ¿Es así?
      "ADMINISTRADOR"
      // ¿O así?
      { "id": 1, "nombre": "ADMINISTRADOR", "codigo": "ADMIN" }
      // ¿O de otra forma?
    ]
  }
}
```

### 2. Detección de Roles Administrativos

**Pregunta**: ¿Cómo se determina en el frontend web si un usuario es administrativo?

**Necesitamos saber**:
- ¿Qué función o método se usa?
- ¿Qué nombres exactos de roles se consideran administrativos?
- ¿Hay algún campo adicional (como `id_rol`, `tipo_usuario`, etc.)?

**Ejemplo de código del frontend web que necesitamos**:
```javascript
// ¿Cómo se hace en el frontend web?
function esAdministrador(usuario) {
  // ¿Qué lógica se usa aquí?
  return usuario.roles?.includes('ADMINISTRADOR');
  // ¿O se usa otro método?
}
```

### 3. Estructura de Roles en el Usuario

**Pregunta**: ¿Cómo se almacenan los roles en el objeto usuario después del login?

**Necesitamos saber**:
- ¿El campo se llama `roles`, `rol`, `userRoles`, o algo diferente?
- ¿Es un array o un objeto único?
- ¿Hay un campo `id_rol` o `rol_id` que también se use?

**Ejemplo**:
```javascript
// ¿Es así?
usuario.roles = ["ADMINISTRADOR", "SUPERVISOR"]

// ¿O así?
usuario.rol = { nombre: "ADMINISTRADOR", id: 1 }

// ¿O así?
usuario.id_rol = 1
usuario.rol_nombre = "ADMINISTRADOR"
```

### 4. Nombres Exactos de Roles Administrativos

**Pregunta**: ¿Cuáles son los nombres EXACTOS (case-sensitive) de los roles administrativos?

**Necesitamos saber**:
- ¿Es "ADMINISTRADOR" o "Administrador" o "administrador"?
- ¿Qué otros roles son administrativos?
- ¿Hay algún código o ID que también identifique roles administrativos?

**Lista actual que usamos** (necesitamos confirmar):
- ADMINISTRADOR
- SUPERADMIN
- SUPERVISOR
- COORDINADOR

### 5. Almacenamiento en AsyncStorage/LocalStorage

**Pregunta**: ¿Cómo se guarda el usuario en el frontend web?

**Necesitamos saber**:
- ¿Qué claves se usan en localStorage?
- ¿Se guarda el objeto completo o solo ciertos campos?
- ¿Se transforma la estructura antes de guardarla?

**Ejemplo**:
```javascript
// ¿Se guarda así?
localStorage.setItem('user', JSON.stringify(usuario))
localStorage.setItem('currentUser', JSON.stringify(usuario))
// ¿O de otra forma?
```

### 6. Verificación de Permisos del Dashboard

**Pregunta**: ¿Hay alguna verificación adicional de permisos para acceder al dashboard?

**Necesitamos saber**:
- ¿Se verifica un permiso específico como `gestion_dashboard`?
- ¿O solo se verifica el rol?
- ¿Hay alguna función específica que se use?

**Ejemplo**:
```javascript
// ¿Se hace así?
if (usuario.permisos?.includes('gestion_dashboard')) {
  // mostrar dashboard
}

// ¿O solo con roles?
if (esAdministrador(usuario)) {
  // mostrar dashboard
}
```

## 📝 Instrucciones para Obtener Esta Información

### Opción 1: Desde el Código del Frontend Web

1. Buscar el archivo donde se maneja el login (ej: `authService.js`, `login.jsx`, etc.)
2. Buscar la función que verifica si un usuario es administrativo
3. Buscar cómo se guarda el usuario después del login
4. Copiar y pegar aquí el código relevante

### Opción 2: Desde la Consola del Navegador

1. Abrir el frontend web en el navegador
2. Iniciar sesión con un usuario administrativo
3. Abrir la consola del navegador (F12)
4. Ejecutar:
```javascript
// Ver qué hay en localStorage
console.log('Token:', localStorage.getItem('token'))
console.log('User:', localStorage.getItem('user'))
console.log('CurrentUser:', localStorage.getItem('currentUser'))

// Ver el objeto usuario completo
const user = JSON.parse(localStorage.getItem('user') || '{}')
console.log('Usuario completo:', user)
console.log('Roles:', user.roles)
console.log('Tipo de roles:', typeof user.roles)
console.log('Es array?', Array.isArray(user.roles))
```

### Opción 3: Desde la Red (Network Tab)

1. Abrir DevTools → Network
2. Iniciar sesión
3. Buscar la petición a `/api/usuarios/login`
4. Ver la respuesta completa
5. Copiar y pegar aquí la respuesta JSON

## 🎯 Información que Necesitamos Urgentemente

**Por favor, proporciona**:

1. ✅ **Respuesta completa del login** (JSON completo de la respuesta)
2. ✅ **Código de la función que verifica roles administrativos** (del frontend web)
3. ✅ **Estructura exacta del objeto usuario** después del login
4. ✅ **Nombres exactos de roles** (case-sensitive)
5. ✅ **Cómo se guarda en localStorage** (qué claves se usan)

## 🔧 Debug Temporal

Mientras tanto, hemos agregado logs de depuración en el código móvil para ver qué está recibiendo realmente. Revisa la consola cuando inicies sesión para ver:

- El objeto usuario completo que se recibe
- Los roles que tiene
- Por qué no se detecta como administrativo

---

**Una vez tengas esta información, actualiza este archivo o compártela para que podamos ajustar el código móvil correctamente.**

