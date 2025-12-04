# 📋 Guía Completa: Crear Solicitud como Administrador

Este documento contiene información detallada sobre cómo crear solicitudes como administrador o empleado en el sistema Registrack.

---

## 🎯 Diferencias Clave: Admin/Empleado vs Cliente

### Crear Solicitud como Administrador/Empleado:
- ✅ **Requiere seleccionar un cliente** (`id_cliente` obligatorio)
- ✅ **NO muestra pasarela de pago** (la solicitud se activa automáticamente)
- ✅ **Estado inicial**: Primer proceso activo del servicio (ej: "Solicitud Inicial", "Verificación de Documentos")
- ✅ **Notificación automática**: El cliente recibe email al crearse la solicitud
- ✅ **Activación inmediata**: La solicitud queda activa sin esperar pago

### Crear Solicitud como Cliente:
- ❌ **NO requiere `id_cliente`** (se toma automáticamente del token JWT)
- ✅ **Muestra pasarela de pago** después de crear
- ✅ **Estado inicial**: "Pendiente de Pago"
- ✅ **Requiere procesar pago** para activar la solicitud

---

## 🔄 Flujo Completo Paso a Paso

### Paso 1: Seleccionar Cliente (OBLIGATORIO)

**Componente**: `CrearSolicitudAdmin.jsx` (líneas 634-708)

**Endpoint para cargar clientes**:
```
GET /api/gestion-clientes
Headers: Authorization: Bearer {token}
```

**Estructura de respuesta**:
```json
[
  {
    "id_cliente": 5,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@email.com",
    "documento": "1234567890",
    "telefono": "3001234567",
    "direccion": "Calle 123",
    "ciudad": "Bogotá",
    "tipo_documento": "CC",
    "tipo_persona": "Natural"
  }
]
```

**Validación**:
- El campo `id_cliente` es **OBLIGATORIO** antes de continuar
- Si no se selecciona un cliente, se muestra error: `"Debes seleccionar un cliente para crear la solicitud"`
- El formulario NO se muestra hasta que se seleccione un cliente

**Pre-llenado automático**:
Cuando se selecciona un cliente, el sistema pre-llena automáticamente:
- `nombres` → `cliente.nombre`
- `apellidos` → `cliente.apellido`
- `email` → `cliente.email`
- `telefono` → `cliente.telefono`
- `direccion` → `cliente.direccion`
- `ciudad` → `cliente.ciudad`
- `tipoDocumento` → `cliente.tipo_documento`
- `numeroDocumento` → `cliente.documento`
- `tipoPersona` → `cliente.tipo_persona`

### Paso 2: Completar Formulario según Tipo de Servicio

**Componente**: `CrearSolicitudAdmin.jsx` (líneas 710-747)

El formulario se muestra **solo después** de seleccionar un cliente. El formulario específico se determina por el tipo de servicio:

```javascript
const FORMULARIOS_POR_SERVICIO = {
  'Búsqueda de Antecedentes': FormularioBusqueda,
  'Certificación de Marca': FormularioCertificacion,
  'Renovación de Marca': FormularioRenovacion,
  'Presentación de Oposición': FormularioOposicion,
  'Cesión de Marca': FormularioCesion,
  'Ampliación de Alcance': FormularioAmpliacion,
  'Respuesta a Oposición': FormularioRespuesta,
};
```

---

## ✅ Validaciones por Tipo de Servicio

### 1. Búsqueda de Antecedentes

