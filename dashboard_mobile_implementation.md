# 📊 Documentación Dashboard Administrativo - Aplicación Móvil

Este documento contiene toda la información necesaria para implementar el módulo de Dashboard Administrativo en la aplicación móvil React Native de Registrack (Certimarcas).

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura y Estructura](#2-arquitectura-y-estructura)
3. [Componentes del Dashboard](#3-componentes-del-dashboard)
4. [Endpoints de la API](#4-endpoints-de-la-api)
5. [Flujos de Datos](#5-flujos-de-datos)
6. [Estilos y Diseño](#6-estilos-y-diseño)
7. [Implementación Móvil](#7-implementación-móvil)
8. [Kit de Implementación](#8-kit-de-implementación)

---

## 1. Visión General

### 1.1 Propósito

El Dashboard Administrativo es el panel principal para administradores y empleados, que muestra:
- **Distribución de Ingresos**: Gráfica circular (pie chart) de ingresos por servicio
- **Resumen de Servicios**: Estadísticas de uso, servicios más/menos solicitados, distribución por estado
- **Marcas Certificadas Próximas a Vencerse**: Tabla de marcas que vencen en los próximos 90 días
- **Servicios con Inactividad Prolongada**: Tabla de solicitudes sin actualizar por más de 30 días

### 1.2 Acceso y Permisos

- **Ruta Web**: `/admin/dashboard`
- **Permisos Requeridos**: 
  - Módulo: `gestion_dashboard`
  - Acción: `leer`
- **Roles Permitidos**: Administrador, Empleado
- **Autenticación**: Requiere token JWT válido en header `Authorization: Bearer <token>`

### 1.3 Estructura del Layout

```
AdminLayout
├── SideBarGeneral (navegación lateral)
├── NavBar (barra superior con título)
└── Dashboard (contenido principal)
    ├── GraficaIngresosPie
    ├── GraficaResumenServicios
    ├── TablaMarcasCertificadas
    └── TablaServicios
```

---

## 2. Arquitectura y Estructura

### 2.1 Componentes Principales

**Archivo Principal**: `dashboard.jsx`

```javascript
// Estructura simplificada
<Dashboard>
  <GraficaIngresosPie />
  <GraficaResumenServicios />
  <TablaMarcasCertificadas />
  <TablaServicios />
</Dashboard>
```

### 2.2 Servicios y Hooks

**Servicio API**: `dashboardApiService.js`
- Centraliza todas las llamadas a la API del dashboard
- Maneja autenticación, tokens y errores
- Soporta descarga de archivos Excel

**Hooks Personalizados**: `useDashboardData.js`
- `useDashboardIngresos(periodo, autoFetch)`
- `useDashboardServicios(periodo, autoFetch)`
- `useDashboardResumen(periodo, autoFetch)`
- `useDashboardInactivas(autoFetch)`
- `useDashboardRenovaciones(autoFetch)`

### 2.3 Configuración de Períodos

**Archivo**: `periodos.js`

**Períodos Disponibles**:
```javascript
[
  { label: "1 Mes", value: "1mes" },
  { label: "3 Meses", value: "3meses" },
  { label: "6 Meses", value: "6meses" },
  { label: "12 Meses", value: "12meses" }, // Por defecto
  { label: "18 Meses", value: "18meses" },
  { label: "2 Años", value: "2anos" },
  { label: "3 Años", value: "3anos" },
  { label: "5 Años", value: "5anos" },
  { label: "Todos", value: "todo" }
]
```

---

## 3. Componentes del Dashboard

### 3.1 Gráfica de Ingresos (GraficaIngresosPie)

#### 3.1.1 Funcionalidad

- Muestra distribución de ingresos por servicio en gráfica circular (doughnut chart)
- Selector de período (1mes, 3meses, 6meses, 12meses, etc.)
- Leyenda interactiva con porcentajes
- Descarga de PDF con los datos

#### 3.1.2 Datos de la API

**Endpoint**: `GET /api/dashboard/ingresos?periodo=12meses`

**Estructura de Respuesta**:
```javascript
{
  success: true,
  data: {
    total_ingresos: 5000000,
    periodo: "12meses",
    ingresos_por_servicio: [
      {
        nombre: "Certificación de Marca",
        ingresos: 2000000
      },
      {
        nombre: "Renovación",
        ingresos: 1500000
      },
      // ... más servicios
    ],
    ingresos_por_mes: [
      {
        mes: "2024-01",
        total: 500000,
        servicios: [
          { nombre: "Certificación", ingresos: 200000 },
          // ...
        ]
      }
    ]
  }
}
```

#### 3.1.3 Colores por Servicio

```javascript
const servicioColors = {
  "Certificación": "#347cf7",
  "Renovación": "#ff7d1a",
  "Proceso de Oposición": "#22c55e",
  "Búsqueda de Antecedentes": "#a259e6",
  "Ampliación de Alcance": "#1cc6e6",
  "Cesión de Marca": "#b6e61c"
};
```

#### 3.1.4 Transformación de Datos

El componente transforma los datos de la API para el gráfico:
- Extrae `ingresos_por_servicio` o calcula desde `ingresos_por_mes`
- Genera labels, values y colores para Chart.js
- Calcula porcentajes y totales

#### 3.1.5 Estilos Web

```css
/* Contenedor principal */
.dashboard-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 400px;
  position: relative;
  margin-right: 1rem;
}

/* Gráfica */
.dashboard-chart {
  width: 384px;
  height: 384px;
}

/* Leyenda */
.leyenda-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.leyenda-item:hover {
  background-color: #f3f4f6;
}
```

---

### 3.2 Resumen de Servicios (GraficaResumenServicios)

#### 3.2.1 Funcionalidad

- Muestra tarjetas con estadísticas de cada servicio
- Total de solicitudes por servicio
- Porcentaje de uso
- Distribución de estados (dinámica según datos de la API)
- Descarga de Excel

#### 3.2.2 Datos de la API

**Endpoint**: `GET /api/dashboard/servicios?periodo=12meses`

**Estructura de Respuesta**:
```javascript
{
  success: true,
  data: {
    total_servicios: 7,
    total_solicitudes: 200,
    periodo: "12meses",
    servicios: [
      {
        id_servicio: 1,
        nombre: "Certificación de Marca",
        total_solicitudes: 50,
        porcentaje_uso: 25.5,
        precio_base: 500000,
        estado_distribucion: {
          "En proceso": 20,
          "Finalizado": 30,
          "Pendiente": 0
        }
      },
      // ... más servicios
    ]
  }
}
```

#### 3.2.3 Colores de Estados

```javascript
const getEstadoColor = (estado) => {
  const estadoLower = estado.toLowerCase();
  
  if (estadoLower.includes('finalizado') || estadoLower.includes('completado')) {
    return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
  }
  if (estadoLower.includes('proceso') || estadoLower.includes('revisión')) {
    return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
  }
  if (estadoLower.includes('pendiente') || estadoLower.includes('inicial')) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
  }
  if (estadoLower.includes('rechazado') || estadoLower.includes('anulado')) {
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  }
  
  return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
};
```

#### 3.2.4 Estilos Web

```css
/* Contenedor de tarjetas */
.grid-servicios {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Tarjeta de servicio */
.tarjeta-servicio {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}

.tarjeta-servicio:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Badge de estado */
.badge-estado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}
```

---

### 3.3 Tabla de Marcas Certificadas (TablaMarcasCertificadas)

#### 3.3.1 Funcionalidad

- Lista de marcas certificadas próximas a vencerse (próximos 90 días)
- Búsqueda global por marca, cliente, empleado
- Ordenamiento por días restantes (más críticos primero)
- Badges de urgencia según días restantes
- Descarga de Excel

#### 3.3.2 Datos de la API

**Endpoint**: `GET /api/dashboard/renovaciones-proximas?format=json`

**Estructura de Respuesta**:
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      nombre_marca: "Mi Marca",
      cliente: {
        id_cliente: 1,
        usuario: {
          nombre: "Juan",
          apellido: "Pérez"
        }
      },
      empleado: {
        id_empleado: 2,
        usuario: {
          nombre: "María",
          apellido: "García"
        }
      },
      fecha_certificacion: "2019-01-15",
      fecha_vencimiento: "2024-01-15",
      dias_restantes: 45,
      estado: "Activa"
    },
    // ... más marcas
  ]
}
```

#### 3.3.3 Badges de Urgencia

```javascript
const EstadoVencimientoBadge = ({ diasRestantes }) => {
  const dias = parseInt(diasRestantes);
  if (dias <= 30) {
    return <Badge color="red">Crítico</Badge>;
  } else if (dias <= 60) {
    return <Badge color="orange">Urgente</Badge>;
  } else if (dias <= 90) {
    return <Badge color="yellow">Atención</Badge>;
  } else {
    return <Badge color="green">Normal</Badge>;
  }
};
```

#### 3.3.4 Columnas de la Tabla

1. **Cliente**: Avatar + nombre completo
2. **Marca**: Nombre de la marca
3. **Fecha Certificación**: Fecha en formato DD/MM/YYYY
4. **Fecha Vencimiento**: Fecha en formato DD/MM/YYYY
5. **Días Restantes**: Número con color según urgencia
6. **Estado**: Badge de urgencia
7. **Empleado Asignado**: Nombre del empleado
8. **Acciones**: Botón para iniciar renovación

#### 3.3.5 Estilos Web

```css
/* Encabezado de tabla */
.tabla-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #fff7ed, #fef2f2);
  border-bottom: 1px solid #fed7aa;
}

/* Barra de búsqueda */
.busqueda-global {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
}

/* Tabla responsiva */
.tabla-responsive {
  overflow-x: auto;
}

/* Fila de tabla */
.fila-tabla {
  transition: background-color 0.2s;
}

.fila-tabla:hover {
  background-color: #f9fafb;
}
```

---

### 3.4 Tabla de Servicios Inactivos (TablaServicios)

#### 3.4.1 Funcionalidad

- Lista de solicitudes sin actualizar por más de 30 días
- Búsqueda global por servicio, cliente, empleado, estado
- Indicador de días de inactividad con colores
- Modal con detalles del servicio
- Descarga de Excel
- Navegación a gestión de solicitudes

#### 3.4.2 Datos de la API

**Endpoint**: `GET /api/dashboard/inactivas?format=json`

**Estructura de Respuesta**:
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      id_orden_servicio: 123,
      nombre_servicio: "Certificación de Marca",
      cliente: "Juan Pérez", // o objeto cliente completo
      empleado_asignado: "María García", // o objeto empleado completo
      estado: "En proceso",
      dias_inactivos: 45,
      fecha_ultima_actualizacion: "2024-01-01"
    },
    // ... más servicios
  ]
}
```

#### 3.4.3 Colores de Inactividad

```javascript
const DiasColor = ({ dias }) => {
  const num = parseInt(dias);
  if (num >= 30) return <Text color="red">dias días</Text>;
  else if (num >= 15) return <Text color="orange">dias días</Text>;
  else if (num >= 8) return <Text color="yellow">dias días</Text>;
  else return <Text color="blue">dias días</Text>;
};
```

#### 3.4.4 Columnas de la Tabla

1. **Servicio**: Icono + nombre del servicio
2. **Cliente**: Avatar + nombre completo
3. **Empleado**: Avatar + nombre completo
4. **Estado**: Badge de estado
5. **Días Inactivo**: Número con color según urgencia
6. **Acciones**: Botón de información (abre modal)

#### 3.4.5 Estilos Web

```css
/* Contenedor de tabla */
.card-responsive {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Encabezado */
.encabezado-tabla {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
```

---

## 4. Endpoints de la API

### 4.1 Base URL y Configuración

```javascript
const API_CONFIG = {
  BASE_URL: 'https://api-registrack-2.onrender.com', // Producción
  // BASE_URL: '', // Desarrollo (usa proxy)
  
  ENDPOINTS: {
    DASHBOARD_INGRESOS: (periodo = '12meses') => 
      `/api/dashboard/ingresos?periodo=${periodo}`,
    DASHBOARD_SERVICIOS: (periodo = '12meses') => 
      `/api/dashboard/servicios?periodo=${periodo}`,
    DASHBOARD_RESUMEN: (periodo = '12meses') => 
      `/api/dashboard/resumen?periodo=${periodo}`,
    DASHBOARD_PENDIENTES: (format = 'json') => 
      `/api/dashboard/pendientes?format=${format}`,
    DASHBOARD_INACTIVAS: (format = 'json') => 
      `/api/dashboard/inactivas?format=${format}`,
    DASHBOARD_RENOVACIONES: (format = 'json') => 
      `/api/dashboard/renovaciones-proximas?format=${format}`,
    DASHBOARD_PERIODOS: '/api/dashboard/periodos'
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

#### 4.3.1 GET /api/dashboard/ingresos

**Query Parameters**:
- `periodo` (string, requerido): `1mes`, `3meses`, `6meses`, `12meses`, `18meses`, `2anos`, `3anos`, `5anos`, `todo`

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "total_ingresos": 5000000,
    "periodo": "12meses",
    "ingresos_por_servicio": [
      {
        "nombre": "Certificación de Marca",
        "ingresos": 2000000
      }
    ],
    "ingresos_por_mes": [...]
  }
}
```

**Errores**:
- `401`: Token inválido o expirado
- `403`: Sin permisos
- `500`: Error del servidor

#### 4.3.2 GET /api/dashboard/servicios

**Query Parameters**:
- `periodo` (string, requerido): Mismos valores que ingresos

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "total_servicios": 7,
    "total_solicitudes": 200,
    "periodo": "12meses",
    "servicios": [
      {
        "id_servicio": 1,
        "nombre": "Certificación de Marca",
        "total_solicitudes": 50,
        "porcentaje_uso": 25.5,
        "precio_base": 500000,
        "estado_distribucion": {
          "En proceso": 20,
          "Finalizado": 30
        }
      }
    ]
  }
}
```

#### 4.3.3 GET /api/dashboard/renovaciones-proximas

**Query Parameters**:
- `format` (string, opcional): `json` (default) o `excel`

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre_marca": "Mi Marca",
      "cliente": {
        "id_cliente": 1,
        "usuario": {
          "nombre": "Juan",
          "apellido": "Pérez"
        }
      },
      "fecha_certificacion": "2019-01-15",
      "fecha_vencimiento": "2024-01-15",
      "dias_restantes": 45,
      "estado": "Activa"
    }
  ]
}
```

**Si format=excel**: Devuelve archivo `.xlsx` con Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### 4.3.4 GET /api/dashboard/inactivas

**Query Parameters**:
- `format` (string, opcional): `json` (default) o `excel`

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_orden_servicio": 123,
      "nombre_servicio": "Certificación de Marca",
      "cliente": "Juan Pérez",
      "empleado_asignado": "María García",
      "estado": "En proceso",
      "dias_inactivos": 45
    }
  ]
}
```

---

## 5. Flujos de Datos

### 5.1 Flujo de Carga de Datos

```
1. Usuario accede a /admin/dashboard
2. Verificar autenticación y permisos
3. Cargar datos en paralelo:
   - useDashboardIngresos(periodo)
   - useDashboardServicios(periodo)
   - useDashboardRenovaciones()
   - useDashboardInactivas()
