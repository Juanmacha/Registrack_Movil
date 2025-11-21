# 📋 Información Requerida del Frontend Web - Gestión de Solicitudes

Este archivo contiene las preguntas específicas que necesitamos responder para implementar correctamente el módulo de Gestión de Solicitudes en la app móvil.

## 🔍 Información Crítica Necesaria

### 1. Estructura Exacta de Respuesta - Listar Solicitudes

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/gestion-solicitudes`?

**Necesitamos saber**:
- ¿La respuesta viene directamente como array o está envuelta en un objeto?
- ¿Qué campos exactos tiene cada solicitud?
- ¿Hay campos anidados (cliente, empleado, servicio) o vienen como IDs?
- ¿Qué formato tienen las fechas?

**Ejemplo de lo que necesitamos**:
```json
// ¿Es así?
[
  {
    "id_orden_servicio": 1,
    "id_cliente": 5,
    "tipo_servicio": "Certificación de Marca",
    "estado": "En proceso",
    // ... más campos
  }
]

// ¿O así?
{
  "success": true,
  "data": [
    {
      "id_orden_servicio": 1,
      // ...
    }
  ]
}
```

**Campos específicos que necesitamos confirmar**:
- `expediente` o `numero_expediente` o `expediente_numero`?
- `titular` o `nombre_completo` o `cliente_nombre`?
- `marca` o `nombre_marca` o `nombredelamarca`?
- `encargado` o `empleado_asignado` o `empleado_nombre`?
- `email` o `correo_electronico` o `correoelectronico`?

### 2. Filtrado de Estados Terminales

**Pregunta**: ¿Cuáles son los nombres EXACTOS (case-sensitive) de los estados que deben excluirse de "solicitudes en proceso"?

**Necesitamos saber**:
- ¿Es "Finalizada" o "Finalizado" o ambos?
- ¿Es "Anulada" o "Anulado" o ambos?
- ¿Hay otros estados terminales además de estos?
- ¿El campo se llama `estado` o `estado_actual` o ambos?

**Lista actual que usamos** (necesitamos confirmar):
- "Finalizada" / "Finalizado"
- "Anulada" / "Anulado"
- "Rechazada" / "Rechazado"

**Ejemplo de código del frontend web**:
```javascript
// ¿Cómo se filtra en el frontend web?
const estadosTerminales = ['Finalizada', 'Anulada', 'Rechazada'];
const enProceso = solicitudes.filter(s => !estadosTerminales.includes(s.estado));
```

### 3. Estructura de Respuesta - Detalle de Solicitud

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/gestion-solicitudes/:id`?

**Necesitamos saber**:
- ¿Viene el cliente completo o solo el ID?
- ¿Viene el empleado asignado completo o solo el ID?
- ¿Cómo vienen los documentos adjuntos?
- ¿Cómo viene el historial de seguimiento?

**Ejemplo de lo que necesitamos**:
```json
{
  "id_orden_servicio": 123,
  "id_cliente": 5,
  "cliente": {
    // ¿Viene el objeto completo?
    "nombre": "Juan Pérez",
    "correo": "juan@email.com"
  },
  "empleado_asignado": {
    // ¿O solo el ID?
    "id_empleado": 3,
    "nombre": "María García"
  },
  "documentos": {
    // ¿Cómo vienen los documentos?
    "logotipo": "data:image/png;base64,...",
    "poder_registro": "data:application/pdf;base64,..."
  }
}
```

### 4. Crear Solicitud - Mapeo de Campos

**Pregunta**: ¿Cuál es el mapeo EXACTO entre los campos del formulario frontend y los campos de la API?

**Necesitamos saber**:
- ¿El campo `nombres` + `apellidos` se envía como `nombrecompleto`?
- ¿El campo `tipoDocumento` se envía como `tipodedocumento`?
- ¿El campo `numeroDocumento` se envía como `numerodedocumento`?
- ¿Hay campos que se transforman antes de enviar?

**Ejemplo de mapeo que necesitamos**:
```javascript
// Formulario frontend → API
{
  nombres: "Juan",
  apellidos: "Pérez",
  // → nombrecompleto: "Juan Pérez"
  
  tipoDocumento: "CC",
  // → tipodedocumento: "CC"
  
  numeroDocumento: "1234567890",
  // → numerodedocumento: "1234567890"
  
  logotipoMarca: File,
  // → logotipo: "data:image/png;base64,..."
}
```

### 5. Validaciones por Tipo de Servicio

**Pregunta**: ¿Cuáles son las validaciones EXACTAS para cada tipo de servicio?

