# 📋 Documentación Gestión de Solicitudes (Admin) - Aplicación Móvil

Este documento contiene toda la información necesaria para implementar el módulo de Gestión de Solicitudes para administradores y empleados en la aplicación móvil React Native de Registrack (Certimarcas).

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura y Estructura](#2-arquitectura-y-estructura)
3. [Componentes Principales](#3-componentes-principales)
4. [Endpoints de la API](#4-endpoints-de-la-api)
5. [Flujos de Datos](#5-flujos-de-datos)
6. [Estilos y Diseño](#6-estilos-y-diseño)
7. [Implementación Móvil](#7-implementación-móvil)
8. [Kit de Implementación](#8-kit-de-implementación)

---

## 1. Visión General

### 1.1 Propósito

El módulo de Gestión de Solicitudes permite a administradores y empleados:
- **Listar todas las solicitudes** en proceso (excluyendo finalizadas/anuladas)
- **Crear nuevas solicitudes** en nombre de clientes (requiere seleccionar cliente)
- **Ver detalles completos** de cada solicitud
- **Editar solicitudes** (si el estado lo permite)
- **Anular solicitudes** con motivo requerido
- **Asignar empleados** a solicitudes
- **Agregar seguimiento** con documentos adjuntos
- **Descargar archivos** de solicitudes (ZIP con todos los documentos)

### 1.2 Acceso y Permisos

- **Ruta Web**: `/admin/ventasServiciosProceso`
- **Permisos Requeridos**: 
  - Módulo: `gestion_solicitudes`
  - Acción: `leer` (mínimo)
- **Roles Permitidos**: Administrador, Empleado
- **Autenticación**: Requiere token JWT válido en header `Authorization: Bearer <token>`

### 1.3 Diferencias Cliente vs Admin/Empleado

| Característica | Cliente | Admin/Empleado |
|---------------|---------|----------------|
| **Crear Solicitud** | Sin selector de cliente (usa su propio ID) | **Selector de cliente OBLIGATORIO** |
| **Estado Inicial** | "Pendiente de Pago" | Primer estado del proceso (activada automáticamente) |
| **Pasarela de Pago** | Sí (requerida) | No (se activa sin pago) |
| **Ver Solicitudes** | Solo las propias (`/api/gestion-solicitudes/mias`) | Todas (`/api/gestion-solicitudes`) |
| **Asignar Empleado** | No | Sí |
| **Anular Solicitud** | No | Sí (con motivo) |

---

## 2. Arquitectura y Estructura

### 2.1 Componentes Principales

**Archivo Principal**: `ventasServiciosProceso.jsx`

```javascript
// Estructura simplificada
<GestionVentasServiciosProceso>
  <TablaVentasProceso>
    {/* Tabla con búsqueda, filtros, paginación */}
    {/* Modales: VerDetalleVenta, EditarVenta, Seguimiento, etc. */}
  </TablaVentasProceso>
</GestionVentasServiciosProceso>
```

### 2.2 Servicios y Hooks

**Servicio API**: `solicitudesApiService.js`
- Centraliza todas las llamadas a la API de solicitudes
- Maneja autenticación, tokens y errores
- Transforma datos entre formato frontend y API

**Hooks Personalizados**: `useSalesSync` (desde `useAsyncDataSync.js`)
- Sincroniza datos de solicitudes
- Maneja refresh automático
- Gestiona estados de carga y error

### 2.3 Componentes Modales

1. **CrearSolicitudAdmin**: Modal para crear solicitud (requiere cliente)
2. **VerDetalleVenta**: Modal con detalles completos
3. **EditarVenta**: Modal para editar solicitud
4. **Seguimiento**: Modal para agregar seguimiento y cambiar estado
5. **Modal Anular**: Modal para anular con motivo
6. **Modal Asignar Empleado**: Modal para asignar/reasignar empleado

---

## 3. Componentes Principales

### 3.1 Tabla de Solicitudes (TablaVentasProceso)

#### 3.1.1 Funcionalidad

- Lista todas las solicitudes en proceso (excluye "Finalizada", "Anulada", "Rechazada")
- Búsqueda global por: expediente, cliente, marca, email, documento, encargado
- Filtros:
  - Por servicio (dropdown dinámico basado en datos)
  - Por estado (dropdown dinámico basado en datos)
- Paginación: 5 registros por página
- Acciones por fila:
  - Ver detalles
  - Editar
  - Anular
  - Asignar empleado
  - Ver seguimiento
  - Agregar seguimiento
  - Descargar documentos (ZIP)

#### 3.1.2 Datos de la API

**Endpoint**: `GET /api/gestion-solicitudes`

**Estructura de Respuesta**:
```javascript
[
  {
    id_orden_servicio: 1,
    id_cliente: 5,
    id_servicio: 2,
    id_empleado_asignado: 3,
    tipo_servicio: "Certificación de Marca",
    estado: "En proceso",
    estado_actual: "Verificación de Documentos",
    titular: "Juan Pérez",
    nombre_completo: "Juan Pérez",
    marca: "Mi Marca",
    email: "cliente@email.com",
    expediente: "EXP-001",
    encargado: "María García",
    fecha_creacion: "2024-01-15T10:30:00",
    fecha_ultima_actualizacion: "2024-01-20T14:20:00",
    // ... más campos según tipo de servicio
  },
  // ... más solicitudes
]
```

#### 3.1.3 Transformación de Datos

El servicio transforma los datos de la API al formato del frontend:

```javascript
transformarRespuestaDelAPI(solicitud) {
  return {
    id: solicitud.id_orden_servicio,
    tipoSolicitud: solicitud.tipo_servicio || solicitud.nombre_servicio,
    estado: solicitud.estado || solicitud.estado_actual,
    titular: solicitud.titular || solicitud.nombre_completo,
    marca: solicitud.marca || solicitud.nombre_marca,
    email: solicitud.email || solicitud.correo_electronico,
    expediente: solicitud.expediente || solicitud.numero_expediente,
    encargado: solicitud.encargado || solicitud.empleado_asignado || "Sin asignar",
    fechaCreacion: solicitud.fecha_creacion,
    // ... más campos
  };
}
```

#### 3.1.4 Filtrado y Búsqueda

```javascript
// Búsqueda global (case-insensitive)
const texto = busqueda.trim().toLowerCase();
const coincideTexto =
  !texto ||
  (item.titular && item.titular.toLowerCase().includes(texto)) ||
  (item.marca && item.marca.toLowerCase().includes(texto)) ||
  (item.email && item.email.toLowerCase().includes(texto)) ||
  (item.expediente && item.expediente.toLowerCase().includes(texto)) ||
  (item.encargado && item.encargado.toLowerCase().includes(texto));

// Filtros
const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
```

#### 3.1.5 Paginación

```javascript
const registrosPorPagina = 5;
const inicio = (paginaActual - 1) * registrosPorPagina;
const fin = inicio + registrosPorPagina;
const datosPagina = datosFiltrados.slice(inicio, fin);
```

#### 3.1.6 Estilos Web

```css
/* Tabla */
.table-responsive {
  overflow-x: auto;
}

/* Fila de tabla */
.fila-tabla {
  transition: background-color 0.2s;
}

.fila-tabla:hover {
  background-color: #f9fafb;
}

/* Badge de estado */
.badge-estado {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.badge-en-proceso {
  background: #dbeafe;
  color: #1e40af;
}

.badge-finalizado {
  background: #d1fae5;
  color: #065f46;
}

.badge-anulado {
  background: #fee2e2;
  color: #991b1b;
}
```

---

### 3.2 Crear Solicitud (CrearSolicitudAdmin)

#### 3.2.1 Funcionalidad

- **Paso 1**: Selector de cliente (OBLIGATORIO)
- **Paso 2**: Formulario dinámico según tipo de servicio
- Validación de campos requeridos
- Conversión de archivos a base64
- Envío a API con `id_cliente` obligatorio

#### 3.2.2 Tipos de Servicio y Formularios

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

#### 3.2.3 Validaciones Específicas

**Búsqueda de Antecedentes**:
- NO tiene `tipoSolicitante`
- Campos requeridos: tipoDocumento, numeroDocumento, nombres, apellidos, email, telefono, direccion, pais, nombreMarca, tipoProductoServicio, logotipoMarca

**Otros Servicios**:
- Requiere `tipoSolicitante`
- Si es "Titular":
  - Tipo de persona (Natural/Jurídica)
  - Si Natural: tipoDocumento, numeroDocumento, nombres, apellidos
  - Si Jurídica: nombreEmpresa, nit
- Si es "Representante Autorizado": tipoDocumento, numeroDocumento, nombres, apellidos

#### 3.2.4 Conversión de Archivos

```javascript
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`));
      return;
    }

    // Validar formato (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`El archivo ${file.name} debe ser PDF, JPG o PNG`));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // Incluye prefijo data:
    reader.onerror = error => reject(error);
  });
};
```

#### 3.2.5 Payload para API

```javascript
// Campos comunes
const datosAPI = {
  id_cliente: parseInt(idClienteSeleccionado), // OBLIGATORIO para admin
  pais: form.pais || '',
  ciudad: form.ciudad || '',
  tipodepersona: form.tipoPersona || '',
  tipodedocumento: form.tipoDocumento || '',
  numerodedocumento: form.numeroDocumento || '',
  nombrecompleto: `${form.nombres} ${form.apellidos}`.trim(),
  correoelectronico: form.email || '',
  telefono: form.telefono || '',
  direccion: form.direccion || '',
  nombredelamarca: form.nombreMarca || '',
  // Archivos en base64 (con prefijo data:)
  logotipo: form.logotipoMarca ? await fileToBase64(form.logotipoMarca) : null,
  poderparaelregistrodelamarca: form.poderAutorizacion ? await fileToBase64(form.poderAutorizacion) : null,
  // ... más campos según servicio
};
```

#### 3.2.6 Endpoint de Creación

**Endpoint**: `POST /api/gestion-solicitudes/crear/:servicioId`

**IMPORTANTE**: El parámetro `:servicioId` debe ser el **ID numérico** del servicio, NO el nombre.

**Flujo**:
1. Obtener lista de servicios: `GET /api/servicios`
2. Buscar servicio por nombre para obtener su ID
3. Llamar a `POST /api/gestion-solicitudes/crear/{idServicio}`

**Respuesta Exitosa**:
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "id_orden_servicio": 123,
    "estado": "Solicitud Inicial",
    "id_cliente": 5,
    "id_servicio": 2
  }
}
```

#### 3.2.7 Estilos Web

```css
/* Selector de cliente */
.selector-cliente {
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

/* Formulario */
.formulario-solicitud {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Input */
.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  focus: ring-2 ring-blue-500;
}
```

---

### 3.3 Ver Detalles (VerDetalleVenta)

#### 3.3.1 Información Mostrada

**Secciones**:
1. **Información del Titular**:
   - Avatar, nombre completo, email, teléfono
   - Tipo de solicitante, tipo de documento, número de documento
   - Dirección, ciudad, país, código postal
   - Representante legal (si aplica)

2. **Información de la Empresa** (si aplica):
   - Nombre de empresa, razón social, NIT
   - Tipo de entidad

3. **Información de la Solicitud**:
   - Estado (con badge)
   - Tipo de solicitud
   - Encargado asignado
   - Fechas (creación, finalización, anulación)
   - ID de solicitud, cliente, empleado, servicio
   - Motivo de anulación (si aplica)

4. **Información de la Marca**:
   - Nombre de marca, NIT marca, categoría
   - Clases (número y descripción)

5. **Documentos Adjuntos**:
   - Logotipo de marca
   - Poder de representante
   - Poder para registro de marca
   - Certificado de cámara de comercio
   - Documentos de cesión/oposición
   - Soportes

6. **Historial de Seguimiento**:
   - Timeline de seguimientos
   - Fechas, títulos, descripciones
   - Documentos adjuntos de seguimiento

#### 3.3.2 Acciones Disponibles

- **Editar**: Si el estado permite edición
- **Anular**: Si el estado permite anulación
- **Asignar Empleado**: Siempre disponible
- **Agregar Seguimiento**: Siempre disponible
- **Descargar Documentos**: Descarga ZIP con todos los archivos
- **Ver Seguimiento**: Abre modal de seguimiento

#### 3.3.3 Estilos Web

```css
/* Modal de detalles */
.modal-detalle {
  max-width: 6xl;
  max-height: 90vh;
  overflow-y: auto;
}

/* Sección */
.seccion-detalle {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

/* Avatar */
.avatar-cliente {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  border: 2px solid #93c5fd;
}
```

---

### 3.4 Editar Solicitud (EditarVenta)

#### 3.4.1 Funcionalidad

- Carga datos actuales de la solicitud
- Formulario prellenado con datos existentes
- Validación de campos
- Solo permite edición si el estado lo permite (no finalizada/anulada)

#### 3.4.2 Endpoint

**Endpoint**: `PUT /api/gestion-solicitudes/editar/:id`

**Payload**:
```javascript
{
  pais: datosActualizados.pais || '',
  ciudad: datosActualizados.ciudad || '',
  tipodepersona: datosActualizados.tipoPersona || '',
  tipodedocumento: datosActualizados.tipoDocumento || '',
  numerodedocumento: datosActualizados.numeroDocumento || '',
  nombrecompleto: `${datosActualizados.nombres} ${datosActualizados.apellidos}`.trim(),
  correoelectronico: datosActualizados.email || '',
  telefono: datosActualizados.telefono || '',
  direccion: datosActualizados.direccion || '',
  tipodeentidadrazonsocial: datosActualizados.tipoEntidad || '',
  nombredelaempresa: datosActualizados.nombreEmpresa || '',
  nit: datosActualizados.nit || '',
  poderdelrepresentanteautorizado: datosActualizados.poderRepresentante || '',
  poderparaelregistrodelamarca: datosActualizados.poderAutorizacion || ''
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "mensaje": "Solicitud actualizada correctamente",
  "data": {
    "id_orden_servicio": 123,
    // ... datos actualizados
  }
}
```

---

### 3.5 Anular Solicitud

#### 3.5.1 Funcionalidad

- Modal de confirmación
- Campo de motivo (requerido, texto libre)
- Validación: motivo no puede estar vacío
- Envía notificación por email al cliente

#### 3.5.2 Endpoint

**Endpoint**: `PUT /api/gestion-solicitudes/anular/:id`

**Payload**:
```javascript
{
  motivo: "Motivo de anulación" // Requerido, string
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "mensaje": "Solicitud anulada exitosamente",
  "data": {
    "id_orden_servicio": 123,
    "estado": "Anulada",
    "motivo_anulacion": "Motivo de anulación",
    "fecha_anulacion": "2024-01-20T15:30:00"
  }
}
```

**Errores**:
- `400`: Motivo requerido
- `404`: Solicitud no encontrada
- `409`: Solicitud ya está anulada

#### 3.5.3 Flujo

```javascript
const handleAnular = async () => {
  // 1. Validar motivo
  if (!motivoAnular.trim()) {
    AlertService.error('Motivo requerido', 'Debes proporcionar un motivo');
    return;
  }

  // 2. Confirmar acción
  const confirm = await AlertService.confirm(
    '¿Anular solicitud?',
    'Esta acción no se puede deshacer. ¿Estás seguro?'
  );
  if (!confirm.isConfirmed) return;

  // 3. Llamar a API
  await solicitudesApiService.anularSolicitud(id, motivoAnular.trim(), token);

  // 4. Refrescar datos
  await refreshVentas();
};
```

---

### 3.6 Asignar Empleado

#### 3.6.1 Funcionalidad

- Modal con lista de empleados activos
- Búsqueda de empleados
- Mostrar empleado actualmente asignado
- Confirmación antes de asignar/reasignar

#### 3.6.2 Endpoint

**Endpoint**: `PUT /api/gestion-solicitudes/asignar-empleado/:id`

**Payload**:
```javascript
{
  id_empleado: 3 // ID numérico del empleado
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "mensaje": "Empleado asignado exitosamente",
  "data": {
    "solicitud_id": 123,
    "empleado_asignado": {
      "id_empleado": 3,
      "nombre": "María García López",
      "correo": "maria@email.com"
    },
    "empleado_anterior": {
      "id_empleado": 2,
      "nombre": "Juan Pérez"
    }
  }
}
```

#### 3.6.3 Obtener Empleado Actual

**Endpoint**: `GET /api/gestion-solicitudes/:id/empleado-asignado`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id_empleado": 3,
    "nombre": "María García López",
    "correo": "maria@email.com",
    "estado_empleado": true
  }
}
```

#### 3.6.4 Obtener Lista de Empleados

**Endpoint**: `GET /api/gestion-empleados`

**Filtrar**: Solo empleados con `estado_empleado === true`

---

### 3.7 Seguimiento

#### 3.7.1 Funcionalidad

- Agregar nuevo seguimiento a una solicitud
- Cambiar estado de la solicitud (opcional)
- Adjuntar documentos (PDF, JPG, PNG, máx 5MB)
- Ver historial completo de seguimientos

#### 3.7.2 Endpoint de Creación

**Endpoint**: `POST /api/seguimiento/crear`

**Payload**:
```javascript
{
  id_orden_servicio: 123, // Requerido
  titulo: "Cambio de estado", // Requerido, máx 200 caracteres
  descripcion: "Descripción del seguimiento", // Requerido
  observaciones: "Observaciones adicionales", // Opcional
  nuevo_proceso: "Verificación de Documentos", // Opcional (nombre exacto del estado)
  documentos_adjuntos: { // Opcional, objeto JSON
    "nombre_archivo": "data:application/pdf;base64,..."
  }
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "mensaje": "Seguimiento creado exitosamente",
  "data": {
    "id_seguimiento": 456,
    "id_orden_servicio": 123,
    "titulo": "Cambio de estado",
    "descripcion": "Descripción del seguimiento",
    "nuevo_estado": "Verificación de Documentos",
    "estado_anterior": "Solicitud Inicial",
    "fecha": "2024-01-20T15:30:00",
    "usuario": "María García"
  }
}
```

#### 3.7.3 Obtener Estados Disponibles

**Endpoint**: `GET /api/gestion-solicitudes/:id/estados-disponibles`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "estado_actual": "Solicitud Inicial",
    "estados_disponibles": [
      "Verificación de Documentos",
      "Procesamiento de Pago",
      "Consulta en BD",
      "Generación de Certificado"
    ]
  }
}
```

