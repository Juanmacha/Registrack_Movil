# 📱 Documentación Completa - Módulo "Mis Procesos" para Móvil

Este documento contiene la documentación completa del módulo "Mis Procesos" con la estructura exacta de las cards y el módulo de seguimientos, basado en el análisis del código del frontend web.

---

## 📋 Índice

1. [Estructura General del Módulo](#1-estructura-general-del-módulo)
2. [Card de Proceso Activo](#2-card-de-proceso-activo)
3. [Card de Historial](#3-card-de-historial)
4. [Módulo de Seguimientos](#4-módulo-de-seguimientos)
5. [Timeline de Estados](#5-timeline-de-estados)
6. [Endpoints Utilizados](#6-endpoints-utilizados)

---

## 1. Estructura General del Módulo

### 1.1 Vista Principal

El módulo "Mis Procesos" tiene dos vistas principales:

1. **Procesos Activos**: Solicitudes que NO están finalizadas/anuladas
2. **Historial**: Solicitudes finalizadas, anuladas o rechazadas

### 1.2 Separación de Procesos

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

// Procesos activos
const procesosActivos = solicitudes.filter(s => 
  !estadosTerminales.includes(s.estado)
);

// Historial
const procesosHistorial = solicitudes.filter(s => 
  estadosTerminales.includes(s.estado)
);
```

**Endpoint Principal**: `GET /api/gestion-solicitudes/mias`

---

## 2. Card de Proceso Activo

### 2.1 Estructura Visual

```
┌─────────────────────────────────────────────────────────┐
│  [Encabezado - Fondo azul claro #f4f8ff]               │
│  ┌─────────────────┬──────────────┬─────────────────┐ │
│  │ Información     │ Estado Actual │ Última Actual.  │ │
│  │ Principal       │               │                 │ │
│  └─────────────────┴──────────────┴─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  [Timeline de Estados]                                  │
├─────────────────────────────────────────────────────────┤
│  [Detalles del Proceso Actual]                          │
│  ┌─────────────────┬─────────────────┬─────────────┐ │
│  │ Etapa actual    │ Tiempo estimado  │ Botones     │ │
│  │ Próxima acción  │ Responsable      │ Acciones    │ │
│  └─────────────────┴─────────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Campos del Encabezado

**Sección Izquierda (Información Principal)**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Marca** | `marca_a_buscar` o `nombre_marca` | Directo | "Mi Marca" |
| **Bandera País** | `pais` | Buscar en lista PAISES | 🇨🇴 |
| **Expediente** | `expediente` | Directo o `EXP-{id}` | "EXP-001" |
| **Servicio** | `servicio.nombre` o `servicio` | Directo | "Certificación de Marca" |
| **Representante** | `nombre_solicitante` o `nombre_completo_titular` | Directo | "Juan Pérez" |
| **Encargado** | `empleado_asignado.nombres + apellidos` | Concatenar | "María García" |
| **Fecha creación** | `fecha_solicitud` o `createdAt` | Formatear DD/MM/YYYY | "15/01/2024" |

**Sección Central (Estado Actual)**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Estado actual** | `estado` | Mapear con servicio | "Verificación de Documentos" |

**Sección Derecha (Última Actualización)**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Última actualización** | `fecha_solicitud` o `updatedAt` | Formatear DD/MM/YYYY | "20/01/2024" |

### 2.3 Campos del Timeline

El Timeline muestra los estados del proceso según el servicio. Se obtiene de:

**Endpoint**: `GET /api/servicios`

**Estructura del Servicio**:
```json
{
  "id": 2,
  "nombre": "Certificación de Marca",
  "process_states": [
    {
      "id": 1,
      "name": "Solicitud Recibida",
      "status_key": "recibida",
      "orden": 1
    },
    {
      "id": 2,
      "name": "Verificación de Documentos",
      "status_key": "verificacion",
      "orden": 2
    },
    {
      "id": 3,
      "name": "Procesamiento de Pago",
      "status_key": "pago",
      "orden": 3
    },
    {
      "id": 4,
      "name": "Consulta en BD",
      "status_key": "consulta",
      "orden": 4
    },
    {
      "id": 5,
      "name": "Finalizado",
      "status_key": "finalizado",
      "orden": 5,
      "es_final": true
    }
  ]
}
```

**Lógica del Timeline**:
- Estados completados: Círculo azul con número
- Estado actual: Círculo azul oscuro con número (resaltado)
- Estados pendientes: Círculo gris con número
- Líneas conectoras: Azul para completados, gris para pendientes

### 2.4 Campos de Detalles del Proceso

**Sección Izquierda**:

| Campo | Valor | Origen |
|-------|-------|--------|
| **Etapa actual** | Nombre del estado actual | `estado` mapeado con servicio |
| **Próxima acción** | Texto fijo o calculado | "Revisión de documentos" (hardcoded) |

**Sección Central**:

| Campo | Valor | Origen |
|-------|-------|--------|
| **Tiempo estimado** | Texto fijo | "15-30 días" (hardcoded) |
| **Responsable** | Nombre del empleado | `empleado_asignado` o "Sin asignar" |

**Sección Derecha (Botones)**:

| Botón | Acción | Endpoint |
|-------|--------|----------|
| **Ver seguimientos** | Abre modal de seguimientos | `GET /api/seguimiento/cliente/:idOrdenServicio` |
| **Ver historial de pagos** | Abre modal de pagos | (Local - no endpoint) |

### 2.5 Estructura de Datos Completa de la Card

```javascript
{
  // Identificación
  id: "1",  // String del id_orden_servicio
  id_orden_servicio: 1,  // ID numérico
  
  // Información Principal
  nombreMarca: "Mi Marca",  // De marca_a_buscar o nombre_marca
  expediente: "EXP-001",  // De expediente o generado
  tipoSolicitud: "Certificación de Marca",  // De servicio.nombre
  titular: "Juan Pérez",  // De nombre_solicitante
  nombreCompleto: "Juan Pérez",  // Alias de titular
  encargado: "María García",  // De empleado_asignado
  pais: "Colombia",  // Para mostrar bandera
  
  // Estado
  estado: "En proceso",  // Estado actual mapeado
  
  // Fechas
  fechaCreacion: "2024-01-15T10:30:00",  // ISO string
  fechaSolicitud: "2024-01-20T14:20:00",  // Para "Última actualización"
  
  // Contacto
  email: "cliente@email.com",
  telefono: "3001234567",
  
  // Objetos completos (si están disponibles)
  servicioCompleto: {
    id: 2,
    nombre: "Certificación de Marca",
    process_states: [...]
  },
  empleadoCompleto: {
    id_empleado: 3,
    nombres: "María",
    apellidos: "García"
  },
  clienteCompleto: {
    id_cliente: 5,
    nombre: "Juan",
    apellido: "Pérez"
  }
}
```

---

## 3. Card de Historial

### 3.1 Estructura Visual (Tabla)

```
┌─────────────────────────────────────────────────────────┐
│  [Filtros: Búsqueda, Servicio, Estado]                 │
├─────────────────────────────────────────────────────────┤
│  Marca │ Expediente │ Tipo │ Estado │ Motivo │ Fechas │
├─────────────────────────────────────────────────────────┤
│  ...   │ ...        │ ...  │ ...    │ ...    │ ...    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Campos de la Tabla

| Columna | Origen API | Transformación | Ejemplo |
|---------|------------|----------------|---------|
| **Marca** | `marca_a_buscar` o `nombre_marca` | Directo | "Mi Marca" |
| **Expediente** | `expediente` | Directo o `EXP-{id}` | "EXP-001" |
| **Tipo de Solicitud** | `servicio.nombre` | Directo | "Certificación de Marca" |
| **Estado** | `estado` | Badge con color según estado | "Anulado" (rojo) |
| **Motivo** | `motivo_anulacion` | Solo si está anulado | "Solicitud duplicada" |
| **Fecha creación** | `fecha_solicitud` | Formatear DD/MM/YYYY | "15/01/2024" |
| **Fecha fin** | `fecha_anulacion` o `fecha_finalizacion` | Formatear DD/MM/YYYY | "20/01/2024" |
| **Acciones** | - | Botón "Ver detalle" | - |

### 3.3 Badges de Estado

**Colores según Estado**:

- **Anulado/Anulada**: `bg-red-100 text-red-700`
- **Aprobado/Aprobada**: `bg-green-100 text-green-700`
- **Finalizado/Finalizada**: `bg-blue-100 text-blue-700`
- **Rechazado/Rechazada**: `bg-yellow-100 text-yellow-800`

### 3.4 Modal de Detalle (Historial)

Al hacer clic en "Ver detalle" se muestra un modal con:

| Campo | Origen | Ejemplo |
|-------|--------|---------|
| **Marca** | `nombreMarca` | "Mi Marca" |
| **Expediente** | `expediente` | "EXP-001" |
| **Tipo de Solicitud** | `tipoSolicitud` | "Certificación de Marca" |
| **Estado** | `estado` | "Anulado" |
| **Motivo de anulación** | `motivoAnulacion` | "Solicitud duplicada" (solo si anulado) |
| **Fecha creación** | `fechaCreacion` | "15/01/2024" |
| **Fecha fin** | `fechaFin` | "20/01/2024" (solo si finalizado/anulado) |
| **Duración** | Calculado | "5 días" (solo si finalizado/anulado) |
| **País** | `pais` | "Colombia" + bandera |
| **Representante** | `nombreCompleto` o `titular` | "Juan Pérez" |

---

## 4. Módulo de Seguimientos

### 4.1 Estructura del Modal de Seguimientos

```
┌─────────────────────────────────────────────────────────┐
│  [Header]                                               │
│  Marca │ Expediente │ Servicio                         │
├─────────────────────────────────────────────────────────┤
│  [Lista de Seguimientos - Scroll]                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Card de Seguimiento]                             │ │
│  │ Título + Badges (Documentos, Estado, ID)          │ │
│  │ Fecha + Usuario                                    │ │
│  │ Descripción                                        │ │
│  │ Observaciones                                      │ │
│  │ Cambio de Estado (Anterior → Nuevo)               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Endpoint de Seguimientos

**Endpoint**: `GET /api/seguimiento/cliente/:idOrdenServicio`

**Autenticación**: Requerida (Bearer Token)

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Respuesta**: Array directo o envuelto en `data`

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
    "fecha_creacion": "2024-01-20T15:30:00",
    "usuario": "María García",
    "usuario_registro": {
      "id": 3,
      "nombre": "María",
      "apellido": "García",
      "correo": "maria@email.com"
    },
    "empleado": {
      "id_empleado": 3,
      "nombres": "María",
      "apellidos": "García",
      "correo": "maria@email.com"
    },
    "documentos_adjuntos": {
      "nombre_archivo": "data:application/pdf;base64,..."
    }
  }
]
```

**Orden**: Más reciente primero (ordenar por fecha descendente)

### 4.3 Campos de la Card de Seguimiento

**Encabezado**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Título** | `titulo` o `título` | Directo | "Cambio de estado" |
| **Badge Documentos** | `documentos_adjuntos` | Verificar si existe y no es null/empty | "Documentos" (verde) |
| **Badge Estado** | `nuevo_estado` | Directo | "Verificación de Documentos" (azul) |
| **Badge ID** | `id_seguimiento` o `id` | Directo | "ID: 456" (gris) |

**Información de Usuario y Fecha**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Fecha** | `fecha_registro` o `fecha_creacion` o `fecha` | Formatear: "DD de MMMM de YYYY, HH:MM" | "20 de enero de 2024, 15:30" |
| **Fecha corta** | Mismo campo | Formatear: "DD/MM/YYYY" | "20/01/2024" |
| **Registrado por** | `usuario_registro` o `empleado` | Concatenar nombres + apellidos | "María García" |
| **Email** | `usuario_registro.correo` o `empleado.correo` | Directo | "maria@email.com" |

**Contenido**:

| Campo | Origen API | Transformación | Ejemplo |
|-------|------------|----------------|---------|
| **Descripción** | `descripcion` | Directo (texto multilínea) | "Se verificaron los documentos..." |
| **Observaciones** | `observaciones` | Directo (texto multilínea) | "Se requiere documentación adicional" |
| **Cambio de Estado** | `estado_anterior` y `nuevo_estado` | Mostrar: "Anterior → Nuevo" | "Solicitud Inicial → Verificación de Documentos" |

### 4.4 Lógica de Verificación de Documentos

```javascript
const tieneDocumentosAdjuntos = (seguimiento) => {
  const docs = seguimiento.documentos_adjuntos;
  return docs && 
         docs !== null && 
         docs !== '' && 
         docs !== 'null' &&
         typeof docs === 'object' &&
         Object.keys(docs).length > 0;
};
```

### 4.5 Formateo de Fechas

**Fecha Completa**:
```javascript
const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const fechaObj = new Date(fecha);
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
// Resultado: "20 de enero de 2024, 15:30"
```

**Fecha Corta**:
```javascript
const formatearFechaCorta = (fecha) => {
  if (!fecha) return '-';
  const fechaObj = new Date(fecha);
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
// Resultado: "20/01/2024"
```

### 4.6 Obtener Nombre del Usuario

```javascript
const obtenerNombreUsuario = (seguimiento) => {
  const usuario = seguimiento.usuario_registro || seguimiento.empleado || {};
  
  if (usuario.nombre && usuario.apellido) {
    return `${usuario.nombre} ${usuario.apellido}`;
  }
  if (usuario.nombres && usuario.apellidos) {
    return `${usuario.nombres} ${usuario.apellidos}`;
  }
  if (usuario.nombre_completo) {
    return usuario.nombre_completo;
  }
  if (usuario.nombre) {
    return usuario.nombre;
  }
  if (usuario.correo) {
    return usuario.correo;
  }
  return 'Usuario no identificado';
};
```

### 4.7 Descargar Archivos de Seguimiento

**Endpoint**: `GET /api/seguimiento/:idSeguimiento/descargar-archivos`

**Autenticación**: Requerida (Bearer Token)

**Respuesta**: Blob (ZIP)

**Headers de Respuesta**:
- `Content-Type`: `application/zip` o `application/octet-stream`
- `Content-Disposition`: `attachment; filename="seguimiento_456_archivos.zip"`

**Nombre por defecto**: `seguimiento_{idSeguimiento}_archivos.zip`

**Código de Ejemplo**:
```javascript
async descargarArchivosSeguimiento(idSeguimiento, token) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/api/seguimiento/${idSeguimiento}/descargar-archivos`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  // Obtener nombre del archivo desde headers
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `seguimiento_${idSeguimiento}_archivos.zip`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '').trim();
      filename = decodeURIComponent(filename);
    }
  }

  // Descargar el blob
  const blob = await response.blob();
  return { blob, filename };
}
```

---

## 5. Timeline de Estados

### 5.1 Estructura Visual

```
[1] ──── [2] ──── [3] ──── [4] ──── [5]
 │       │       │       │       │
Estado1 Estado2 Estado3 Estado4 Estado5
```

### 5.2 Lógica de Colores

**Estados Completados** (`idx < actualIdx`):
- Círculo: `bg-blue-500` (azul)
- Texto: `text-blue-700` (azul oscuro)
- Línea: `bg-blue-500` (azul)

**Estado Actual** (`idx === actualIdx`):
- Círculo: `bg-blue-700` (azul oscuro, más grande)
- Texto: `text-blue-700` (azul oscuro)
- Línea: `bg-blue-500` (azul)

**Estados Pendientes** (`idx > actualIdx`):
- Círculo: `bg-gray-200` (gris)
- Texto: `text-gray-400` (gris claro)
- Línea: `bg-gray-300` (gris)

### 5.3 Mapeo de Estados

El Timeline busca el estado actual en el array de `process_states` del servicio:

```javascript
const estadoMapping = {
  'En revisión': 'en_proceso',
  'Pendiente': 'recibida', 
  'En proceso': 'en_proceso',
  'Finalizado': 'finalizado',
  'Aprobado': 'aprobado',
  'Rechazado': 'rechazado',
  'Anulado': 'anulado'
};

// Buscar por nombre exacto
let estadoEncontrado = servicio.process_states.find(e => 
  e.name === estadoActual || 
  e.status_key === estadoActual
);

// Si no se encuentra, buscar por mapeo
if (!estadoEncontrado) {
  const statusKeyMapeado = estadoMapping[estadoActual];
  if (statusKeyMapeado) {
    estadoEncontrado = servicio.process_states.find(e => 
      e.status_key === statusKeyMapeado
    );
  }
}
```

### 5.4 Índice del Estado Actual

```javascript
let actualIdx = estados.findIndex(e => 
  e.name === estadoActual || 
  e.status_key === estadoActual ||
  e.status_key === estadoMapping[estadoActual]
);

// Si no se encuentra, usar el primer estado como fallback
if (actualIdx === -1 && estados.length > 0) {
  actualIdx = 0;
}
```

---

## 6. Endpoints Utilizados

### 6.1 Listar Mis Solicitudes

**Endpoint**: `GET /api/gestion-solicitudes/mias`

**Autenticación**: ✅ Requerida

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Respuesta**: Array directo

**Estructura**:
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
    "pais": "Colombia",
    "servicio": {
      "id": 2,
      "nombre": "Certificación de Marca",
      "process_states": [...]
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
    "motivo_anulacion": null
  }
]
```

### 6.2 Obtener Servicios

**Endpoint**: `GET /api/servicios`

**Autenticación**: ❌ Público

**Respuesta**: Array de servicios con `process_states`

**Estructura**:
```json
[
  {
    "id": 2,
    "id_servicio": 2,
    "nombre": "Certificación de Marca",
    "descripcion": "...",
    "precio": 100000,
    "activo": true,
    "process_states": [
      {
        "id": 1,
        "name": "Solicitud Recibida",
        "status_key": "recibida",
        "orden": 1
      },
      {
        "id": 2,
        "name": "Verificación de Documentos",
        "status_key": "verificacion",
        "orden": 2
      }
    ]
  }
]
```

### 6.3 Obtener Seguimientos del Cliente

**Endpoint**: `GET /api/seguimiento/cliente/:idOrdenServicio`

**Autenticación**: ✅ Requerida

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Parámetros**:
- `idOrdenServicio`: ID de la orden de servicio (usar `id_orden_servicio` de la solicitud)

**Respuesta**: Array directo o envuelto en `data`

**Estructura**: Ver sección [4.2](#42-endpoint-de-seguimientos)

### 6.4 Descargar Archivos de Seguimiento

**Endpoint**: `GET /api/seguimiento/:idSeguimiento/descargar-archivos`

**Autenticación**: ✅ Requerida

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Parámetros**:
- `idSeguimiento`: ID del seguimiento (`id_seguimiento`)

**Respuesta**: Blob (ZIP)

**Content-Type**: `application/zip` o `application/octet-stream`

**Content-Disposition**: `attachment; filename="seguimiento_{id}_archivos.zip"`

### 6.5 Obtener Detalle de Solicitud

**Endpoint**: `GET /api/gestion-solicitudes/:id`

**Autenticación**: ✅ Requerida

**Headers**:
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Parámetros**:
- `id`: ID de la solicitud (`id_orden_servicio`)

**Respuesta**: Objeto con detalle completo

---

## 📋 Resumen de Campos por Card

### Card de Proceso Activo

**Encabezado**:
- `nombreMarca` (Marca)
- `pais` (Bandera)
- `expediente` (Expediente)
- `tipoSolicitud` (Servicio)
- `titular` o `nombreCompleto` (Representante)
- `encargado` (Encargado)
- `fechaCreacion` (Fecha creación)
- `estado` (Estado actual)
- `fechaSolicitud` (Última actualización)

**Timeline**:
- `servicioCompleto.process_states` (Estados del proceso)
- `estado` (Estado actual para mapear)

**Detalles**:
- `estado` (Etapa actual)
- `encargado` (Responsable)
- `id_orden_servicio` (Para botón de seguimientos)

### Card de Historial

**Tabla**:
- `nombreMarca` (Marca)
- `expediente` (Expediente)
- `tipoSolicitud` (Tipo de Solicitud)
- `estado` (Estado con badge)
- `motivoAnulacion` (Motivo - solo si anulado)
- `fechaCreacion` (Fecha creación)
- `fechaFin` (Fecha fin - solo si finalizado/anulado)

### Card de Seguimiento

**Encabezado**:
- `titulo` (Título)
- `documentos_adjuntos` (Badge documentos)
- `nuevo_estado` (Badge estado)
- `id_seguimiento` (Badge ID)

**Información**:
- `fecha_registro` o `fecha_creacion` (Fecha)
- `usuario_registro` o `empleado` (Usuario)

**Contenido**:
- `descripcion` (Descripción)
- `observaciones` (Observaciones)
- `estado_anterior` y `nuevo_estado` (Cambio de estado)

---

## 🔍 Ejemplo de Código Completo para Móvil

### Servicio de Procesos
```javascript
// services/procesosApiService.js
import API_CONFIG from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProcesosApiService {
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

  async getServicios() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/servicios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
}

export default new ProcesosApiService();
```

### Servicio de Seguimientos
```javascript
// services/seguimientoApiService.js
import API_CONFIG from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SeguimientoApiService {
  async getSeguimientosCliente(idOrdenServicio) {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/seguimiento/cliente/${idOrdenServicio}`,
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
    const seguimientos = Array.isArray(data) 
      ? data 
      : (data?.data && Array.isArray(data.data) ? data.data : []);
    
    // Ordenar por fecha (más reciente primero)
    seguimientos.sort((a, b) => {
      const fechaA = new Date(a.fecha_registro || a.fecha_creacion || a.fecha || 0);
      const fechaB = new Date(b.fecha_registro || b.fecha_creacion || b.fecha || 0);
      return fechaB - fechaA;
    });
    
    return seguimientos;
  }

  async descargarArchivosSeguimiento(idSeguimiento) {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/seguimiento/${idSeguimiento}/descargar-archivos`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Obtener nombre del archivo
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `seguimiento_${idSeguimiento}_archivos.zip`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '').trim();
      }
    }

    const blob = await response.blob();
    return { blob, filename };
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

- [x] Estructura de card de proceso activo documentada
- [x] Campos del encabezado documentados
- [x] Timeline de estados documentado
- [x] Campos de detalles documentados
- [x] Estructura de card de historial documentada
- [x] Modal de seguimientos documentado
- [x] Endpoints de seguimientos documentados
- [x] Lógica de formateo de fechas documentada
- [x] Lógica de verificación de documentos documentada
- [x] Código de ejemplo proporcionado

---

**Última actualización**: Enero 2025
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/features/dashboard/pages/misProcesos/)