**Necesitamos saber**:
- ¿Qué campos son obligatorios para "Búsqueda de Antecedentes"?
- ¿Qué campos son obligatorios para "Certificación de Marca"?
- ¿Qué campos son obligatorios para "Renovación de Marca"?
- ¿Hay validaciones de formato (email, teléfono, documento)?

**Ejemplo de lo que necesitamos**:
```javascript
// ¿Cuáles son las validaciones exactas?
const validacionesPorServicio = {
  "Búsqueda de Antecedentes": {
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
      "logotipoMarca"
    ],
    opcionales: []
  },
  "Certificación de Marca": {
    requeridos: [
      "tipoSolicitante", // ¿Es obligatorio?
      "tipoPersona",
      // ... más campos
    ]
  }
}
```

### 6. Selector de Cliente

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/gestion-clientes`?

**Necesitamos saber**:
- ¿Qué campos tiene cada cliente?
- ¿Cómo se busca/filtra en el selector?
- ¿Hay paginación?
- ¿Qué campos se muestran en el selector?

**Ejemplo de lo que necesitamos**:
```json
[
  {
    "id_cliente": 5,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@email.com",
    "documento": "1234567890",
    // ¿Qué más campos vienen?
  }
]
```

### 7. Lista de Empleados

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/gestion-empleados`?

**Necesitamos saber**:
- ¿Qué campos tiene cada empleado?
- ¿Cómo se filtra por `estado_empleado === true`?
- ¿Hay paginación?
- ¿Qué campos se muestran en el selector?

**Ejemplo de lo que necesitamos**:
```json
[
  {
    "id_empleado": 3,
    "nombre": "María",
    "apellido": "García",
    "correo": "maria@email.com",
    "estado_empleado": true,
    // ¿Qué más campos vienen?
  }
]
```

### 8. Estados Disponibles

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/gestion-solicitudes/:id/estados-disponibles`?

**Necesitamos saber**:
- ¿Viene solo un array de strings o un objeto con más información?
- ¿Los nombres de estados son exactos (case-sensitive)?
- ¿Hay estados que no se pueden seleccionar en ciertas condiciones?

**Ejemplo de lo que necesitamos**:
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

### 9. Historial de Seguimiento

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/seguimiento/historial/:idOrdenServicio`?

**Necesitamos saber**:
- ¿Viene directamente como array o está envuelta?
- ¿Qué campos tiene cada seguimiento?
- ¿Cómo vienen los documentos adjuntos?
- ¿Cómo se ordenan (más reciente primero o más antiguo primero)?

**Ejemplo de lo que necesitamos**:
```json
[
  {
    "id_seguimiento": 456,
    "titulo": "Cambio de estado",
    "descripcion": "Descripción del seguimiento",
    "fecha": "2024-01-20T15:30:00",
    "usuario": "María García",
    "documentos_adjuntos": {
      // ¿Cómo vienen exactamente?
      "documento1": "data:application/pdf;base64,..."
    }
  }
]
```

### 10. Crear Seguimiento - Formato de Documentos

**Pregunta**: ¿Cuál es el formato EXACTO para enviar documentos adjuntos en `POST /api/seguimiento/crear`?

**Necesitamos saber**:
- ¿El objeto `documentos_adjuntos` debe tener claves específicas o pueden ser cualquier nombre?
- ¿El prefijo `data:` es obligatorio?
- ¿Hay límite de tamaño por archivo o total?
- ¿Qué formatos están permitidos?

**Ejemplo de lo que necesitamos**:
```json
{
  "id_orden_servicio": 123,
  "titulo": "Revisión de documentos",
  "descripcion": "Se han revisado todos los documentos",
  "documentos_adjuntos": {
    // ¿Pueden ser cualquier nombre de clave?
    "acta_revision": "data:application/pdf;base64,...",
    "observaciones": "data:application/pdf;base64,...",
    // ¿O hay nombres específicos requeridos?
  }
}
```

### 11. Descargar Archivos ZIP

**Pregunta**: ¿Cómo se maneja la descarga del ZIP en el frontend web?

**Necesitamos saber**:
- ¿Se descarga directamente o se muestra un modal primero?
- ¿Hay algún nombre específico para el archivo?
- ¿Se maneja algún error específico si no hay archivos?
- ¿Se muestra algún indicador de progreso?

**Ejemplo de código del frontend web**:
```javascript
// ¿Cómo se descarga en el frontend web?
const descargarArchivos = async (idSolicitud) => {
  // ¿Qué código se usa exactamente?
  const response = await fetch(`/api/gestion-solicitudes/${idSolicitud}/descargar-archivos`);
  // ¿Cómo se maneja el blob?
  // ¿Cómo se descarga?
}
```