#### 3.7.4 Obtener Historial

**Endpoint**: `GET /api/seguimiento/historial/:idOrdenServicio`

**Respuesta**:
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
    "usuario": "María García",
    "documentos_adjuntos": {
      "documento1": "data:application/pdf;base64,..."
    }
  },
  // ... más seguimientos
]
```

#### 3.7.5 Estructura de Documentos Adjuntos

Los documentos adjuntos se envían como un **objeto JSON** donde:
- **Clave**: Nombre del archivo (sin extensión)
- **Valor**: Base64 con prefijo `data:[mime-type];base64,`

```javascript
{
  "documento_seguimiento": "data:application/pdf;base64,JVBERi0x..."
}
```

---

### 3.8 Descargar Archivos

#### 3.8.1 Descargar Todos los Archivos (ZIP)

**Endpoint**: `GET /api/gestion-solicitudes/:id/descargar-archivos`

**Respuesta**: Archivo ZIP con:
- Todos los archivos de la solicitud (logotipo, poderes, certificados, documentos)
- Nombres descriptivos (01_logotipo.pdf, 02_poder_registro_marca.pdf, etc.)
- Archivo README.txt con información de la solicitud

**Headers de Respuesta**:
```
Content-Type: application/zip
Content-Disposition: attachment; filename="solicitud-123-archivos.zip"
```

#### 3.8.2 Descargar Archivos de Seguimiento

**Endpoint**: `GET /api/seguimiento/:idSeguimiento/archivos`

**Respuesta**: Archivo ZIP con documentos del seguimiento específico

---

## 4. Endpoints de la API

### 4.1 Base URL y Configuración

```javascript
const API_CONFIG = {
  BASE_URL: 'https://api-registrack-2.onrender.com', // Producción
  // BASE_URL: '', // Desarrollo (usa proxy)
  
  ENDPOINTS: {
    SOLICITUDES: '/api/gestion-solicitudes',
    SOLICITUDES_MIAS: '/api/gestion-solicitudes/mias',
    CREAR_SOLICITUD: (servicioId) => `/api/gestion-solicitudes/crear/${servicioId}`,
    SOLICITUD_BY_ID: (id) => `/api/gestion-solicitudes/${id}`,
    EDITAR_SOLICITUD: (id) => `/api/gestion-solicitudes/editar/${id}`,
    ANULAR_SOLICITUD: (id) => `/api/gestion-solicitudes/anular/${id}`,
    ASIGNAR_EMPLEADO: (id) => `/api/gestion-solicitudes/asignar-empleado/${id}`,
    EMPLEADO_ASIGNADO: (id) => `/api/gestion-solicitudes/${id}/empleado-asignado`,
    ESTADOS_DISPONIBLES: (id) => `/api/gestion-solicitudes/${id}/estados-disponibles`,
    DESCARGAR_ARCHIVOS: (id) => `/api/gestion-solicitudes/${id}/descargar-archivos`,
    BUSCAR_SOLICITUDES: '/api/gestion-solicitudes/buscar',
    SEGUIMIENTO_CREAR: '/api/seguimiento/crear',
    SEGUIMIENTO_HISTORIAL: (id) => `/api/seguimiento/historial/${id}`,
    SERVICIOS: '/api/servicios',
    CLIENTES: '/api/gestion-clientes',
    EMPLEADOS: '/api/gestion-empleados'
  }
};
```

### 4.2 Headers Requeridos

```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### 4.3 Endpoints Detallados