4. Mostrar estados de carga
5. Renderizar componentes con datos
```

### 5.2 Flujo de Cambio de Período

```
1. Usuario selecciona nuevo período en selector
2. Actualizar estado local del período
3. Llamar a updatePeriodo(nuevoPeriodo)
4. Hook refresca datos automáticamente
5. Componentes se actualizan con nuevos datos
```

### 5.3 Flujo de Descarga de Excel

```
1. Usuario hace clic en botón "Descargar Excel"
2. Llamar a dashboardApiService.getInactivas('excel')
3. API devuelve archivo Excel como blob
4. Crear URL temporal del blob
5. Crear elemento <a> y simular clic
6. Descargar archivo
7. Limpiar URL temporal
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

### 6.2 Tipografía

```javascript
const typography = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: 'semibold' },
  body: { fontSize: 16, fontWeight: 'normal' },
  small: { fontSize: 14, fontWeight: 'normal' },
  caption: { fontSize: 12, fontWeight: 'normal' }
};
```

### 6.3 Espaciado

```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

### 6.4 Componentes Reutilizables

#### 6.4.1 Card/Container

```css
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}
```

#### 6.4.2 Badge

```css
.badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}
```

#### 6.4.3 Button

```css
.button-primary {
  background: #347cf7;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.button-primary:hover {
  background: #2563EB;
}
```

---

## 7. Implementación Móvil

### 7.1 Estructura de Carpetas Sugerida

```
src/
├── screens/
│   └── dashboard/
│       ├── DashboardScreen.js
│       └── components/
│           ├── IngresosChart.js
│           ├── ServiciosResumen.js
│           ├── MarcasTable.js
│           └── ServiciosInactivosTable.js
├── services/
│   └── dashboard/
│       ├── dashboardApiService.js
│       └── dashboardHooks.js
├── components/
│   └── common/
│       ├── Card.js
│       ├── Badge.js
│       ├── LoadingSpinner.js
│       └── ErrorMessage.js
└── utils/
    └── formatters.js