### 12. Anular Solicitud - Validación de Motivo

**Pregunta**: ¿Hay validaciones específicas para el campo `motivo` al anular?

**Necesitamos saber**:
- ¿Hay longitud mínima o máxima?
- ¿Hay caracteres prohibidos?
- ¿Se puede anular una solicitud ya anulada?
- ¿Qué estados permiten anulación?

**Ejemplo de validación que necesitamos**:
```javascript
// ¿Cuáles son las validaciones exactas?
const validarMotivo = (motivo) => {
  // ¿Longitud mínima?
  if (motivo.trim().length < 10) {
    return "El motivo debe tener al menos 10 caracteres";
  }
  // ¿Longitud máxima?
  if (motivo.length > 500) {
    return "El motivo no puede exceder 500 caracteres";
  }
  // ¿Más validaciones?
}
```

### 13. Editar Solicitud - Campos Editables

**Pregunta**: ¿Qué campos EXACTAMENTE se pueden editar y en qué estados?

**Necesitamos saber**:
- ¿Se pueden editar todos los campos o solo algunos?
- ¿Qué estados permiten edición?
- ¿Hay campos que nunca se pueden editar (como ID, fecha de creación, etc.)?

**Lista de campos editables mencionados** (necesitamos confirmar):
- `pais`, `ciudad`, `codigo_postal`, `total_estimado`
- `tipodepersona`, `tipodedocumento`, `numerodedocumento`
- `nombrecompleto`, `correoelectronico`, `telefono`, `direccion`
- `tipodeentidadrazonsocial`, `nombredelaempresa`, `nit`
- `poderdelrepresentanteautorizado`, `poderparaelregistrodelamarca`

### 14. Búsqueda y Filtros

**Pregunta**: ¿La búsqueda y filtros se hacen en el frontend o en el backend?

**Necesitamos saber**:
- ¿El endpoint `GET /api/gestion-solicitudes` acepta query parameters para búsqueda?
- ¿O se hace búsqueda local en el frontend?
- ¿Hay endpoints específicos para búsqueda como `/api/gestion-solicitudes/buscar`?

**Ejemplo de lo que necesitamos**:
```javascript
// ¿Se hace así?
GET /api/gestion-solicitudes?busqueda=expediente&servicio=1&estado=En proceso

// ¿O así?
GET /api/gestion-solicitudes/buscar?q=expediente

// ¿O se filtra localmente?
const resultados = solicitudes.filter(s => 
  s.expediente.includes(busqueda)
);
```

### 15. Paginación

**Pregunta**: ¿La paginación se hace en el frontend o en el backend?

**Necesitamos saber**:
- ¿El endpoint acepta parámetros de paginación (`page`, `limit`)?
- ¿O se hace paginación local en el frontend?
- ¿Cuántos registros por página se muestran normalmente?

**Ejemplo de lo que necesitamos**:
```javascript
// ¿Se hace así?
GET /api/gestion-solicitudes?page=1&limit=5

// ¿O así?
const registrosPorPagina = 5;
const inicio = (paginaActual - 1) * registrosPorPagina;
const datosPagina = datosFiltrados.slice(inicio, fin);
```

### 16. Manejo de Errores

**Pregunta**: ¿Cuáles son los códigos de error y mensajes EXACTOS que devuelve la API?

**Necesitamos saber**:
- ¿Qué código HTTP se devuelve cuando falta un campo requerido?
- ¿Qué mensaje exacto se devuelve?
- ¿Hay errores específicos para validaciones de archivos?
- ¿Cómo se manejan errores de red?

**Ejemplo de errores que necesitamos**:
```json
// ¿Es así?
{
  "success": false,
  "error": "Campo requerido: id_cliente",
  "code": 400
}

// ¿O así?
{
  "message": "El archivo excede el tamaño máximo de 5MB",
  "status": 400
}
```

### 17. Servicios Disponibles

**Pregunta**: ¿Cuál es la estructura EXACTA de la respuesta del endpoint `GET /api/servicios`?

**Necesitamos saber**:
- ¿Qué campos tiene cada servicio?
- ¿Cómo se obtiene el ID del servicio para crear una solicitud?
- ¿Hay servicios que no se pueden usar para crear solicitudes?

**Ejemplo de lo que necesitamos**:
```json
[
  {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "...",
    // ¿Qué más campos vienen?
  }
]
```

### 18. Formularios Dinámicos por Servicio