#### 4.3.1 GET /api/gestion-solicitudes

**Query Parameters**: Ninguno (devuelve todas las solicitudes)

**Respuesta Exitosa** (200):
```json
[
  {
    "id_orden_servicio": 1,
    "id_cliente": 5,
    "id_servicio": 2,
    "tipo_servicio": "Certificación de Marca",
    "estado": "En proceso",
    "estado_actual": "Verificación de Documentos",
    "titular": "Juan Pérez",
    "marca": "Mi Marca",
    "email": "cliente@email.com",
    "expediente": "EXP-001",
    "fecha_creacion": "2024-01-15T10:30:00"
  }
]
```

**Filtrado en Frontend**:
- Excluir estados: "Finalizada", "Finalizado", "Anulada", "Anulado", "Rechazada", "Rechazado"

#### 4.3.2 POST /api/gestion-solicitudes/crear/:servicioId

**Path Parameters**:
- `servicioId` (number, requerido): ID numérico del servicio

**Body**:
```json
{
  "id_cliente": 5,
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "tipodepersona": "Natural",
  "tipodedocumento": "CC",
  "numerodedocumento": "1234567890",
  "nombrecompleto": "Juan Pérez",
  "correoelectronico": "cliente@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "nombredelamarca": "Mi Marca",
  "logotipo": "data:image/png;base64,...",
  "poderparaelregistrodelamarca": "data:application/pdf;base64,..."
}
```

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "id_orden_servicio": 123,
    "estado": "Solicitud Inicial",
    "id_cliente": 5,
    "id_servicio": 2
  }
}
```

#### 4.3.3 GET /api/gestion-solicitudes/:id

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Respuesta Exitosa** (200):
```json
{
  "id_orden_servicio": 123,
  "id_cliente": 5,
  "id_servicio": 2,
  "tipo_servicio": "Certificación de Marca",
  "estado": "En proceso",
  "estado_actual": "Verificación de Documentos",
  "titular": "Juan Pérez",
  "marca": "Mi Marca",
  "email": "cliente@email.com",
  "expediente": "EXP-001",
  "fecha_creacion": "2024-01-15T10:30:00",
  "empleado_asignado": {
    "id_empleado": 3,
    "nombre": "María García"
  },
  // ... todos los campos de la solicitud
}
```

#### 4.3.4 PUT /api/gestion-solicitudes/editar/:id

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Body**:
```json
{
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "tipodepersona": "Natural",
  "tipodedocumento": "CC",
  "numerodedocumento": "1234567890",
  "nombrecompleto": "Juan Pérez",
  "correoelectronico": "cliente@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67"
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "mensaje": "Solicitud actualizada correctamente",
  "data": {
    "id_orden_servicio": 123,
    // ... datos actualizados
  }
}
```

#### 4.3.5 PUT /api/gestion-solicitudes/anular/:id

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Body**:
```json
{
  "motivo": "Motivo de anulación" // Requerido
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "mensaje": "Solicitud anulada exitosamente",
  "data": {
    "id_orden_servicio": 123,
    "estado": "Anulada",
    "motivo_anulacion": "Motivo de anulación",
    "fecha_anulacion": "2024-01-20T15:30:00"
  }
}
```

#### 4.3.6 PUT /api/gestion-solicitudes/asignar-empleado/:id

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Body**:
```json
{
  "id_empleado": 3 // Requerido, número
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "mensaje": "Empleado asignado exitosamente",
  "data": {
    "solicitud_id": 123,
    "empleado_asignado": {
      "id_empleado": 3,
      "nombre": "María García López",
      "correo": "maria@email.com"
    },
    "empleado_anterior": null
  }
}
```

#### 4.3.7 GET /api/gestion-solicitudes/:id/estados-disponibles

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "estado_actual": "Solicitud Inicial",
    "estados_disponibles": [
      "Verificación de Documentos",
      "Procesamiento de Pago",
      "Consulta en BD"
    ]
  }
}
```