**Código**: `CrearSolicitudAdmin.jsx` (líneas 254-296)

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO (del selector)
  tipoDocumento: string,           // "CC", "CE", "NIT", etc.
  numeroDocumento: string,          // Número de documento
  nombres: string,                  // Nombres del solicitante
  apellidos: string,                // Apellidos del solicitante
  email: string,                    // Correo electrónico
  telefono: string,                 // Teléfono de contacto
  direccion: string,                // Dirección completa
  pais: string,                    // País (default: "Colombia")
  nombreMarca: string,              // Nombre de la marca a buscar
  tipoProductoServicio: string,     // "Productos" o "Servicios"
  logotipoMarca: File               // Archivo: PDF, JPG o PNG (máx 5MB)
}
```

**Validaciones específicas**:
- `tipoDocumento`: No puede estar vacío
- `numeroDocumento`: No puede estar vacío (puede ser string o número)
- `nombres`: No puede estar vacío
- `apellidos`: No puede estar vacío
- `email`: No puede estar vacío
- `telefono`: No puede estar vacío
- `direccion`: No puede estar vacío
- `pais`: No puede estar vacío
- `nombreMarca`: No puede estar vacío
- `tipoProductoServicio`: No puede estar vacío
- `logotipoMarca`: Debe ser un archivo válido (File object)

**NOTA**: Este servicio **NO tiene** campo `tipoSolicitante` (solo campos básicos).

---

### 2. Certificación de Marca

**Código**: `CrearSolicitudAdmin.jsx` (líneas 298-356)

**Campos requeridos base**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO (del selector)
  tipoSolicitante: string,        // "Titular" | "Representante Autorizado"
  email: string,                   // Correo electrónico
  nombreMarca: string              // Nombre de la marca
}
```

**Campos condicionales según `tipoSolicitante`**:

#### Si `tipoSolicitante === "Titular"`:

**Si `tipoPersona === "Natural"`**:
```javascript
{
  tipoPersona: "Natural",         // ✅ OBLIGATORIO
  tipoDocumento: string,          // "CC", "CE", etc.
  numeroDocumento: string,        // Número de documento
  nombres: string,                // Nombres
  apellidos: string               // Apellidos
}
```

**Si `tipoPersona === "Jurídica"`**:
```javascript
{
  tipoPersona: "Jurídica",         // ✅ OBLIGATORIO
  nombreEmpresa: string,           // Nombre de la empresa
  nit: string                      // NIT de la empresa
}
```

#### Si `tipoSolicitante === "Representante Autorizado"`:
```javascript
{
  tipoDocumento: string,           // ✅ OBLIGATORIO
  numeroDocumento: string,         // ✅ OBLIGATORIO
  nombres: string,                 // ✅ OBLIGATORIO
  apellidos: string                // ✅ OBLIGATORIO
}
```

**Archivos requeridos**:
- `logotipoMarca`: ✅ Siempre requerido (PDF, JPG o PNG, máx 5MB)
- `poderAutorizacion`: ✅ Siempre requerido (PDF, máx 5MB)
- `certificadoCamara`: ⚠️ Solo si `tipoPersona === "Jurídica"` (PDF, máx 5MB)

**Validaciones de archivos**:
- Tamaño máximo: 5MB por archivo
- Formatos permitidos: PDF, JPG, PNG
- Se validan antes de convertir a base64

---

### 3. Renovación de Marca

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  tipoSolicitante: string,          // "Natural" | "Jurídica"
  email: string,                   // ✅ OBLIGATORIO
  nombreMarca: string,             // ✅ OBLIGATORIO
  numeroExpedienteMarca: string,    // Número de expediente de la marca
  certificadoRenovacion: File,     // ✅ OBLIGATORIO (PDF, máx 5MB)
  logotipoMarca: File,             // ✅ OBLIGATORIO (PDF, JPG, PNG, máx 5MB)
  poderAutorizacion: File           // ✅ OBLIGATORIO (PDF, máx 5MB)
}
```

**Campos condicionales si `tipoSolicitante === "Jurídica"`**:
```javascript
{
  tipoEntidad: string,
  razonSocial: string,
  nit: number,
  representanteLegal: string
}
```

---

### 4. Cesión de Marca

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  tipoSolicitante: string,         // "Natural" | "Jurídica"
  nombres: string,
  apellidos: string,
  tipoDocumento: string,
  numeroDocumento: string,
  direccion: string,
  telefono: string,
  email: string,
  pais: string,
  nombreMarca: string,
  numeroExpedienteMarca: string,
  documentoCesion: File,           // ✅ OBLIGATORIO (PDF, máx 5MB)
  poderAutorizacion: File,         // ✅ OBLIGATORIO (PDF, máx 5MB)
  // Datos del cesionario
  nombreRazonSocialCesionario: string,  // ✅ OBLIGATORIO
  nitCesionario: string,                // ✅ OBLIGATORIO
  representanteLegalCesionario: string, // ✅ OBLIGATORIO
  tipoDocumentoCesionario: string,     // ✅ OBLIGATORIO
  numeroDocumentoCesionario: string,    // ✅ OBLIGATORIO
  correoCesionario: string,             // ✅ OBLIGATORIO
  telefonoCesionario: string,           // ✅ OBLIGATORIO
  direccionCesionario: string           // ✅ OBLIGATORIO
}
```

