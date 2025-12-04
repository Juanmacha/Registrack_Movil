  # 📋 Payloads Completos por Tipo de Servicio - Crear Solicitud como Administrador

Este documento contiene la estructura completa de payloads, validaciones y campos para cada tipo de servicio al crear una solicitud como administrador.

---

## 🔄 Mapeo de Nombres de Servicios

| Frontend | API | Notas |
|----------|-----|-------|
| `'Búsqueda de Antecedentes'` | `'Búsqueda de antecedentes'` | Minúsculas en API |
| `'Certificación de Marca'` | `'Certificación de marca'` | Minúsculas en API |
| `'Renovación de Marca'` | `'Renovación de marca'` | Minúsculas en API |
| `'Presentación de Oposición'` | `'Presentación de oposición'` | Minúsculas en API |
| `'Cesión de Marca'` | `'Cesión de marca'` | Minúsculas en API |
| `'Ampliación de Alcance'` | `'Ampliación de alcance'` | Minúsculas en API |
| `'Respuesta a Oposición'` | `'Respuesta a oposición'` | Minúsculas en API |

**IMPORTANTE**: El endpoint usa el **ID numérico del servicio**, no el nombre. Se debe:
1. Obtener lista: `GET /api/servicios`
2. Buscar servicio por nombre (normalizar para comparación)
3. Extraer `id` o `id_servicio`
4. Llamar: `POST /api/gestion-solicitudes/crear/:servicioId`

---

## 1. RENOVACIÓN DE MARCA

### 📤 Estructura del Payload (Frontend → API)

