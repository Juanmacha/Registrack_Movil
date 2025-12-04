# ✅ RESPUESTAS COMPLETAS - Módulo de Cliente para Móvil

Este archivo contiene todas las respuestas para implementar el módulo de cliente en la aplicación móvil, basado en el análisis del código del frontend web.

---

## 📋 Índice

1. [Módulo "Mis Procesos"](#1-módulo-mis-procesos)
   - [1.1 Listar Mis Solicitudes](#11-listar-mis-solicitudes)
   - [1.2 Procesos Activos vs Historial](#12-procesos-activos-vs-historial)
   - [1.3 Historial de Seguimiento](#13-historial-de-seguimiento)
   - [1.4 Detalle de Proceso](#14-detalle-de-proceso)
   - [1.5 Pagos Pendientes](#15-pagos-pendientes)
2. [Crear Solicitudes como Cliente](#2-crear-solicitudes-como-cliente)
   - [2.1 Endpoint y Autenticación](#21-endpoint-y-autenticación)
   - [2.2 Formularios por Tipo de Servicio](#22-formularios-por-tipo-de-servicio)
   - [2.3 Validaciones](#23-validaciones)
   - [2.4 Flujo de Pago](#24-flujo-de-pago)
3. [Ver Mi Perfil](#3-ver-mi-perfil)
   - [3.1 Obtener Información del Usuario](#31-obtener-información-del-usuario)
   - [3.2 Editar Perfil](#32-editar-perfil)
   - [3.3 Campos Editables](#33-campos-editables)

---

## 1. Módulo "Mis Procesos"

### 1.1 Listar Mis Solicitudes ✅

**Endpoint**: `GET /api/gestion-solicitudes/mias`

**Autenticación**: Requerida (Bearer Token)

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Respuesta**: Array directo (NO envuelto en objeto)

**Estructura de Respuesta**:
```json
[
  {
    "id": 1,
    "id_orden_servicio": 1,
    "id_cliente": 5,
    "id_servicio": 2,
    "id_empleado_asignado": 3,
    "estado": "En proceso",
    "expediente": "EXP-001",
    "nombre_solicitante": "Juan Pérez",
    "marca_a_buscar": "Mi Marca",
    "correo_electronico": "cliente@email.com",
    "telefono": "3001234567",
    "servicio": {
      "id": 2,
      "nombre": "Certificación de Marca"
    },
    "empleado_asignado": {
      "id_empleado": 3,
      "nombres": "María",
      "apellidos": "García"
    },
    "cliente": {
      "id_cliente": 5,
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "fecha_solicitud": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-20T14:20:00",
    "motivo_anulacion": null  // Solo si está anulada
  }
]
```

**Campos Importantes**:
- `id_orden_servicio`: ID principal de la solicitud (usar para seguimiento)
- `estado`: Estado actual del proceso
- `expediente`: Número de expediente (formato: "EXP-XXX")
- `motivo_anulacion`: Solo presente si la solicitud está anulada

**Código de Ejemplo**:
```javascript
// services/solicitudesApiService.js
async getMisSolicitudes(token) {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/gestion-solicitudes/mias`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  // La respuesta es un array directo
  return Array.isArray(data) ? data : [];
}
```

---

### 1.2 Procesos Activos vs Historial ✅

**Criterio de Separación**: Estados terminales

**Estados Terminales** (van al Historial):
```javascript
const estadosTerminales = [
  'Finalizada', 
  'Finalizado', 
  'Anulada', 
  'Anulado', 
  'Rechazada', 
  'Rechazado'
];
```

**Lógica de Filtrado**:
```javascript
const esEnProceso = !estadosTerminales.includes(solicitud.estado);

// Procesos activos
const procesosActivos = solicitudes.filter(s => esEnProceso);

// Historial
const procesosHistorial = solicitudes.filter(s => !esEnProceso);
```

**NOTA**: El backend puede devolver estados en femenino o masculino, ambos deben considerarse.

---

### 1.3 Historial de Seguimiento ✅

**Endpoint**: `GET /api/seguimiento/historial/:idOrdenServicio`

**Autenticación**: Requerida (Bearer Token)

**Parámetros**:
- `idOrdenServicio`: ID de la orden de servicio (usar `id_orden_servicio` de la solicitud)

**Estructura de Respuesta**:
```json
[
  {
    "id_seguimiento": 456,
    "titulo": "Cambio de estado",
    "descripcion": "Descripción del seguimiento",
    "observaciones": "Observaciones adicionales",
    "nuevo_estado": "Verificación de Documentos",
    "estado_anterior": "Solicitud Inicial",
    "fecha": "2024-01-20T15:30:00",
    "fecha_registro": "2024-01-20T15:30:00",
    "usuario": "María García",
    "documentos_adjuntos": {
      "nombre_archivo": "data:application/pdf;base64,..."
    }
  }
]
```

**Orden**: Más reciente primero (ordenar por fecha descendente)

**Código de Ejemplo**:
```javascript
// services/seguimientoApiService.js
async getHistorial(idOrdenServicio, token) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/api/seguimiento/historial/${idOrdenServicio}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const historial = Array.isArray(data) ? data : [];
  
  // Ordenar por fecha (más reciente primero)
  historial.sort((a, b) => {
    const fechaA = new Date(a.fecha || a.fecha_registro || 0);
    const fechaB = new Date(b.fecha || b.fecha_registro || 0);
    return fechaB - fechaA;
  });
  
  return historial;
}
```

**Descargar Archivos de Seguimiento**:
- **Endpoint**: `GET /api/seguimiento/:idSeguimiento/descargar-archivos`
- **Respuesta**: Blob (ZIP) con todos los archivos adjuntos del seguimiento
- **Nombre por defecto**: `seguimiento_{idSeguimiento}_archivos.zip`
- **Content-Type**: `application/zip` o `application/octet-stream`

---

### 1.4 Detalle de Proceso ✅

**Endpoint**: `GET /api/gestion-solicitudes/:id`

**Autenticación**: Requerida (Bearer Token)

**Estructura de Respuesta**:
```json
{
  "id": 1,
  "id_orden_servicio": 1,
  "id_cliente": 5,
  "id_servicio": 2,
  "id_empleado_asignado": 3,
  "estado": "En proceso",
  "expediente": "EXP-001",
  "nombre_solicitante": "Juan Pérez",
  "marca_a_buscar": "Mi Marca",
  "correo_electronico": "cliente@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "servicio": {
    "id": 2,
    "nombre": "Certificación de Marca",
    "descripcion": "..."
  },
  "empleado_asignado": {
    "id_empleado": 3,
    "nombres": "María",
    "apellidos": "García",
    "correo": "maria@email.com"
  },
  "cliente": {
    "id_cliente": 5,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "cliente@email.com"
  },
  "fecha_solicitud": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:20:00",
  "motivo_anulacion": null
}
```

**Campos Importantes para Mostrar**:
- Marca: `marca_a_buscar` o `nombre_marca`
- Expediente: `expediente`
- Tipo de Solicitud: `servicio.nombre`
- Estado: `estado`
- Fecha creación: `fecha_solicitud`
- Fecha fin: `updatedAt` (solo si está finalizada/anulada)
- Motivo anulación: `motivo_anulacion` (solo si está anulada)
- Empleado asignado: `empleado_asignado.nombres + " " + empleado_asignado.apellidos`
- País: `pais`

**Descargar Archivos de Solicitud**:
- **Endpoint**: `GET /api/gestion-solicitudes/:id/descargar-archivos`
- **Respuesta**: Blob (ZIP) con todos los archivos de la solicitud
- **Nombre por defecto**: `Archivos_Solicitud_{id}.zip`
- **Content-Type**: `application/zip` o `application/octet-stream`

---

### 1.5 Pagos Pendientes ✅

**Endpoint**: `GET /api/gestion-solicitudes/mias` (mismo endpoint de listar)

**Filtrado**: Filtrar solicitudes con estado "Pendiente de Pago"

**Estructura de Solicitud con Pago Pendiente**:
```json
{
  "id": 1,
  "id_orden_servicio": 1,
  "estado": "Pendiente de Pago",
  "expediente": "EXP-001",
  "marca_a_buscar": "Mi Marca",
  "servicio": {
    "id": 2,
    "nombre": "Certificación de Marca",
    "precio": 100000.00
  },
  "monto_a_pagar": 100000.00,  // Si está disponible
  "requiere_pago": true  // Si está disponible
}
```

**Información a Mostrar**:
- Expediente
- Marca
- Tipo de servicio
- Monto a pagar (del servicio o `monto_a_pagar`)
- Estado: "Pendiente de Pago"

**Acción**: Redirigir a pasarela de pago al tocar "Pagar"

---

## 2. Crear Solicitudes como Cliente

### 2.1 Endpoint y Autenticación ✅

**Endpoint**: `POST /api/gestion-solicitudes/crear/:servicioId`

**Autenticación**: Requerida (Bearer Token)

**⚠️ IMPORTANTE**: 
- **NO enviar `id_cliente`** - Se toma automáticamente del token JWT
- Solo clientes pueden usar este endpoint sin `id_cliente`
- Administradores/Empleados DEBEN enviar `id_cliente`

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Parámetros de URL**:
- `servicioId`: ID del servicio (obtener de `GET /api/servicios`)

**Estado Inicial**: `"Pendiente de Pago"`

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Solicitud creada exitosamente",
  "data": {
    "id": 123,
    "id_orden_servicio": 123,
    "estado": "Pendiente de Pago",
    "expediente": "EXP-123",
    "requiere_pago": true,
    "monto_a_pagar": 100000.00,
    "servicio": {
      "id": 2,
      "nombre": "Certificación de Marca",
      "precio": 100000.00
    }
  }
}
```

**Después de Crear**: Mostrar pasarela de pago

---

### 2.2 Formularios por Tipo de Servicio ✅

**Servicios Disponibles**:
1. **Búsqueda de Antecedentes**
2. **Certificación de Marca**
3. **Renovación de Marca**
4. **Presentación de Oposición**
5. **Cesión de Marca**
6. **Ampliación de Alcance**
7. **Respuesta a Oposición**

**Obtener Servicios**:
```javascript
// Endpoint: GET /api/servicios
// Respuesta: Array de servicios
[
  {
    "id": 1,
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "...",
    "precio": 50000,
    "activo": true
  }
]
```

**Mapeo de Campos por Servicio**:

#### Búsqueda de Antecedentes:
```javascript
{
  nombres_apellidos: "Juan Pérez",  // nombres + apellidos concatenados
  tipo_documento: "CC",
  numero_documento: "1234567890",
  correo: "cliente@email.com",
  telefono: "3001234567",
  direccion: "Calle 123",
  pais: "Colombia",
  nombre_a_buscar: "Mi Marca",
  tipo_producto_servicio: "Productos",
  logotipo: "data:image/png;base64,..."  // Archivo en base64
}
```

#### Certificación de Marca:
```javascript
{
  tipo_solicitante: "Titular" | "Representante Autorizado",
  nombres_apellidos: "Juan Pérez",
  tipo_documento: "CC",
  numero_documento: "1234567890",
  correo: "cliente@email.com",
  nombre_marca: "Mi Marca",
  tipo_producto_servicio: "Productos",
  logotipo: "data:image/png;base64,...",
  poder_autorizacion: "data:application/pdf;base64,...",
  certificado_camara_comercio: "data:application/pdf;base64,..."  // Solo si Jurídica
}
```

**Campos Condicionales**:
- Si `tipo_solicitante === "Titular"`:
  - Si `tipo_persona === "Natural"`: Mostrar campos de persona natural
  - Si `tipo_persona === "Jurídica"`: Mostrar campos de empresa + `certificado_camara_comercio`
- Si `tipo_solicitante === "Representante Autorizado"`: Mostrar campos de persona natural

**Formato de Archivos**:
- Convertir a base64 con prefijo: `data:[mime-type];base64,`
- Ejemplo: `data:application/pdf;base64,JVBERi0xLjQK...`
- Formatos permitidos: PDF, JPG, PNG
- Tamaño máximo: 5MB por archivo

---

### 2.3 Validaciones ✅

#### Búsqueda de Antecedentes:
```javascript
const camposRequeridos = [
  "tipoDocumento",
  "numeroDocumento",
  "nombres",
  "apellidos",
  "email",
  "telefono",
  "direccion",
  "pais",
  "nombreMarca",
  "tipoProductoServicio",
  "logotipoMarca"  // Archivo
];
```

#### Otros Servicios (Certificación, Renovación, etc.):
```javascript
const camposRequeridos = [
  "tipoSolicitante",  // ✅ OBLIGATORIO
  "email",
  "nombreMarca"
];

const camposCondicionales = {
  "Titular": {
    "Natural": ["tipoDocumento", "numeroDocumento", "nombres", "apellidos"],
    "Jurídica": ["nombreEmpresa", "nit"]
  },
  "Representante Autorizado": ["tipoDocumento", "numeroDocumento", "nombres", "apellidos"]
};
```

**Validaciones de Formato**:
- **Email**: Validación básica (no vacío, formato válido)
- **Teléfono**: Validación básica (no vacío)
- **Archivos**: 
  - Máximo 5MB
  - Formatos: PDF, JPG, PNG
  - Validar antes de convertir a base64

---

### 2.4 Flujo de Pago ✅

**Después de Crear Solicitud**:

1. **Mostrar Pasarela de Pago**:
   - Monto: `monto_a_pagar` o `servicio.precio`
   - Información de la solicitud creada

2. **Procesar Pago**:
   - **Endpoint**: `POST /api/gestion-pagos/process-mock` (demo) o pasarela real
   - **Body**:
   ```json
   {
     "id_orden_servicio": 123,
     "monto": 100000.00,
     "metodo_pago": "tarjeta",
     "datos_tarjeta": { ... }
   }
   ```

3. **Después del Pago Exitoso**:
   - El estado cambia automáticamente a "Solicitud Recibida" (primer proceso)
   - Redirigir a "Mis Procesos"
   - Mostrar mensaje de éxito

**Estados del Flujo**:
- `"Pendiente de Pago"` → Crear solicitud
- `"Solicitud Recibida"` → Después de pago exitoso
- `"En proceso"` → Siguientes estados del proceso

---

## 3. Ver Mi Perfil

### 3.1 Obtener Información del Usuario ✅

**Opción 1: Desde AsyncStorage** (Recomendado)
```javascript
// Después del login, el usuario se guarda en AsyncStorage
const userStr = await AsyncStorage.getItem('currentUser');
const user = JSON.parse(userStr);
```

**Opción 2: Desde API**
```javascript
// Endpoint: GET /api/usuarios/:id
// Obtener ID del usuario desde el token o AsyncStorage
const userId = user.id_usuario;
const response = await fetch(`${API_CONFIG.BASE_URL}/api/usuarios/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Estructura del Usuario**:
```javascript
{
  id_usuario: 1,
  nombre: "Juan",
  apellido: "Pérez",
  correo: "cliente@email.com",
  telefono: "3001234567",
  tipo_documento: "CC",
  documento: "1234567890",
  direccion: "Calle 123",
  ciudad: "Bogotá",
  rol: {
    id: 1,  // 1=Cliente, 2=Admin, 3=Empleado
    nombre: "cliente",
    estado: true
  }
}
```

---

### 3.2 Editar Perfil ✅

**Endpoint**: `PUT /api/usuarios/:id`

**Autenticación**: Requerida (Bearer Token)

**Body**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "cliente@email.com",
  "telefono": "3001234567",
  "tipo_documento": "CC",
  "documento": "1234567890",
  "direccion": "Calle 123",
  "ciudad": "Bogotá"
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    ...
  }
}
```

**Después de Actualizar**:
- Actualizar AsyncStorage con el nuevo usuario
- Mostrar mensaje de éxito
- Refrescar la vista del perfil

---

### 3.3 Campos Editables ✅

**Campos que el Cliente Puede Editar**:
- `nombre` (Nombre)
- `apellido` (Apellido)
- `correo` (Correo electrónico)
- `telefono` (Teléfono)
- `tipo_documento` (Tipo de documento)
- `documento` (Número de documento)
- `direccion` (Dirección)
- `ciudad` (Ciudad)

**Campos NO Editables**:
- `id_usuario` (ID del usuario)
- `rol` (Rol del usuario)
- `estado` (Estado de la cuenta)

**Validaciones**:
- Email: Formato válido
- Teléfono: No vacío (opcional pero recomendado)
- Documento: No vacío si se proporciona tipo_documento

---

## 📋 Resumen de Endpoints para Cliente

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|---------------|
| `/api/gestion-solicitudes/mias` | GET | Listar mis solicitudes | ✅ Requerida |
| `/api/gestion-solicitudes/:id` | GET | Detalle de solicitud | ✅ Requerida |
| `/api/gestion-solicitudes/crear/:servicioId` | POST | Crear solicitud | ✅ Requerida |
| `/api/gestion-solicitudes/:id/descargar-archivos` | GET | Descargar archivos (ZIP) | ✅ Requerida |
| `/api/seguimiento/historial/:id` | GET | Historial de seguimiento | ✅ Requerida |
| `/api/seguimiento/:id/descargar-archivos` | GET | Descargar archivos de seguimiento (ZIP) | ✅ Requerida |
| `/api/servicios` | GET | Listar servicios disponibles | ❌ Público |
| `/api/usuarios/:id` | GET | Obtener información del usuario | ✅ Requerida |
| `/api/usuarios/:id` | PUT | Actualizar perfil | ✅ Requerida |
| `/api/gestion-pagos/process-mock` | POST | Procesar pago (demo) | ✅ Requerida |

---

## 🔍 Ejemplo de Código Completo para Móvil

### Servicio de Solicitudes
```javascript
// services/solicitudesApiService.js
import API_CONFIG from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SolicitudesApiService {
  async getMisSolicitudes() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/gestion-solicitudes/mias`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async crearSolicitud(servicioId, datos) {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Convertir archivos a base64 si existen
    const datosConArchivos = await this.procesarArchivos(datos);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/gestion-solicitudes/crear/${servicioId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosConArchivos)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    return await response.json();
  }

  async procesarArchivos(datos) {
    const datosProcesados = { ...datos };
    
    // Procesar logotipo
    if (datos.logotipoMarca) {
      datosProcesados.logotipo = await this.fileToBase64(datos.logotipoMarca);
      delete datosProcesados.logotipoMarca;
    }

    // Procesar otros archivos...
    
    return datosProcesados;
  }

  async fileToBase64(file) {
    // Implementar conversión de archivo a base64
    // Usar react-native-fs o similar
    return `data:${file.type};base64,${file.base64}`;
  }
}

export default new SolicitudesApiService();
```

### Servicio de Seguimiento
```javascript
// services/seguimientoApiService.js
import API_CONFIG from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SeguimientoApiService {
  async getHistorial(idOrdenServicio) {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/seguimiento/historial/${idOrdenServicio}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const historial = Array.isArray(data) ? data : [];
    
    // Ordenar por fecha (más reciente primero)
    historial.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.fecha_registro || 0);
      const fechaB = new Date(b.fecha || b.fecha_registro || 0);
      return fechaB - fechaA;
    });
    
    return historial;
  }
}

export default new SeguimientoApiService();
```

### Utilidad para Filtrar Procesos
```javascript
// utils/procesosUtils.js
const estadosTerminales = [
  'Finalizada', 
  'Finalizado', 
  'Anulada', 
  'Anulado', 
  'Rechazada', 
  'Rechazado'
];

export const filtrarProcesos = (solicitudes) => {
  const procesosActivos = solicitudes.filter(s => {
    const estado = s.estado || '';
    return !estadosTerminales.includes(estado);
  });

  const procesosHistorial = solicitudes.filter(s => {
    const estado = s.estado || '';
    return estadosTerminales.includes(estado);
  });

  return {
    activos: procesosActivos,
    historial: procesosHistorial
  };
};
```

---

## ✅ Checklist de Implementación

- [x] Endpoint para listar mis solicitudes documentado
- [x] Lógica de filtrado activos vs historial documentada
- [x] Endpoint de historial de seguimiento documentado
- [x] Endpoint de detalle de solicitud documentado
- [x] Endpoint para crear solicitud como cliente documentado
- [x] Formularios por tipo de servicio documentados
- [x] Validaciones documentadas
- [x] Flujo de pago documentado
- [x] Endpoint para obtener perfil documentado
- [x] Endpoint para editar perfil documentado
- [x] Código de ejemplo proporcionado

---

**Última actualización**: Enero 2025
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