---

### 5. Presentación de Oposición

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  tipoSolicitante: string,          // "Natural" | "Jurídica"
  nombres: string,
  apellidos: string,
  tipoDocumento: string,
  numeroDocumento: string,
  direccion: string,
  telefono: string,
  email: string,
  pais: string,
  nit: number,                     // ✅ SIEMPRE requerido (incluso para Natural)
  nombreMarca: string,
  marcaAOponerse: string,          // Nombre de la marca a la que se opone
  argumentosRespuesta: string,     // Argumentos de la oposición
  documentosOposicion: File,       // ✅ OBLIGATORIO (PDF, máx 5MB)
  poderAutorizacion: File          // ✅ OBLIGATORIO (PDF, máx 5MB)
}
```

**NOTA**: `nit` es **SIEMPRE requerido** para este servicio, incluso si el solicitante es persona natural.

---

### 6. Respuesta a Oposición

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  nombres: string,
  apellidos: string,
  tipoDocumento: string,
  numeroDocumento: string,
  direccion: string,
  telefono: string,
  email: string,
  pais: string,
  razonSocial: string,             // ✅ OBLIGATORIO
  nit: number,                     // ✅ OBLIGATORIO
  representanteLegal: string,       // ✅ OBLIGATORIO
  nombreMarca: string,
  numeroExpedienteMarca: string,
  marcaOpositora: string,          // Nombre de la marca opositora
  poderAutorizacion: File          // ✅ OBLIGATORIO (PDF, máx 5MB)
}
```

---

### 7. Ampliación de Alcance