#### Campos Obligatorios Base:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO (del selector de cliente)
  tipo_solicitante: string,        // "Natural" | "Jurídica"
  nombres_apellidos: string,       // Concatenación: `${nombres} ${apellidos}`
  tipo_documento: string,          // "Cédula de Ciudadanía", "Cédula de Extranjería", etc.
  numero_documento: string,         // Número de documento
  direccion: string,                // Dirección completa
  telefono: string,                 // Teléfono de contacto
  correo: string,                   // Correo electrónico
  pais: string,                    // País (default: "Colombia")
  nombre_marca: string,            // Nombre de la marca
  numero_expediente_marca: string,  // Número de expediente (ej: "2020-123456")
  certificado_renovacion: string,  // Base64: "data:application/pdf;base64,..."
  logotipo: string,                // Base64: "data:image/png;base64,..." (solo JPG/PNG)
  poder_autorizacion: string        // Base64: "data:application/pdf;base64,..."
}
```

#### Campos Condicionales (si `tipo_solicitante === "Jurídica"`):
```javascript
{
  tipo_entidad: string,            // "Sociedad por Acciones Simplificada", etc.
  razon_social: string,            // Razón social de la empresa
  nit_empresa: number,             // NIT (10 dígitos, sin guión)
  representante_legal: string      // Nombre del representante legal
}
```

#### Campos Opcionales:
```javascript
{
  ciudad: string,                  // Ciudad (default: "Bogotá")
  clase_niza: string              // Clases de Niza separadas por comas (ej: "25, 28, 35")
}
```

### ✅ Validaciones Frontend

#### Validaciones Generales:
- `tipoSolicitante`: Debe ser exactamente `"Natural"` o `"Jurídica"`
- `nombres`: Solo letras, 2-50 caracteres (regex: `/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/`)
- `apellidos`: Solo letras, 2-50 caracteres
- `tipoDocumento`: Requerido (select)
- `numeroDocumento`: 
  - Pasaporte: 6-20 caracteres alfanuméricos
  - NIT: 9-15 dígitos
  - Otros: 6-20 dígitos
- `direccion`: 5-500 caracteres (letras, números, espacios, ., #, -)
- `telefono`: 7-20 dígitos
- `email`: Formato válido (regex: `/^\S+@\S+\.\S+$/`)
- `pais`: Requerido
- `codigoPostal`: Opcional, 4-10 dígitos si se proporciona

#### Validaciones Específicas de Marca:
- `nombreMarca`: 2-100 caracteres (letras, números, espacios, ., &, -)
- `numeroExpedienteMarca`: 3-30 caracteres (letras, números, guiones) - **REQUERIDO**

#### Validaciones para Jurídica:
- `tipoEntidad`: Requerido (select)
- `razonSocial`: 2-100 caracteres (letras, números, espacios, ., &, -)
- `nit`: Exactamente 10 dígitos, entre 1000000000 y 9999999999
- `representanteLegal`: 3-100 caracteres (solo letras)

#### Validaciones de Archivos:
- `certificadoRenovacion`: 
  - Requerido
  - Máx 5MB
  - Formatos: PDF, JPG, PNG
- `logotipoMarca`:
  - Requerido
  - Máx 5MB
  - Formatos: Solo JPG, PNG (NO PDF)
- `poderAutorizacion`:
  - Requerido
  - Máx 5MB
  - Formatos: PDF, JPG, PNG

### 📝 Ejemplo de Payload Completo

**Persona Natural**:
```json
{
  "id_cliente": 5,
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "2020-123456",
  "clase_niza": "25, 28",
  "certificado_renovacion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

**Persona Jurídica**:
```json
{
  "id_cliente": 5,
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 50 #100-20",
  "telefono": "3009876543",
  "correo": "maria@empresa.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "María García López",
  "nombre_marca": "Mi Marca Empresarial",
  "numero_expediente_marca": "2019-789012",
  "certificado_renovacion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## 2. CESIÓN DE MARCA

### 📤 Estructura del Payload (Frontend → API)

#### Campos Obligatorios del Cedente (quien cede):
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  tipo_solicitante: string,        // "Natural" | "Jurídica"
  nombres_apellidos: string,       // `${nombres} ${apellidos}`
  tipo_documento: string,
  numero_documento: string,
  direccion: string,
  telefono: string,
  correo: string,
  pais: string,
  nombre_marca: string,
  numero_expediente_marca: string, // ✅ REQUERIDO
  documento_cesion: string,        // Base64: "data:application/pdf;base64,..."
  poder_autorizacion: string       // Base64: "data:application/pdf;base64,..."
}
```

#### Campos Obligatorios del Cesionario (quien recibe):
```javascript
{
  nombre_razon_social_cesionario: string,  // ✅ REQUERIDO
  nit_cesionario: string,                  // ✅ REQUERIDO (9-15 dígitos)
  representante_legal_cesionario: string,  // ✅ REQUERIDO
  tipo_documento_cesionario: string,       // ✅ REQUERIDO
  numero_documento_cesionario: string,     // ✅ REQUERIDO
  correo_cesionario: string,               // ✅ REQUERIDO
  telefono_cesionario: string,             // ✅ REQUERIDO
  direccion_cesionario: string             // ✅ REQUERIDO
}
```

#### Campos Condicionales (si cedente es Jurídica):
```javascript
{
  tipo_entidad: string,
  razon_social: string,
  nit_empresa: number,
  representante_legal: string
}
```

#### Campos Opcionales:
```javascript
{
  ciudad: string
}
```

### ✅ Validaciones Frontend

#### Validaciones del Cedente:
- Mismas validaciones que Renovación de Marca para datos personales
- `numeroExpedienteMarca`: 3-30 caracteres (letras, números, guiones) - **REQUERIDO**

#### Validaciones del Cesionario:
- `nombreRazonSocialCesionario`: 2-100 caracteres (letras, números, espacios, ., &, -)
- `nitCesionario`: 9-15 dígitos
- `representanteLegalCesionario`: 3-100 caracteres (solo letras)
- `tipoDocumentoCesionario`: Requerido (select)
- `numeroDocumentoCesionario`: 
  - Pasaporte: 6-20 caracteres alfanuméricos
  - NIT: 9-15 dígitos
  - Otros: 6-20 dígitos
- `correoCesionario`: Formato válido de email
- `telefonoCesionario`: 7-20 dígitos
- `direccionCesionario`: 5-500 caracteres

#### Validaciones de Archivos:
- `documentoCesion`: Requerido, máx 5MB, PDF/JPG/PNG
- `poderAutorizacion`: Requerido, máx 5MB, PDF/JPG/PNG

### 📝 Ejemplo de Payload Completo

```json
{
  "id_cliente": 5,
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "2019-789012",
  "documento_cesion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "nombre_razon_social_cesionario": "Empresa Cesionaria S.A.S.",
  "nit_cesionario": "9009876543",
  "representante_legal_cesionario": "Carlos Rodríguez",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9876543210",
  "correo_cesionario": "carlos@cesionaria.com",
  "telefono_cesionario": "3009876543",
  "direccion_cesionario": "Carrera 50 #100-20"
}
```

---

## 3. PRESENTACIÓN DE OPOSICIÓN

### 📤 Estructura del Payload (Frontend → API)

#### Campos Obligatorios:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  tipo_solicitante: string,        // "Natural" | "Jurídica"
  nombres_apellidos: string,       // `${nombres} ${apellidos}`
  tipo_documento: string,
  numero_documento: string,
  direccion: string,
  telefono: string,
  correo: string,
  pais: string,
  nit_empresa: number,             // ✅ SIEMPRE REQUERIDO (incluso para Natural)
  nombre_marca: string,            // Nombre de la marca del opositor
  marca_a_oponerse: string,        // Nombre de la marca a la que se opone
  argumentos_respuesta: string,    // Argumentos legales (mínimo 10 caracteres)
  documentos_oposicion: string,    // Base64: "data:application/pdf;base64,..."
  poder_autorizacion: string       // Base64: "data:application/pdf;base64,..."
}
```

#### Campos Condicionales (si `tipo_solicitante === "Jurídica"`):
```javascript
{
  tipo_entidad: string,
  razon_social: string,
  representante_legal: string
}
```

#### Campos Opcionales:
```javascript
{
  ciudad: string
}
```

### ⚠️ IMPORTANTE: ¿Por qué NIT es siempre requerido?

**Razón**: En el proceso de oposición, se requiere identificar la empresa o entidad que presenta la oposición, incluso si el solicitante es persona natural. Esto es un requisito legal para el proceso de oposición ante la SIC.

### ✅ Validaciones Frontend

#### Validaciones Específicas:
- `nit`: **SIEMPRE requerido**, exactamente 10 dígitos, entre 1000000000 y 9999999999
- `nombreMarca`: 2-100 caracteres (letras, números, espacios, ., &, -)
- `marcaAOponerse`: 2-100 caracteres (letras, números, espacios, ., &, -)
- `argumentosRespuesta`: Mínimo 10 caracteres (texto libre)

#### Validaciones de Archivos:
- `documentosOposicion`: Requerido, máx 5MB, PDF/JPG/PNG
- `poderAutorizacion`: Requerido, máx 5MB, PDF/JPG/PNG

### 📝 Ejemplo de Payload Completo

**Persona Natural**:
```json
{
  "id_cliente": 5,
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "nit_empresa": 9001234567,
  "nombre_marca": "Mi Marca Original",
  "marca_a_oponerse": "Marca Similar",
  "argumentos_respuesta": "La marca a la que me opongo es similar a mi marca registrada y puede causar confusión en el mercado. Mi marca tiene registro desde 2018 y la marca opositora es idéntica en diseño y nombre.",
  "documentos_oposicion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

**Persona Jurídica**:
```json
{
  "id_cliente": 5,
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 50 #100-20",
  "telefono": "3009876543",
  "correo": "maria@empresa.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "nit_empresa": 9001234567,
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "representante_legal": "María García López",
  "nombre_marca": "Mi Marca Empresarial",
  "marca_a_oponerse": "Marca Competidora",
  "argumentos_respuesta": "La marca a la que nos oponemos es similar a nuestra marca registrada y puede causar confusión en el mercado. Nuestra marca tiene registro desde 2018 y la marca opositora es idéntica en diseño y nombre.",
  "documentos_oposicion": "data:application/pdf;base64,JVBERi0xLjQK...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## 4. RESPUESTA A OPOSICIÓN

### 📤 Estructura del Payload (Frontend → API)

#### Campos Obligatorios:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  nombres_apellidos: string,        // `${nombres} ${apellidos}`
  tipo_documento: string,
  numero_documento: string,
  direccion: string,
  telefono: string,
  correo: string,
  pais: string,
  razon_social: string,            // ✅ SIEMPRE REQUERIDO
  nit_empresa: number,             // ✅ SIEMPRE REQUERIDO
  representante_legal: string,     // ✅ SIEMPRE REQUERIDO
  nombre_marca: string,
  numero_expediente_marca: string, // ✅ REQUERIDO
  marca_opositora: string,         // Nombre de la marca que presentó la oposición
  poder_autorizacion: string       // Base64: "data:application/pdf;base64,..."
}
```

#### Campos Opcionales:
```javascript
{
  ciudad: string
}
```

### ⚠️ NOTA IMPORTANTE:
Este servicio **NO tiene** campo `tipo_solicitante`. Siempre requiere información de empresa (`razon_social`, `nit_empresa`, `representante_legal`).

### ✅ Validaciones Frontend

#### Validaciones Específicas:
- `razonSocial`: 2-100 caracteres (letras, números, espacios, ., &, -) - **SIEMPRE REQUERIDO**
- `nit`: Exactamente 10 dígitos, entre 1000000000 y 9999999999 - **SIEMPRE REQUERIDO**
- `representanteLegal`: 3-100 caracteres (solo letras) - **SIEMPRE REQUERIDO**
- `nombreMarca`: 2-100 caracteres
- `numeroExpedienteMarca`: 3-30 caracteres (letras, números, guiones) - **REQUERIDO**
- `marcaOpositora`: 2-100 caracteres

#### Validaciones de Archivos:
- `poderAutorizacion`: Requerido, máx 5MB, PDF/JPG/PNG

### 📝 Ejemplo de Payload Completo

```json
{
  "id_cliente": 5,
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Juan Pérez López",
  "nombre_marca": "Mi Marca",
  "numero_expediente_marca": "2021-345678",
  "marca_opositora": "Marca que Presentó Oposición",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## 5. AMPLIACIÓN DE ALCANCE

### 📤 Estructura del Payload (Frontend → API)

#### Campos Obligatorios:
```javascript
{
  id_cliente: number,              // ✅ OBLIGATORIO
  documento_nit_titular: string,    // Documento o NIT del titular (6-20 dígitos)
  direccion: string,
  ciudad: string,                  // Default: "Bogotá"
  pais: string,                    // Default: "Colombia"
  correo: string,
  telefono: string,
  numero_registro_existente: string, // Número de registro de la marca existente
  nombre_marca: string,
  clase_niza_actual: string,       // Clase Niza actual (1-3 dígitos)
  nuevas_clases_niza: string,      // Nuevas clases separadas por comas (ej: "28, 35")
  descripcion_nuevos_productos_servicios: string, // Descripción (mínimo 10 caracteres)
  soportes: string                 // Base64: "data:application/pdf;base64,..."
}
```

#### Campos Opcionales:
```javascript
{
  codigo_postal: string
}
```

### ✅ Validaciones Frontend

#### Validaciones Específicas:
- `documentoNitTitular`: 6-20 dígitos
- `direccion`: 5-500 caracteres
- `ciudad`: 2-100 caracteres (solo letras) - **REQUERIDO**
- `pais`: Requerido
- `email`: Formato válido
- `telefono`: 7-20 dígitos
- `numeroRegistroExistente`: 3-30 caracteres (letras, números, guiones)
- `nombreMarca`: 2-100 caracteres
- `claseNizaActual`: 1-3 dígitos (ej: "25")
- `nuevasClasesNiza`: Formato válido (ej: "28, 35" o "28,35") - solo números, comas y espacios
- `descripcionNuevosProductosServicios`: Mínimo 10 caracteres

#### Validaciones de Archivos:
- `soportes`: Requerido, máx 5MB, PDF/JPG/PNG

### 📝 Ejemplo de Payload Completo

```json
{
  "id_cliente": 5,
  "documento_nit_titular": "1234567890",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "correo": "juan@email.com",
  "telefono": "3001234567",
  "numero_registro_existente": "2020-567890",
  "nombre_marca": "Mi Marca",
  "clase_niza_actual": "25",
  "nuevas_clases_niza": "28, 35",
  "descripcion_nuevos_productos_servicios": "Ampliación de la marca para incluir nuevos productos en las clases 28 (Juegos y juguetes) y 35 (Servicios de publicidad y gestión comercial).",
  "soportes": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

---

## 📊 Tabla Resumen de Campos por Servicio

| Campo | Renovación | Cesión | Oposición | Respuesta Oposición | Ampliación |
|-------|-----------|--------|-----------|---------------------|------------|
| `id_cliente` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tipo_solicitante` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `nombres_apellidos` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `tipo_documento` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `numero_documento` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `direccion` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `telefono` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `correo` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `pais` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ciudad` | ⚪ | ⚪ | ⚪ | ⚪ | ✅ |
| `nombre_marca` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `numero_expediente_marca` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `numero_registro_existente` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `nit_empresa` | ⚠️ (Jurídica) | ⚠️ (Jurídica) | ✅ (Siempre) | ✅ (Siempre) | ❌ |
| `razon_social` | ⚠️ (Jurídica) | ⚠️ (Jurídica) | ⚠️ (Jurídica) | ✅ (Siempre) | ❌ |
| `representante_legal` | ⚠️ (Jurídica) | ⚠️ (Jurídica) | ⚠️ (Jurídica) | ✅ (Siempre) | ❌ |
| `documento_nit_titular` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `clase_niza_actual` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `nuevas_clases_niza` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `descripcion_nuevos_productos_servicios` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `marca_a_oponerse` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `marca_opositora` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `argumentos_respuesta` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `nombre_razon_social_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `nit_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `representante_legal_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `tipo_documento_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `numero_documento_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `correo_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `telefono_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `direccion_cesionario` | ❌ | ✅ | ❌ | ❌ | ❌ |

**Leyenda**:
- ✅ = Obligatorio
- ⚪ = Opcional
- ⚠️ = Condicional (solo si Jurídica o según condiciones)
- ❌ = No aplica

---

## 📎 Archivos Requeridos por Servicio

| Servicio | Archivos Obligatorios | Formatos | Tamaño Máx |
|----------|----------------------|----------|------------|
| **Renovación** | `certificado_renovacion`<br>`logotipo`<br>`poder_autorizacion` | PDF, JPG, PNG<br>JPG, PNG (NO PDF)<br>PDF, JPG, PNG | 5MB c/u |
| **Cesión** | `documento_cesion`<br>`poder_autorizacion` | PDF, JPG, PNG<br>PDF, JPG, PNG | 5MB c/u |
| **Oposición** | `documentos_oposicion`<br>`poder_autorizacion` | PDF, JPG, PNG<br>PDF, JPG, PNG | 5MB c/u |
| **Respuesta Oposición** | `poder_autorizacion` | PDF, JPG, PNG | 5MB |
| **Ampliación** | `soportes` | PDF, JPG, PNG | 5MB |

---

## 🔄 Transformación de Datos

### Conversión de Archivos a Base64

**Formato requerido**:
```
data:[mime-type];base64,{contenido_base64}
```

**Ejemplos**:
- PDF: `data:application/pdf;base64,JVBERi0xLjQK...`
- JPG: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...`
- PNG: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`

**Validaciones antes de convertir**:
1. Tamaño máximo: 5MB
2. Formato permitido según campo
3. Si falla, retornar `null` o string vacío

### Concatenación de Nombres

```javascript
nombres_apellidos: `${nombres} ${apellidos}`.trim()
```

### Conversión a snake_case

- Frontend: `tipoDocumento` → API: `tipo_documento`
- Frontend: `numeroDocumento` → API: `numero_documento`
- Frontend: `nombreMarca` → API: `nombre_marca`
- etc.

### Conversión de NIT

```javascript
nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null
```

---

## 🎯 Validaciones Específicas por Campo

### Número de Expediente
- **Formato**: 3-30 caracteres
- **Permitido**: Letras, números, guiones
- **Ejemplo válido**: `"2020-123456"`, `"2019-789012"`
- **Regex**: `/^[A-Za-z0-9-]{3,30}$/`

### NIT
- **Formato**: Exactamente 10 dígitos
- **Rango**: 1000000000 - 9999999999
- **Sin guión**: Se envía sin guión
- **Regex**: `/^[0-9]{10}$/`

### Clases Niza
- **Formato actual**: 1-3 dígitos (ej: `"25"`)
- **Formato nuevas**: Separadas por comas (ej: `"28, 35"` o `"28,35"`)
- **Regex nuevas**: `/^[0-9, ]+$/`

### Argumentos/Descripciones
- **Mínimo**: 10 caracteres
- **Tipo**: Texto libre (textarea)

---

## 📝 Estructura de Respuesta

La respuesta de creación es **siempre la misma estructura**, independientemente del servicio:

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

**Estado inicial**: La solicitud se crea con el **primer proceso activo** del servicio (ej: "Solicitud Inicial", "Verificación de Documentos").

---

## ⚠️ Diferencias y Casos Especiales

### 1. Respuesta a Oposición NO tiene `tipo_solicitante`
- Siempre requiere información de empresa
- No hay opción de persona natural

### 2. Presentación de Oposición: NIT siempre requerido
- Incluso para persona natural
- Requisito legal del proceso de oposición

### 3. Ampliación de Alcance: Estructura diferente
- No tiene `tipo_solicitante`
- No tiene `nombres_apellidos` (usa `documento_nit_titular`)
- Requiere `ciudad` (no opcional)

### 4. Logotipo en Renovación: Solo JPG/PNG
- NO acepta PDF (a diferencia de otros archivos)

### 5. Campos que se calculan automáticamente
- `nombres_apellidos`: Se concatena de `nombres` + `apellidos`
- `clase_niza`: Se une de array de clases con comas
- `id_cliente`: Se toma del selector (admin) o del token (cliente)

---

## 🔍 Validaciones Cruzadas

### Renovación/Cesión/Oposición:
- Si `tipo_solicitante === "Jurídica"` → Requiere: `tipo_entidad`, `razon_social`, `nit_empresa`, `representante_legal`
- Si `tipo_solicitante === "Natural"` → NO incluir campos de jurídica

### Cesión:
- Todos los campos del cesionario son obligatorios independientemente del tipo de solicitante del cedente

### Oposición:
- `nit_empresa` es siempre requerido, incluso si es Natural

---

## 📚 Referencias

- **Código de transformación**: `solicitudesApiService.js` (líneas 769-1397)
- **Formularios**: `formularioRenovacion.jsx`, `formularioCesiondeMarca.jsx`, `formularioOposicion.jsx`, `formularioRespuesta.jsx`, `formularioAmpliacion.jsx`
- **Documentación general**: `CREAR_SOLICITUD_ADMIN_COMPLETO.md`

---

**Última actualización**: Enero 2025  
**Fuente**: Análisis del código del frontend web (Registrack_Oficial/src/)