#### 4.3.8 GET /api/gestion-solicitudes/:id/descargar-archivos

**Path Parameters**:
- `id` (number, requerido): ID de la orden de servicio

**Respuesta**: Archivo ZIP

**Headers**:
```
Content-Type: application/zip
Content-Disposition: attachment; filename="solicitud-123-archivos.zip"
```

#### 4.3.9 POST /api/seguimiento/crear

**Body**:
```json
{
  "id_orden_servicio": 123,
  "titulo": "Cambio de estado",
  "descripcion": "Descripción del seguimiento",
  "observaciones": "Observaciones adicionales",
  "nuevo_proceso": "Verificación de Documentos",
  "documentos_adjuntos": {
    "documento1": "data:application/pdf;base64,..."
  }
}
```

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "mensaje": "Seguimiento creado exitosamente",
  "data": {
    "id_seguimiento": 456,
    "id_orden_servicio": 123,
    "titulo": "Cambio de estado",
    "nuevo_estado": "Verificación de Documentos",
    "fecha": "2024-01-20T15:30:00"
  }
}
```

#### 4.3.10 GET /api/seguimiento/historial/:idOrdenServicio

**Path Parameters**:
- `idOrdenServicio` (number, requerido): ID de la orden de servicio

**Respuesta Exitosa** (200):
```json
[
  {
    "id_seguimiento": 456,
    "titulo": "Cambio de estado",
    "descripcion": "Descripción",
    "nuevo_estado": "Verificación de Documentos",
    "estado_anterior": "Solicitud Inicial",
    "fecha": "2024-01-20T15:30:00",
    "usuario": "María García"
  }
]
```

---

## 5. Flujos de Datos

### 5.1 Flujo de Carga de Solicitudes

```
1. Usuario accede a /admin/ventasServiciosProceso
2. Verificar autenticación y permisos
3. Llamar a GET /api/gestion-solicitudes
4. Transformar datos de API al formato frontend
5. Filtrar solo solicitudes en proceso (excluir finalizadas/anuladas)
6. Aplicar filtros y búsqueda local
7. Paginar resultados (5 por página)
8. Renderizar tabla
```

### 5.2 Flujo de Crear Solicitud (Admin)

```
1. Usuario hace clic en "Crear Solicitud"
2. Abrir modal con selector de tipo de servicio
3. Usuario selecciona tipo de servicio
4. Abrir modal CrearSolicitudAdmin
5. PASO 1: Usuario selecciona cliente (OBLIGATORIO)
   - Cargar lista de clientes: GET /api/gestion-clientes
   - Mostrar selector con búsqueda