```

### 7.2 Librerías Recomendadas

```json
{
  "dependencies": {
    "react-native": "^0.72.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^13.14.0",
    "react-native-vector-icons": "^10.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-paper": "^5.10.0",
    "react-native-table-component": "^1.2.0",
    "react-native-xlsx": "^0.0.5"
  }
}
```

### 7.3 Adaptaciones Necesarias

#### 7.3.1 Gráficas

**Web**: Chart.js (Doughnut)
**Móvil**: react-native-chart-kit (PieChart)

```javascript
import { PieChart } from 'react-native-chart-kit';

<PieChart
  data={chartData}
  width={screenWidth - 32}
  height={220}
  chartConfig={{
    color: (opacity = 1) => `rgba(52, 124, 247, ${opacity})`,
  }}
  accessor="value"
  backgroundColor="transparent"
  paddingLeft="15"
  absolute
/>
```

#### 7.3.2 Tablas

**Web**: HTML `<table>`
**Móvil**: FlatList o react-native-table-component

```javascript
import { Table, Row, Rows } from 'react-native-table-component';

<Table borderStyle={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
  <Row data={tableHead} style={styles.head} textStyle={styles.text} />
  <Rows data={tableData} textStyle={styles.text} />
</Table>
```

#### 7.3.3 Descarga de Archivos

**Web**: `file-saver` + `xlsx`
**Móvil**: `react-native-fs` + `react-native-xlsx` o usar `Share` API

```javascript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const downloadExcel = async (data) => {
  const fileUri = FileSystem.documentDirectory + 'reporte.xlsx';
  // Generar Excel y guardar
  await FileSystem.writeAsStringAsync(fileUri, excelData);
  await Sharing.shareAsync(fileUri);
};
```

### 7.4 Navegación

```javascript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

<Stack.Navigator>
  <Stack.Screen 
    name="Dashboard" 
    component={DashboardScreen}
    options={{ title: 'Panel de Administración' }}
  />
</Stack.Navigator>
```

---

## 8. Kit de Implementación

### 8.1 Prompt para IA/Desarrollador

```
Eres un desarrollador React Native que debe implementar el módulo de Dashboard Administrativo para Registrack (Certimarcas). El dashboard debe mostrar 4 componentes principales:

1. **Gráfica de Ingresos (Pie Chart)**:
   - Endpoint: GET /api/dashboard/ingresos?periodo=12meses
   - Mostrar distribución de ingresos por servicio
   - Selector de período (1mes, 3meses, 6meses, 12meses, 18meses, 2anos, 3anos, 5anos, todo)
   - Leyenda con porcentajes
   - Usar react-native-chart-kit para PieChart

2. **Resumen de Servicios**:
   - Endpoint: GET /api/dashboard/servicios?periodo=12meses
   - Mostrar tarjetas con estadísticas de cada servicio
   - Total de solicitudes, porcentaje de uso, distribución de estados
   - Grid responsivo (1 columna móvil, 2 tablet, 3+ desktop)

3. **Tabla de Marcas Certificadas**:
   - Endpoint: GET /api/dashboard/renovaciones-proximas?format=json
   - Lista de marcas próximas a vencerse (90 días)
   - Búsqueda global
   - Badges de urgencia (Crítico ≤30d, Urgente ≤60d, Atención ≤90d)
   - Usar FlatList o Table component

4. **Tabla de Servicios Inactivos**:
   - Endpoint: GET /api/dashboard/inactivas?format=json
   - Lista de solicitudes sin actualizar >30 días
   - Búsqueda global
   - Colores según días de inactividad (rojo ≥30d, naranja ≥15d, amarillo ≥8d)
   - Botón para descargar Excel

Implementa:
- Servicio `dashboardApiService` con métodos para cada endpoint
- Hooks personalizados (useDashboardIngresos, useDashboardServicios, etc.)
- Manejo de estados de carga y error
- Autenticación con token JWT en headers
- Estilos consistentes con el diseño web (colores azul #347cf7, grises, badges de colores)
- Navegación con React Navigation
- Componentes reutilizables (Card, Badge, LoadingSpinner, ErrorMessage)

La API base es: https://api-registrack-2.onrender.com
Todos los endpoints requieren token en header: Authorization: Bearer <token>
```

### 8.2 Checklist de Implementación

- [ ] Configurar servicio API con autenticación
- [ ] Implementar hooks personalizados para cada endpoint
- [ ] Crear componente de gráfica de ingresos (PieChart)
- [ ] Crear componente de resumen de servicios (tarjetas)
- [ ] Crear tabla de marcas certificadas (FlatList/Table)
- [ ] Crear tabla de servicios inactivos (FlatList/Table)
- [ ] Implementar selectores de período
- [ ] Implementar búsqueda global en tablas
- [ ] Implementar descarga de Excel
- [ ] Manejar estados de carga y error
- [ ] Aplicar estilos consistentes
- [ ] Probar con datos reales de la API
- [ ] Optimizar rendimiento (memoización, lazy loading)

### 8.3 Ejemplo de Código Base

```javascript
// services/dashboard/dashboardApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-registrack-2.onrender.com';

export const dashboardApiService = {
  async getIngresos(periodo = '12meses') {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(
      `${BASE_URL}/api/dashboard/ingresos?periodo=${periodo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return await response.json();
  },
  
  // ... más métodos
};

// hooks/useDashboardIngresos.js
import { useState, useEffect } from 'react';
import { dashboardApiService } from '../services/dashboard/dashboardApiService';

export const useDashboardIngresos = (periodo = '12meses') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dashboardApiService.getIngresos(periodo);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [periodo]);

  return { data, loading, error };
};
```

---

## 9. Consideraciones Adicionales

### 9.1 Performance

- **Lazy Loading**: Cargar componentes solo cuando son visibles
- **Memoización**: Usar `React.memo` y `useMemo` para evitar re-renders innecesarios
- **Paginación**: Para tablas grandes, implementar paginación o virtualización
- **Caché**: Guardar datos en AsyncStorage para carga offline inicial

### 9.2 Manejo de Errores

- Mostrar mensajes amigables al usuario
- Reintentos automáticos para errores de red
- Redirección a login si token expirado (401)
- Mensaje si no hay permisos (403)

### 9.3 Accesibilidad

- Labels descriptivos para gráficas
- Contraste adecuado en colores
- Tamaños de toque mínimos (44x44px)
- Soporte para lectores de pantalla

### 9.4 Testing

- Unit tests para servicios y hooks
- Integration tests para flujos completos
- Snapshot tests para componentes
- E2E tests para flujos críticos

---

**Última actualización**: Enero 2025

