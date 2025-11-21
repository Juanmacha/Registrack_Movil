# ✅ RESPUESTAS COMPLETAS - Información de Solicitudes

Este archivo contiene todas las respuestas basadas en el análisis del código del frontend web.

---

## 1. Estructura de Respuesta - Listar Solicitudes ✅

**Respuesta**: Array directo (NO envuelto en objeto)

**Estructura API**:
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
    "servicio": { "id": 2, "nombre": "Certificación de Marca" },
    "empleado_asignado": { "id_empleado": 3, "nombres": "María", "apellidos": "García" },
    "cliente": { "id_cliente": 5, "nombre": "Juan", "apellido": "Pérez" },
    "fecha_solicitud": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-20T14:20:00"
  }
]
```

**Transformación Frontend** (`transformarRespuestaDelAPI`):
```javascript
{
  id: "1",
  expediente: "EXP-001" || `EXP-${id}`,
  titular: "Juan Pérez",  // De múltiples fuentes posibles
  marca: "Mi Marca",  // De múltiples fuentes posibles
  tipoSolicitud: "Certificación de Marca",
  encargado: "María García" || "Sin asignar",
  estado: "En proceso",
  email: "cliente@email.com",
  telefono: "3001234567",
  fechaCreacion: "2024-01-15T10:30:00",
  fechaSolicitud: "2024-01-20T14:20:00",
  id_cliente: 5,
  id_empleado_asignado: 3,
  clienteCompleto: { ... },  // Objeto completo si está disponible
  empleadoCompleto: { ... },  // Objeto completo si está disponible
  servicioCompleto: { ... }  // Objeto completo si está disponible
}
```

---

## 2. Estados Terminales ✅

**Código exacto** (`tablaVentasProceso.jsx` línea 80):
```javascript
const estadosTerminales = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'];
const esEnProceso = !estadosTerminales.includes(v.estado);
```

**Confirmación**:
- ✅ Backend puede usar femenino o masculino
- ✅ Campo: `estado` (mapeado con `mapearEstadoAPIaFrontend()`)
- ✅ Solo estos 6 estados se excluyen

---

## 3. Detalle de Solicitud ✅

**Estructura API** (`GET /api/gestion-solicitudes/:id`):
- ✅ Cliente: Puede venir como objeto completo en `cliente` o solo `id_cliente`
- ✅ Empleado: Puede venir como objeto completo en `empleado_asignado` o solo `id_empleado_asignado`
- ✅ Servicio: Puede venir como objeto completo en `servicio` o solo `id_servicio`
- ✅ Documentos: NO vienen en el detalle (se descargan por endpoint separado)
- ✅ Historial: NO viene en el detalle (se obtiene con `GET /api/seguimiento/historial/:id`)

**Transformación**:
```javascript
{
  clienteCompleto: respuestaAPI.cliente || null,
  empleadoCompleto: respuestaAPI.empleado_asignado || respuestaAPI.empleado || null,
  servicioCompleto: respuestaAPI.servicio || null
}
```

---

## 4. Mapeo de Campos - Crear Solicitud ✅

**Función**: `transformarDatosParaAPI()` en `solicitudesApiService.js`

**Mapeo Frontend → API**:

### Búsqueda de Antecedentes:
```javascript
// Frontend → API
{
  nombres + apellidos → nombres_apellidos: "Juan Pérez",
  tipoDocumento → tipo_documento: "CC",
  numeroDocumento → numero_documento: "1234567890",
  email → correo: "cliente@email.com",
  telefono → telefono: "3001234567",
  direccion → direccion: "Calle 123",
  pais → pais: "Colombia",
  nombreMarca → nombre_a_buscar: "Mi Marca",
  tipoProductoServicio → tipo_producto_servicio: "Productos",
  logotipoMarca (File) → logotipo: "data:image/png;base64,..."
}
```

### Certificación de Marca:
```javascript
{
  tipoSolicitante → tipo_solicitante: "Natural" | "Jurídica",
  nombres + apellidos → nombres_apellidos: "Juan Pérez",
  tipoDocumento → tipo_documento: "CC",
  numeroDocumento → numero_documento: "1234567890",
  email → correo: "cliente@email.com",
  nombreMarca → nombre_marca: "Mi Marca",
  tipoProductoServicio → tipo_producto_servicio: "Productos",
  logotipoMarca (File) → logotipo: "data:image/png;base64,...",
  poderAutorizacion (File) → poder_autorizacion: "data:application/pdf;base64,...",
  certificadoCamara (File) → certificado_camara_comercio: "data:application/pdf;base64,..."  // Solo si Jurídica
}
```

**IMPORTANTE**: 
- Archivos se convierten a base64 con prefijo `data:[mime-type];base64,`
- `nombres` + `apellidos` se concatenan como `nombres_apellidos`
- Campos en snake_case (no camelCase)

---

## 5. Validaciones por Tipo de Servicio ✅

**Código exacto** (`CrearSolicitudAdmin.jsx` líneas 242-361):

### Búsqueda de Antecedentes:
```javascript
const validaciones = {
  requeridos: [
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
  ]
};
```

### Otros Servicios (Certificación, Renovación, etc.):
```javascript
const validaciones = {
  requeridos: [
    "tipoSolicitante",  // ✅ OBLIGATORIO
    "email",
    "nombreMarca"
  ],
  condicionales: {
    "Titular": {
      "Natural": ["tipoDocumento", "numeroDocumento", "nombres", "apellidos"],
      "Jurídica": ["nombreEmpresa", "nit"]
    },
    "Representante Autorizado": ["tipoDocumento", "numeroDocumento", "nombres", "apellidos"]
  }
};
```

**Validaciones de formato**:
- ✅ Email: Validación básica (no vacío)
- ✅ Teléfono: Validación básica (no vacío)
- ✅ Archivos: Máx 5MB, formatos: PDF, JPG, PNG

---

## 6. Selector de Cliente ✅

**Endpoint**: `GET /api/gestion-clientes`

**Estructura respuesta**:
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

**Búsqueda**: Se hace localmente en el frontend (filtrado por nombre, email, documento)

**Paginación**: NO hay paginación en el endpoint (se cargan todos)

---

## 7. Lista de Empleados ✅

**Endpoint**: `GET /api/gestion-empleados`

**Estructura respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id_empleado": 3,
      "nombres": "María",
      "apellidos": "García",
      "correo": "maria@email.com",
      "estado_empleado": true,  // 1 o true
      "telefono": "3001234567"
    }
  ]
}
```