6. PASO 2: Mostrar formulario dinámico según servicio
   - Usuario completa campos
   - Validar campos requeridos
   - Convertir archivos a base64
7. Obtener ID del servicio: GET /api/servicios
8. Llamar a POST /api/gestion-solicitudes/crear/{servicioId}
   - Incluir id_cliente en payload
9. Mostrar éxito y refrescar tabla
10. Cerrar modal
```

### 5.3 Flujo de Editar Solicitud

```
1. Usuario hace clic en "Editar" en una fila
2. Verificar que el estado permita edición
3. Cargar datos actuales: GET /api/gestion-solicitudes/:id
4. Abrir modal EditarVenta con datos prellenados
5. Usuario modifica campos
6. Validar campos
7. Llamar a PUT /api/gestion-solicitudes/editar/:id
8. Mostrar éxito y refrescar tabla
9. Cerrar modal
```

### 5.4 Flujo de Anular Solicitud

```
1. Usuario hace clic en "Anular" en una fila
2. Abrir modal de confirmación con campo de motivo
3. Usuario ingresa motivo (requerido)
4. Validar que motivo no esté vacío
5. Confirmar acción con usuario
6. Llamar a PUT /api/gestion-solicitudes/anular/:id
   - Body: { motivo: "..." }
7. Mostrar éxito
8. Refrescar tabla (la solicitud ya no aparecerá en "en proceso")
9. Cerrar modal
```

### 5.5 Flujo de Asignar Empleado

```
1. Usuario hace clic en "Asignar Empleado" en una fila
2. Abrir modal de asignación
3. Cargar empleado actual: GET /api/gestion-solicitudes/:id/empleado-asignado
4. Cargar lista de empleados activos: GET /api/gestion-empleados
   - Filtrar solo con estado_empleado === true