**Pregunta**: ¿Hay algún endpoint que devuelva la estructura del formulario por servicio?

**Necesitamos saber**:
- ¿Hay un endpoint como `GET /api/servicios/:id/formulario`?
- ¿O la estructura del formulario está hardcodeada en el frontend?
- ¿Hay campos condicionales (si selecciona "Titular" vs "Representante")?

**Ejemplo de lo que necesitamos**:
```json
{
  "id_servicio": 2,
  "nombre": "Certificación de Marca",
  "campos": [
    {
      "nombre": "tipoSolicitante",
      "tipo": "select",
      "opciones": ["Titular", "Representante Autorizado"],
      "requerido": true
    },
    {
      "nombre": "tipoPersona",
      "tipo": "select",
      "opciones": ["Natural", "Jurídica"],
      "requerido": true,
      "condicional": {
        "campo": "tipoSolicitante",
        "valor": "Titular"
      }
    }
  ]
}
```

## 📝 Instrucciones para Obtener Esta Información

### Opción 1: Desde el Código del Frontend Web

1. Buscar el archivo principal de solicitudes (ej: `ventasServiciosProceso.jsx`)
2. Buscar el servicio API (ej: `solicitudesApiService.js`)
3. Buscar cómo se transforman los datos de la API
4. Buscar las validaciones de formularios
5. Copiar y pegar aquí el código relevante

### Opción 2: Desde la Consola del Navegador

1. Abrir el frontend web en el navegador
2. Iniciar sesión como administrador
3. Ir a la sección de solicitudes
4. Abrir la consola del navegador (F12)
5. Abrir la pestaña Network
6. Realizar acciones (listar, crear, editar, etc.)
7. Ver las respuestas de la API
8. Copiar y pegar aquí las respuestas JSON

### Opción 3: Desde Postman/Thunder Client

1. Obtener un token de autenticación
2. Probar cada endpoint mencionado
3. Documentar las respuestas exactas
4. Documentar los errores posibles

## 🎯 Información que Necesitamos Urgentemente

**Por favor, proporciona**:

1. ✅ **Respuesta completa de `GET /api/gestion-solicitudes`** (JSON completo)
2. ✅ **Respuesta completa de `GET /api/gestion-solicitudes/:id`** (JSON completo)
3. ✅ **Respuesta completa de `GET /api/gestion-clientes`** (JSON completo)
4. ✅ **Respuesta completa de `GET /api/gestion-empleados`** (JSON completo)
5. ✅ **Respuesta completa de `GET /api/servicios`** (JSON completo)
6. ✅ **Ejemplo completo de payload para crear solicitud** (JSON completo)
7. ✅ **Código de validaciones por tipo de servicio** (del frontend web)
8. ✅ **Código de transformación de datos** (del frontend web)
9. ✅ **Lista exacta de estados terminales** (nombres case-sensitive)
10. ✅ **Mapeo exacto de campos formulario → API**
11. ✅ **Estructura exacta de documentos adjuntos**
12. ✅ **Código de manejo de descarga de ZIP** (del frontend web)

## 🔧 Debug Temporal

Mientras tanto, implementaremos con la información disponible y agregaremos logs de depuración para ver qué está recibiendo realmente la app móvil. Revisa la consola cuando uses la funcionalidad para ver:

- Las respuestas completas de la API
- Los datos transformados
- Los errores que ocurren
- Los campos que faltan o están mal mapeados

---

## 📋 Checklist de Información Pendiente

- [ ] Estructura de respuesta - Listar solicitudes
- [ ] Nombres exactos de estados terminales
- [ ] Estructura de respuesta - Detalle de solicitud
- [ ] Mapeo de campos formulario → API
- [ ] Validaciones por tipo de servicio
- [ ] Estructura de respuesta - Clientes
- [ ] Estructura de respuesta - Empleados
- [ ] Estructura de respuesta - Estados disponibles
- [ ] Estructura de respuesta - Historial de seguimiento
- [ ] Formato de documentos adjuntos
- [ ] Manejo de descarga ZIP
- [ ] Validaciones de motivo de anulación
- [ ] Campos editables y estados permitidos
- [ ] Búsqueda y filtros (frontend vs backend)
- [ ] Paginación (frontend vs backend)
- [ ] Códigos y mensajes de error
- [ ] Estructura de respuesta - Servicios
- [ ] Formularios dinámicos (endpoint o hardcodeado)

---

**Una vez tengas esta información, actualiza este archivo o compártela para que podamos implementar el módulo de solicitudes correctamente en la app móvil.**