**Filtrado** (`tablaVentasProceso.jsx` línea 268):
```javascript
const empleadosActivos = resultado.data.filter(e => 
  e.estado_empleado === true || e.estado_empleado === 1
);
```

**Paginación**: NO hay paginación

---

## 8. Estados Disponibles ✅

**Endpoint**: `GET /api/gestion-solicitudes/:id/estados-disponibles`

**Estructura respuesta** (según código de `seguimiento.jsx`):
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

**O puede venir como array directo**:
```json
[
  "Verificación de Documentos",
  "Procesamiento de Pago",
  "Consulta en BD"
]
```

**Case-sensitive**: ✅ Sí, los nombres son exactos

---

## 9. Historial de Seguimiento ✅

**Endpoint**: `GET /api/seguimiento/historial/:idOrdenServicio`

**Estructura respuesta**:
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
      "nombre_archivo": "data:application/pdf;base64,..."
    }
  }
]
```

**Orden**: No especificado en el código (probablemente más reciente primero)

---

## 10. Crear Seguimiento - Formato de Documentos ✅

**Endpoint**: `POST /api/seguimiento/crear`

**Formato exacto** (`seguimiento.jsx` líneas 127-144):
```javascript
{
  id_orden_servicio: 123,
  titulo: "Cambio de estado",  // Requerido, máx 200 caracteres
  descripcion: "Descripción",  // Requerido
  observaciones: "Observaciones",  // Opcional
  nuevo_proceso: "Verificación de Documentos",  // Opcional (nombre exacto del estado)
  documentos_adjuntos: {  // Opcional, objeto JSON
    "nombre_archivo_sin_extension": "data:application/pdf;base64,..."
  }
}
```

**Confirmaciones**:
- ✅ Claves pueden ser cualquier nombre (sin extensión)
- ✅ Prefijo `data:` es OBLIGATORIO
- ✅ Límite: 5MB por archivo
- ✅ Formatos: PDF, JPG, PNG

**Código de conversión**:
```javascript
const nombreArchivo = documentosAdjuntos.name.replace(/\.[^/.]+$/, ""); // Remover extensión
datos.documentos_adjuntos = {
  [nombreArchivo]: archivoBase64  // Formato: {"nombre_archivo": "data:application/pdf;base64,..."}
};
```

---

## 11. Descargar Archivos ZIP ✅

**Endpoint**: `GET /api/gestion-solicitudes/:id/descargar-archivos`

**Código exacto** (`archivosApiService.js` líneas 104-170):
```javascript
async downloadArchivosSolicitudZip(idOrdenServicio, token) {
  const response = await fetch(
    `${this.baseURL}/api/gestion-solicitudes/${idOrdenServicio}/descargar-archivos`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  // Obtener nombre del archivo desde headers
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `Archivos_Solicitud_${idOrdenServicio}.zip`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '').trim();
      filename = decodeURIComponent(filename);
    }
  }
  
  // Descargar el blob
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  return { success: true, filename, size: blob.size };
}
```

**Confirmaciones**:
- ✅ Se descarga directamente (no hay modal previo)
- ✅ Nombre: `Archivos_Solicitud_{id}.zip` o desde header `Content-Disposition`
- ✅ Content-Type: `application/zip` o `application/octet-stream`
- ✅ Manejo de errores: 404 (no hay archivos), 403/401 (sin permisos)

---

## 12. Anular Solicitud - Validación de Motivo ✅

**Código exacto** (`tablaVentasProceso.jsx` líneas 580-667):
```javascript
const handleAnular = async () => {
  // Validación: motivo no puede estar vacío
  if (!motivoAnular.trim()) {
    AlertService.error('Motivo requerido', 'Debes proporcionar un motivo');
    return;
  }
  
  // Llamar a API
  await solicitudesApiService.anularSolicitud(
    datoSeleccionado.id, 
    motivoAnular.trim(), 
    token
  );
};
```

**Validaciones**:
- ✅ Longitud mínima: NO (solo no vacío)
- ✅ Longitud máxima: NO especificada
- ✅ Caracteres prohibidos: NO
- ✅ Solicitud ya anulada: Backend devuelve error 409, frontend detecta y muestra mensaje informativo

**Estados que permiten anulación**: Cualquier estado excepto ya anulada/finalizada

---

## 13. Editar Solicitud - Campos Editables ✅

**Endpoint**: `PUT /api/gestion-solicitudes/editar/:id`

**Campos editables** (`tablaVentasProceso.jsx` líneas 300-318):
```javascript
const datosAPI = {
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
};
```

**Estados que permiten edición**: Cualquier estado excepto "Finalizada", "Anulada", "Rechazada"

**Campos NO editables**: `id`, `id_cliente`, `id_servicio`, `fecha_creacion`, `estado` (se cambia por seguimiento)

---

## 14. Búsqueda y Filtros ✅

**Respuesta**: Se hace **localmente en el frontend**

**Código exacto** (`tablaVentasProceso.jsx` líneas 100-116):
```javascript
// Búsqueda local
const texto = busqueda.trim().toLowerCase();
const datosFiltrados = ventasEnProceso.filter(item => {
  const coincideServicio = servicioFiltro === 'Todos' || item.tipoSolicitud === servicioFiltro;
  const coincideEstado = estadoFiltro === 'Todos' || item.estado === estadoFiltro;
  const coincideTexto =
    !texto ||
    (item.titular && item.titular.toLowerCase().includes(texto)) ||
    (item.marca && item.marca.toLowerCase().includes(texto)) ||
    (item.email && item.email.toLowerCase().includes(texto)) ||
    (item.numeroDocumento && item.numeroDocumento.toString().toLowerCase().includes(texto)) ||
    (item.documento && item.documento.toString().toLowerCase().includes(texto)) ||
    (item.tipoDocumento && item.tipoDocumento.toLowerCase().includes(texto)) ||
    (item.encargado && item.encargado.toLowerCase().includes(texto)) ||
    (item.expediente && item.expediente.toLowerCase().includes(texto));
  return coincideServicio && coincideEstado && coincideTexto;
});
```

**NOTA**: Existe endpoint `GET /api/gestion-solicitudes/buscar?search=termino` pero NO se usa en el frontend web

---

## 15. Paginación ✅

**Respuesta**: Se hace **localmente en el frontend**

**Código exacto** (`tablaVentasProceso.jsx` líneas 118-122):
```javascript
const registrosPorPagina = 5;
const total = datosFiltrados.length;
const inicio = (paginaActual - 1) * registrosPorPagina;
const fin = inicio + registrosPorPagina;
const datosPagina = datosFiltrados.slice(inicio, fin);
```

**Confirmaciones**:
- ✅ NO hay parámetros de paginación en el endpoint
- ✅ 5 registros por página
- ✅ Paginación manual con `slice()`

---

## 16. Manejo de Errores ✅

**Códigos HTTP**:
- `400`: Bad Request (campos faltantes, validaciones)
- `401`: Unauthorized (token inválido/expirado)
- `403`: Forbidden (sin permisos)
- `404`: Not Found (recurso no existe)
- `409`: Conflict (solicitud ya anulada)
- `500`: Internal Server Error

**Formato de errores**:
```json
{
  "message": "Campo requerido: id_cliente",
  "error": "Validation error",
  "status": 400
}
```

**O**:
```json
{
  "success": false,
  "mensaje": "El archivo excede el tamaño máximo de 5MB",
  "error": "File too large"
}
```

**Manejo en frontend**: Se extrae `error.message` o `error.response.data.mensaje` o `error.response.data.message`

---

## 17. Servicios Disponibles ✅

**Endpoint**: `GET /api/servicios`

**Estructura respuesta** (probable):
```json
[
  {
    "id": 1,
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "Búsqueda de antecedentes de marca",
    "precio": 50000,
    "activo": true
  }
]
```

**Uso para crear solicitud**:
1. Obtener lista: `GET /api/servicios`
2. Buscar servicio por nombre (normalizar para comparación)
3. Obtener `id` o `id_servicio`
4. Llamar a `POST /api/gestion-solicitudes/crear/{servicioId}`

**Código** (`CrearSolicitudAdmin.jsx` líneas 470-491):
```javascript
const servicios = await serviciosApiService.getServicios();
const normalizarNombre = (nombre) => nombre.toLowerCase().trim();
const servicioEncontrado = servicios.find(s => {
  const nombreServicio = s.nombre || s.nombre_servicio || '';
  return normalizarNombre(nombreServicio) === normalizarNombre(servicioAPI) ||
         normalizarNombre(nombreServicio) === normalizarNombre(tipoSolicitud);
});
const servicioId = parseInt(servicioEncontrado.id || servicioEncontrado.id_servicio);
```

---

## 18. Formularios Dinámicos por Servicio ✅

**Respuesta**: La estructura está **hardcodeada en el frontend**

**Código** (`CrearSolicitudAdmin.jsx` líneas 32-40):
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

**Campos condicionales**: Sí, se manejan en cada formulario:
- Si `tipoSolicitante === "Titular"` → mostrar `tipoPersona`
- Si `tipoPersona === "Natural"` → mostrar campos de persona natural
- Si `tipoPersona === "Jurídica"` → mostrar campos de empresa

**NO hay endpoint** para obtener estructura del formulario

---

## 📋 Resumen de Endpoints

| Endpoint | Método | Respuesta | Notas |
|----------|--------|-----------|-------|
| `/api/gestion-solicitudes` | GET | Array directo | Todas las solicitudes |
| `/api/gestion-solicitudes/:id` | GET | Objeto | Detalle completo |
| `/api/gestion-solicitudes/crear/:servicioId` | POST | Objeto | Requiere `id_cliente` para admin |
| `/api/gestion-solicitudes/editar/:id` | PUT | Objeto | Solo campos editables |
| `/api/gestion-solicitudes/anular/:id` | PUT | Objeto | Body: `{ motivo: "string" }` |
| `/api/gestion-solicitudes/asignar-empleado/:id` | PUT | Objeto | Body: `{ id_empleado: number }` |
| `/api/gestion-solicitudes/:id/estados-disponibles` | GET | Objeto con `data` | Estados disponibles |
| `/api/gestion-solicitudes/:id/descargar-archivos` | GET | Blob (ZIP) | Descarga directa |
| `/api/gestion-clientes` | GET | Array directo | Todos los clientes |
| `/api/gestion-empleados` | GET | Objeto con `data` | Filtrar `estado_empleado === true` |
| `/api/servicios` | GET | Array directo | Todos los servicios |
| `/api/seguimiento/crear` | POST | Objeto | Body con `documentos_adjuntos` opcional |
| `/api/seguimiento/historial/:id` | GET | Array directo | Historial completo |

---

**Última actualización**: Enero 2025
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