5. Mostrar selector con búsqueda
6. Usuario selecciona empleado
7. Confirmar acción
8. Llamar a PUT /api/gestion-solicitudes/asignar-empleado/:id
   - Body: { id_empleado: 3 }
9. Mostrar éxito y refrescar tabla
10. Cerrar modal
```

### 5.6 Flujo de Agregar Seguimiento

```
1. Usuario hace clic en "Agregar Seguimiento" en una fila
2. Abrir modal Seguimiento
3. Cargar estados disponibles: GET /api/gestion-solicitudes/:id/estados-disponibles
4. Cargar historial: GET /api/seguimiento/historial/:idOrdenServicio
5. Usuario completa:
   - Título (requerido, máx 200 caracteres)
   - Descripción (requerido)
   - Observaciones (opcional)
   - Cambiar estado (opcional, seleccionar de lista)
   - Documentos adjuntos (opcional, convertir a base64)
6. Validar campos
7. Llamar a POST /api/seguimiento/crear
   - Body: {
       id_orden_servicio: 123,
       titulo: "...",
       descripcion: "...",
       nuevo_proceso: "..." (si se cambia estado),
       documentos_adjuntos: { ... } (si hay archivos)
     }
8. Mostrar éxito y refrescar historial
9. Cerrar modal
```

### 5.7 Flujo de Descargar Archivos

```
1. Usuario hace clic en "Descargar Documentos" en una fila
2. Mostrar loading
3. Llamar a GET /api/gestion-solicitudes/:id/descargar-archivos
4. Recibir blob del archivo ZIP
5. Crear URL temporal del blob
6. Crear elemento <a> y simular clic
7. Descargar archivo
8. Limpiar URL temporal
9. Mostrar éxito
```

---

## 6. Estilos y Diseño

### 6.1 Colores Principales

```javascript
const colors = {
  // Primarios
  blue: {
    primary: '#347cf7',
    dark: '#083874',
    light: '#3B82F6',
    hover: '#2563EB'
  },
  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  // Neutros
  gray: {
    light: '#F9FAFB',
    medium: '#E5E7EB',
    dark: '#6B7280',
    text: '#111827'
  }
};
```

### 6.2 Badges de Estado

```css
/* Pendiente */
.badge-pendiente {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

/* En proceso */
.badge-en-proceso {
  background: #dbeafe;
  color: #1e40af;
}

/* Finalizado */
.badge-finalizado {
  background: #d1fae5;
  color: #065f46;
}

/* Anulado */
.badge-anulado {
  background: #fee2e2;
  color: #991b1b;
}
```

### 6.3 Tabla

```css
/* Tabla responsiva */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Encabezado de tabla */
.table-header {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  padding: 1rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Fila de tabla */
.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9fafb;
}

/* Celda */
.table-cell {
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}
```

### 6.4 Modales

```css
/* Modal base */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

/* Header del modal */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Body del modal */
.modal-body {
  padding: 1.5rem;
}

/* Footer del modal */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

### 6.5 Formularios

```css
/* Input */
.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #347cf7;
  box-shadow: 0 0 0 3px rgba(52, 124, 247, 0.1);
}

.input-field-error {
  border-color: #ef4444;
}

/* Select */
.select-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
}

/* File Upload */
.file-upload {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s;
}

.file-upload:hover {
  border-color: #347cf7;
}

.file-upload-active {
  border-color: #347cf7;
  background: #eff6ff;
}
```

---

## 7. Implementación Móvil

### 7.1 Estructura de Carpetas Sugerida

```
src/
├── screens/
│   └── solicitudes/
│       ├── SolicitudesListScreen.js
│       ├── CreateSolicitudScreen.js
│       ├── SolicitudDetailScreen.js
│       ├── EditSolicitudScreen.js
│       └── SeguimientoScreen.js
├── components/
│   └── solicitudes/
│       ├── SolicitudCard.js
│       ├── SolicitudTable.js
│       ├── FiltrosSolicitudes.js
│       ├── SelectorCliente.js
│       └── FormularioDinamico.js
├── services/
│   └── solicitudes/
│       ├── solicitudesApiService.js
│       └── seguimientoApiService.js
└── utils/
    └── fileUtils.js
```

### 7.2 Librerías Recomendadas

```json
{
  "dependencies": {
    "react-native": "^0.72.0",
    "react-native-paper": "^5.10.0",
    "react-native-vector-icons": "^10.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-document-picker": "^9.1.1",
    "react-native-fs": "^2.20.0",
    "react-native-zip-archive": "^6.0.15",
    "react-native-share": "^9.4.1",
    "react-native-table-component": "^1.2.0"
  }
}
```

### 7.3 Adaptaciones Necesarias

#### 7.3.1 Tablas

**Web**: HTML `<table>`
**Móvil**: FlatList o SectionList

```javascript
import { FlatList } from 'react-native';

<FlatList
  data={datosPagina}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <SolicitudCard solicitud={item} />}
  ListHeaderComponent={<FiltrosSolicitudes />}
  ListFooterComponent={<Paginacion />}
  refreshing={loading}
  onRefresh={refreshVentas}
/>
```

#### 7.3.2 Selector de Archivos

**Web**: `<input type="file">`
**Móvil**: `react-native-document-picker`

```javascript
import DocumentPicker from 'react-native-document-picker';

const pickFile = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
    });
    
    // Validar tamaño (máx 5MB)
    if (result.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'El archivo excede 5MB');
      return;
    }
    
    // Convertir a base64
    const base64 = await RNFS.readFile(result.uri, 'base64');
    const mimeType = result.type;
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    return dataUri;
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // Usuario canceló
    } else {
      Alert.alert('Error', 'Error al seleccionar archivo');
    }
  }
};
```

#### 7.3.3 Descarga de Archivos

**Web**: `file-saver` + blob URL
**Móvil**: `react-native-fs` + `react-native-share`

```javascript
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const downloadZip = async (url, filename) => {
  try {
    // Descargar archivo
    const downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: downloadPath,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).promise;

    if (result.statusCode === 200) {
      // Compartir/abrir archivo
      await Share.open({
        url: `file://${downloadPath}`,
        type: 'application/zip'
      });
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo descargar el archivo');
  }
};
```

#### 7.3.4 Formularios Dinámicos

**Web**: Componentes React con formularios específicos
**Móvil**: Renderizar campos dinámicamente según tipo de servicio

```javascript
const renderFormFields = (tipoServicio) => {
  switch (tipoServicio) {
    case 'Búsqueda de Antecedentes':
      return <FormularioBusqueda />;
    case 'Certificación de Marca':
      return <FormularioCertificacion />;
    // ... más casos
    default:
      return <Text>Formulario no disponible</Text>;
  }
};
```

### 7.4 Navegación

```javascript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