**Campos requeridos**:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  documentoNitTitular: string,     // Documento o NIT del titular
  direccion: string,
  ciudad: string,
  pais: string,
  email: string,
  telefono: string,
  numeroRegistroExistente: string,  // Número de registro de la marca existente
  nombreMarca: string,
  claseNizaActual: string,         // Clases Niza actuales
  nuevasClasesNiza: string,        // Nuevas clases Niza a agregar
  descripcionNuevosProductosServicios: string,  // Descripción de nuevos productos/servicios
  soportes: File                   // ✅ OBLIGATORIO (PDF, máx 5MB)
}
```

---

## 📤 Transformación de Datos Frontend → API

**Función**: `solicitudesApiService.transformarDatosParaAPI()` (líneas 769-1397)

### Proceso de Transformación:

1. **Mapeo de nombre de servicio**:
   ```javascript
   const mapeoServicios = {
     'Búsqueda de Antecedentes': 'Búsqueda de antecedentes',
     'Certificación de Marca': 'Certificación de marca',
     'Renovación de Marca': 'Renovación de marca',
     'Presentación de Oposición': 'Presentación de oposición',
     'Cesión de Marca': 'Cesión de marca',
     'Ampliación de Alcance': 'Ampliación de alcance',
     'Respuesta a Oposición': 'Respuesta a oposición'
   };
   ```

2. **Conversión de archivos a Base64**:
   - Todos los archivos (File objects) se convierten a base64
   - Formato: `data:[mime-type];base64,{contenido}`
   - Ejemplo: `data:application/pdf;base64,JVBERi0xLjQK...`
   - Validación: Máximo 5MB por archivo
   - Formatos permitidos: PDF, JPG, PNG

3. **Concatenación de nombres**:
   ```javascript
   nombres_apellidos: `${nombres} ${apellidos}`.trim()
   ```

4. **Conversión a snake_case**:
   - Frontend usa camelCase: `tipoDocumento`, `numeroDocumento`
   - API espera snake_case: `tipo_documento`, `numero_documento`

5. **Agregar `id_cliente`**:
   ```javascript
   // ✅ CRÍTICO: Solo para admin/empleado
   if (userRole === 'administrador' || userRole === 'empleado') {
     datosAPI.id_cliente = parseInt(idClienteSeleccionado);
   }
   // Clientes: NO se incluye (se toma del token)
   ```

### Ejemplo Completo: Búsqueda de Antecedentes

**Frontend**:
```javascript
{
  id_cliente: 5,
  tipoDocumento: "CC",
  numeroDocumento: "1234567890",
  nombres: "Juan",
  apellidos: "Pérez",
  email: "juan@email.com",
  telefono: "3001234567",
  direccion: "Calle 123",
  pais: "Colombia",
  nombreMarca: "Mi Marca",
  tipoProductoServicio: "Productos",
  logotipoMarca: File // Archivo seleccionado
}
```

**API (después de transformación)**:
```javascript
{
  id_cliente: 5,
  nombres_apellidos: "Juan Pérez",
  tipo_documento: "CC",
  numero_documento: "1234567890",
  correo: "juan@email.com",
  telefono: "3001234567",
  direccion: "Calle 123",
  pais: "Colombia",
  nombre_a_buscar: "Mi Marca",
  tipo_producto_servicio: "Productos",
  logotipo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## 🔌 Endpoint de Creación

**Endpoint**:
```
POST /api/gestion-solicitudes/crear/:servicioId
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
```

**Parámetros**:
- `servicioId`: ID numérico del servicio (NO el nombre)

**Proceso para obtener `servicioId`**:
1. Obtener lista de servicios: `GET /api/servicios`
2. Buscar servicio por nombre (normalizar para comparación):
   ```javascript
   const normalizarNombre = (nombre) => nombre.toLowerCase().trim();
   const servicioEncontrado = servicios.find(s => {
     const nombreServicio = s.nombre || s.nombre_servicio || '';
     return normalizarNombre(nombreServicio) === normalizarNombre(servicioAPI) ||
            normalizarNombre(nombreServicio) === normalizarNombre(tipoSolicitud);
   });
   ```
3. Extraer ID: `servicioId = parseInt(servicioEncontrado.id || servicioEncontrado.id_servicio)`

**Body (ejemplo para Búsqueda de Antecedentes)**:
```json
{
  "id_cliente": 5,
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "CC",
  "numero_documento": "1234567890",
  "correo": "juan@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "pais": "Colombia",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Productos",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "id": 123,
    "id_orden_servicio": 123,
    "id_cliente": 5,
    "id_servicio": 2,
    "estado": "Solicitud Inicial",
    "expediente": "EXP-123",
    "nombre_solicitante": "Juan Pérez",
    "marca_a_buscar": "Mi Marca",
    "correo_electronico": "juan@email.com",
    "telefono": "3001234567",
    "fecha_solicitud": "2024-01-15T10:30:00",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

**Estado inicial**:
- La solicitud se crea con el **primer proceso activo** del servicio
- Ejemplos: "Solicitud Inicial", "Verificación de Documentos", "Consulta en BD"
- **NO** se crea en estado "Pendiente de Pago" (eso es solo para clientes)

---

## 📧 Notificaciones Automáticas

Cuando un administrador/empleado crea una solicitud:

1. **Email al cliente**:
   - Se envía automáticamente al correo del cliente seleccionado
   - Contiene información de la solicitud creada
   - Incluye número de expediente y estado inicial

2. **Sin notificación de pago**:
   - NO se envía email de pago pendiente
   - La solicitud queda activa inmediatamente

---

## ⚠️ Validaciones de Archivos

**Código**: `CrearSolicitudAdmin.jsx` (líneas 181-202)

**Validaciones aplicadas**:
```javascript
// Tamaño máximo: 5MB
const maxSize = 5 * 1024 * 1024; // 5MB en bytes
if (file.size > maxSize) {
  reject(new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`));
  return;
}

// Formatos permitidos
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
if (!allowedTypes.includes(file.type)) {
  reject(new Error(`El archivo ${file.name} debe ser PDF, JPG o PNG`));
  return;
}
```

**Conversión a Base64**:
```javascript
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = () => resolve(reader.result); // Retorna: "data:image/png;base64,..."
```

---

## 🚨 Manejo de Errores

### Errores Comunes y Soluciones:

#### 1. Error: "Cliente requerido"
**Causa**: No se seleccionó un cliente antes de enviar
**Solución**: Seleccionar un cliente del dropdown antes de completar el formulario

#### 2. Error: "Campos requeridos faltantes: {campos}"
**Causa**: Faltan campos obligatorios según el tipo de servicio
**Solución**: Completar todos los campos requeridos según la validación

#### 3. Error: "El archivo {nombre} excede el tamaño máximo de 5MB"
**Causa**: Archivo demasiado grande
**Solución**: Comprimir el archivo o usar uno más pequeño

#### 4. Error: "El archivo {nombre} debe ser PDF, JPG o PNG"
**Causa**: Formato de archivo no permitido
**Solución**: Convertir el archivo a PDF, JPG o PNG

#### 5. Error: "No se pudo encontrar el servicio"
**Causa**: El servicio no existe en la base de datos
**Solución**: Verificar que el servicio esté activo en el sistema

#### 6. Error: "El campo id_cliente es obligatorio para administradores y empleados"
**Causa**: El `id_cliente` no se incluyó en el payload
**Solución**: Asegurar que el selector de cliente esté funcionando correctamente

#### 7. Error: "Data too long for column"
**Causa**: Columna de base de datos demasiado pequeña para almacenar el archivo
**Solución**: Backend debe cambiar la columna a `LONGTEXT`:
```sql
ALTER TABLE orden_servicios MODIFY COLUMN logotipo LONGTEXT;
ALTER TABLE orden_servicios MODIFY COLUMN poder_autorizacion LONGTEXT;
-- etc. para todos los campos de archivos
```

#### 8. Error: "La petición tardó demasiado tiempo"
**Causa**: Timeout (más de 75 segundos)
**Solución**: Verificar conexión o reducir tamaño de archivos

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | ✅ Éxito | Solicitud creada correctamente |
| 400 | ❌ Bad Request | Validar campos enviados |
| 401 | ❌ Unauthorized | Token inválido/expirado - Reautenticar |
| 403 | ❌ Forbidden | Sin permisos - Verificar rol |
| 404 | ❌ Not Found | Servicio no existe |
| 409 | ❌ Conflict | Conflicto de datos |
| 500 | ❌ Server Error | Error del servidor - Contactar soporte |

---

## 🔍 Logging y Debugging

**Código**: `CrearSolicitudAdmin.jsx` y `solicitudesApiService.js`

El sistema incluye logging detallado para debugging:

```javascript
console.log("🔧 [CrearSolicitudAdmin] Validando form:", form);
console.log("🔧 [CrearSolicitudAdmin] Servicio API (nombre):", servicioAPI);
console.log("🔧 [CrearSolicitudAdmin] Datos transformados para API:", datosAPI);
console.log("✅ [CrearSolicitudAdmin] Solicitud creada exitosamente:", resultado);
```

**Información logueada**:
- Estado del formulario antes de validar
- Errores de validación
- Datos transformados para API (sin mostrar archivos completos)
- ID del servicio encontrado
- Resultado de la creación
- Errores con detalles completos

---

## 🎨 Interfaz de Usuario

### Estructura del Modal:

1. **Header**:
   - Título: "Crear Solicitud (Administrador)"
   - Icono: FilePlus (lucide-react)
   - Color: Azul (gradient)

2. **Paso 1: Selector de Cliente** (líneas 634-708):
   - Dropdown con lista de clientes
   - Muestra: Nombre completo y email
   - Validación visual: Borde amarillo si no está seleccionado, rojo si hay error
   - Información del cliente seleccionado (cuando se selecciona)

3. **Paso 2: Formulario** (líneas 710-747):
   - Solo se muestra después de seleccionar cliente
   - Formulario específico según tipo de servicio
   - Validación en tiempo real
   - Mensajes de error debajo de cada campo

4. **Footer**:
   - Botón "Cancelar" (secundario)
   - Botón "Crear Solicitud" (primario)
   - Spinner de carga durante el envío
   - Deshabilitado durante el envío (previene doble envío)

---

## 🔐 Seguridad

### Validaciones de Seguridad:

1. **Token de autenticación**:
   - Requerido en todas las peticiones
   - Validado en el backend
   - Si expira, se muestra error 401

2. **Validación de rol**:
   - Solo administradores y empleados pueden usar este componente
   - El backend valida el rol del usuario

3. **Validación de `id_cliente`**:
   - El backend valida que el `id_cliente` exista
   - El backend valida que el usuario tenga permisos para crear solicitudes para ese cliente

4. **Validación de archivos**:
   - Tamaño máximo: 5MB
   - Formatos permitidos: PDF, JPG, PNG
   - Validación antes de enviar al backend

---

## 📝 Notas Importantes

1. **Prevención de doble envío**:
   - El botón se deshabilita durante el envío (`isSubmitting`)
   - Se previene múltiples llamadas al endpoint

2. **Limpieza al cerrar**:
   - Al cerrar el modal, se limpian todos los estados
   - Se resetea el formulario
   - Se limpia la selección de cliente

3. **Confirmación al cerrar con datos**:
   - Si hay datos ingresados, se muestra confirmación antes de cerrar
   - Evita pérdida accidental de datos

4. **Timeout de petición**:
   - 75 segundos (1 minuto y 15 segundos)
   - Si excede, se muestra error de timeout

5. **Tamaño del payload**:
   - Límite del backend: 10MB
   - Si el payload es > 9MB, se muestra advertencia
   - Archivos grandes pueden causar problemas

---

## 🔄 Flujo de Estados

```
1. Modal abierto
   ↓
2. Cargar clientes (GET /api/gestion-clientes)
   ↓
3. Usuario selecciona cliente
   ↓
4. Pre-llenar datos del cliente
   ↓
5. Mostrar formulario específico
   ↓
6. Usuario completa formulario
   ↓
7. Validar campos (frontend)
   ↓
8. Convertir archivos a Base64
   ↓
9. Transformar datos Frontend → API
   ↓
10. Obtener ID del servicio (GET /api/servicios)
    ↓
11. Crear solicitud (POST /api/gestion-solicitudes/crear/:servicioId)
    ↓
12. Mostrar mensaje de éxito
    ↓
13. Cerrar modal
    ↓
14. Refrescar lista de solicitudes
```

---

## 📚 Referencias

- **Componente principal**: `Registrack_Oficial/src/features/dashboard/pages/gestionVentasServicios/components/CrearSolicitudAdmin.jsx`
- **Servicio API**: `Registrack_Oficial/src/features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService.js`
- **Documentación general**: `Registrack_Oficial/RESPUESTAS_SOLICITUDES_COMPLETAS.md`

---

**Última actualización**: Enero 2025  
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