<Stack.Navigator>
  <Stack.Screen 
    name="SolicitudesList" 
    component={SolicitudesListScreen}
    options={{ title: 'Solicitudes en Proceso' }}
  />
  <Stack.Screen 
    name="CreateSolicitud" 
    component={CreateSolicitudScreen}
    options={{ title: 'Crear Solicitud' }}
  />
  <Stack.Screen 
    name="SolicitudDetail" 
    component={SolicitudDetailScreen}
    options={{ title: 'Detalle de Solicitud' }}
  />
  <Stack.Screen 
    name="EditSolicitud" 
    component={EditSolicitudScreen}
    options={{ title: 'Editar Solicitud' }}
  />
  <Stack.Screen 
    name="Seguimiento" 
    component={SeguimientoScreen}
    options={{ title: 'Seguimiento' }}
  />
</Stack.Navigator>
```

---

## 8. Kit de Implementación

### 8.1 Prompt para IA/Desarrollador

```
Eres un desarrollador React Native que debe implementar el módulo de Gestión de Solicitudes para administradores y empleados en Registrack (Certimarcas). El módulo debe incluir:

1. **Lista de Solicitudes**:
   - Endpoint: GET /api/gestion-solicitudes
   - Mostrar solo solicitudes en proceso (excluir "Finalizada", "Anulada", "Rechazada")
   - Búsqueda global por: expediente, cliente, marca, email, documento, encargado
   - Filtros por servicio y estado (dropdowns dinámicos)
   - Paginación: 5 registros por página
   - Acciones por fila: Ver detalles, Editar, Anular, Asignar empleado, Ver seguimiento, Agregar seguimiento, Descargar documentos

2. **Crear Solicitud (Admin)**:
   - Endpoint: POST /api/gestion-solicitudes/crear/:servicioId
   - PASO 1: Selector de cliente OBLIGATORIO (GET /api/gestion-clientes)
   - PASO 2: Formulario dinámico según tipo de servicio
   - Validaciones específicas por servicio
   - Conversión de archivos a base64 (PDF, JPG, PNG, máx 5MB)
   - Incluir id_cliente en payload (OBLIGATORIO para admin)
   - Obtener ID del servicio antes de crear (GET /api/servicios)

3. **Ver Detalles**:
   - Endpoint: GET /api/gestion-solicitudes/:id
   - Mostrar: información del titular, empresa, solicitud, marca, documentos, historial

4. **Editar Solicitud**:
   - Endpoint: PUT /api/gestion-solicitudes/editar/:id
   - Solo si el estado permite edición
   - Formulario prellenado

5. **Anular Solicitud**:
   - Endpoint: PUT /api/gestion-solicitudes/anular/:id
   - Body: { motivo: "string" } (requerido)
   - Modal de confirmación con campo de motivo

6. **Asignar Empleado**:
   - Endpoint: PUT /api/gestion-solicitudes/asignar-empleado/:id
   - Body: { id_empleado: number }
   - Cargar empleados activos: GET /api/gestion-empleados (filtrar estado_empleado === true)
   - Mostrar empleado actual: GET /api/gestion-solicitudes/:id/empleado-asignado

7. **Seguimiento**:
   - Crear: POST /api/seguimiento/crear
   - Body: { id_orden_servicio, titulo, descripcion, observaciones?, nuevo_proceso?, documentos_adjuntos? }
   - Obtener estados: GET /api/gestion-solicitudes/:id/estados-disponibles
   - Obtener historial: GET /api/seguimiento/historial/:idOrdenServicio
   - Documentos adjuntos: objeto JSON con base64

8. **Descargar Archivos**:
   - Endpoint: GET /api/gestion-solicitudes/:id/descargar-archivos
   - Devuelve ZIP con todos los archivos
   - Usar react-native-fs y react-native-share

Implementa:
- Servicio `solicitudesApiService` con métodos para cada endpoint
- Transformación de datos entre formato API y frontend
- Manejo de estados de carga y error
- Autenticación con token JWT en headers
- Validaciones de formularios según tipo de servicio
- Conversión de archivos a base64 para móvil
- Estilos consistentes con el diseño web
- Navegación con React Navigation
- Componentes reutilizables (Card, Badge, Modal, Input, etc.)

La API base es: https://api-registrack-2.onrender.com
Todos los endpoints requieren token en header: Authorization: Bearer <token>
```

### 8.2 Checklist de Implementación

- [ ] Configurar servicio API con autenticación
- [ ] Implementar lista de solicitudes con FlatList
- [ ] Implementar búsqueda y filtros
- [ ] Implementar paginación
- [ ] Crear componente de tarjeta de solicitud
- [ ] Implementar modal de crear solicitud (2 pasos: cliente + formulario)
- [ ] Implementar selector de cliente con búsqueda
- [ ] Implementar formularios dinámicos por servicio
- [ ] Implementar conversión de archivos a base64
- [ ] Implementar modal de ver detalles
- [ ] Implementar modal de editar
- [ ] Implementar modal de anular con motivo
- [ ] Implementar modal de asignar empleado
- [ ] Implementar modal de seguimiento
- [ ] Implementar descarga de archivos ZIP
- [ ] Manejar estados de carga y error
- [ ] Aplicar estilos consistentes
- [ ] Probar con datos reales de la API
- [ ] Optimizar rendimiento (memoización, lazy loading)

### 8.3 Ejemplo de Código Base

```javascript
// services/solicitudes/solicitudesApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-registrack-2.onrender.com';

export const solicitudesApiService = {
  async getAllSolicitudes() {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/api/gestion-solicitudes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    
    // Filtrar solo en proceso
    return data.filter(s => {
      const estadosTerminales = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'];
      return !estadosTerminales.includes(s.estado);
    });
  },
  
  async crearSolicitud(servicioId, datos) {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/api/gestion-solicitudes/crear/${servicioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    return await response.json();
  },
  
  // ... más métodos
};

// screens/solicitudes/SolicitudesListScreen.js
import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { solicitudesApiService } from '../../services/solicitudes/solicitudesApiService';

const SolicitudesListScreen = ({ navigation }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [servicioFiltro, setServicioFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudesApiService.getAllSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y paginar
  const datosFiltrados = solicitudes.filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto || 
      (item.titular?.toLowerCase().includes(texto)) ||
      (item.marca?.toLowerCase().includes(texto)) ||
      (item.email?.toLowerCase().includes(texto)) ||
      (item.expediente?.toLowerCase().includes(texto));
    
    const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
    const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
    
    return coincideTexto && coincideServicio && coincideEstado;
  });

  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  return (
    <View style={styles.container}>
      {/* Búsqueda y filtros */}
      <TextInput
        placeholder="Buscar por expediente, cliente, marca..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.busqueda}
      />
      
      {/* Lista */}
      <FlatList
        data={datosPagina}
        keyExtractor={(item) => item.id_orden_servicio.toString()}
        renderItem={({ item }) => (
          <SolicitudCard 
            solicitud={item} 
            onPress={() => navigation.navigate('SolicitudDetail', { id: item.id_orden_servicio })}
          />
        )}
        refreshing={loading}
        onRefresh={cargarSolicitudes}
      />
      
      {/* Paginación */}
      <Paginacion 
        paginaActual={paginaActual}
        totalPaginas={Math.ceil(datosFiltrados.length / registrosPorPagina)}
        onPageChange={setPaginaActual}
      />
    </View>
  );
};
```

---

## 9. Consideraciones Adicionales

### 9.1 Performance

- **Virtualización**: Usar FlatList para listas grandes
- **Memoización**: Memoizar componentes de tarjetas
- **Lazy Loading**: Cargar detalles solo cuando se necesitan
- **Caché**: Guardar datos en AsyncStorage para carga offline inicial

### 9.2 Manejo de Archivos

- **Tamaño máximo**: 5MB por archivo
- **Formatos permitidos**: PDF, JPG, PNG
- **Conversión**: Base64 con prefijo `data:[mime-type];base64,`
- **Validación**: Verificar tamaño y formato antes de enviar

### 9.3 Validaciones

- **Cliente**: Obligatorio para admin/empleado al crear
- **Campos requeridos**: Dependen del tipo de servicio
- **Motivo de anulación**: Requerido y no vacío
- **Estados**: Verificar que permitan la acción antes de ejecutarla

### 9.4 Estados Terminales

Las solicitudes con estos estados NO aparecen en "en proceso":
- "Finalizada" / "Finalizado"
- "Anulada" / "Anulado"
- "Rechazada" / "Rechazado"

### 9.5 Notificaciones

- **Anulación**: Se envía email automático al cliente
- **Asignación de empleado**: Se puede enviar notificación
- **Cambio de estado**: Se puede enviar notificación

---

## 10. Ejemplos de Payloads Completos

### 10.1 Crear Solicitud - Certificación de Marca

```json
{
  "id_cliente": 5,
  "tipodesolicitante": "Titular",
  "tipodepersona": "Natural",
  "tipodedocumento": "CC",
  "numerodedocumento": "1234567890",
  "nombrecompleto": "Juan Pérez",
  "correoelectronico": "cliente@email.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "nombredelamarca": "Mi Marca",
  "categoria": "Productos",
  "clases": [
    {
      "numero": "25",
      "descripcion": "Ropa"
    }
  ],
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "poderparaelregistrodelamarca": "data:application/pdf;base64,JVBERi0x...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0x..."
}
```

### 10.2 Agregar Seguimiento con Cambio de Estado

```json
{
  "id_orden_servicio": 123,
  "titulo": "Documentos verificados",
  "descripcion": "Se han verificado todos los documentos requeridos. La solicitud pasa al siguiente estado.",
  "observaciones": "El cliente debe estar atento a futuras notificaciones.",
  "nuevo_proceso": "Procesamiento de Pago",
  "documentos_adjuntos": {
    "verificacion_documentos": "data:application/pdf;base64,JVBERi0x..."
  }
}
```

---

**Última actualización**: Enero 2025
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

