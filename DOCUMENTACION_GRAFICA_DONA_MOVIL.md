# Documentación: Actualización Gráfica de Dona - Implementación Móvil

## 📋 Tabla de Contenidos
1. [Resumen de Cambios](#resumen-de-cambios)
2. [Nuevo Campo de la API](#nuevo-campo-de-la-api)
3. [Estructura de Datos](#estructura-de-datos)
4. [Transformación de Datos](#transformación-de-datos)
5. [Implementación en Móvil](#implementación-en-móvil)
6. [Ejemplo Completo](#ejemplo-completo)
7. [Compatibilidad Legacy](#compatibilidad-legacy)
8. [Checklist de Implementación](#checklist-de-implementación)

---

## 🔄 Resumen de Cambios

### Cambio Principal
La gráfica de dona ahora utiliza el nuevo campo `distribucion_por_servicio` del endpoint `/api/dashboard/ingresos`, que proporciona:
- ✅ **Nombres de servicios reales** (en lugar de un "Servicio" genérico)
- ✅ **Porcentajes pre-calculados** (no es necesario calcularlos manualmente)
- ✅ **Total de ingresos** directamente del campo
- ✅ **Mejor estructura de datos** para la visualización

### Antes vs Después

**Antes:**
- Los servicios aparecían como "Servicio" genérico
- Los porcentajes se calculaban manualmente
- El total se calculaba sumando los valores individuales

**Después:**
- Cada servicio tiene su nombre real: "Búsqueda de Antecedentes", "Registro de Marca", etc.
- Los porcentajes vienen pre-calculados desde la API
- El total viene directamente en `distribucion_por_servicio.total_ingresos`

---

## 🔌 Nuevo Campo de la API

### Endpoint
```
GET /api/dashboard/ingresos?periodo={periodo}
```

**Parámetros:**
- `periodo`: `"1mes"`, `"3meses"`, `"6meses"`, `"12meses"`, `"todo"`

**Headers:**
```javascript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Respuesta - Campo `distribucion_por_servicio`

```json
{
  "success": true,
  "data": {
    "distribucion_por_servicio": {
      "total_ingresos": 15250000.00,
      "servicios": [
        {
          "id_servicio": 1,
          "nombre_servicio": "Búsqueda de Antecedentes",
          "total_ingresos": 5000000.00,
          "total_transacciones": 15,
          "porcentaje": 32.79
        },
        {
          "id_servicio": 2,
          "nombre_servicio": "Registro de Marca (Certificación de marca)",
          "total_ingresos": 4500000.00,
          "total_transacciones": 12,
          "porcentaje": 29.51
        },
        {
          "id_servicio": 3,
          "nombre_servicio": "Renovación de Marca",
          "total_ingresos": 3500000.00,
          "total_transacciones": 10,
          "porcentaje": 22.95
        },
        {
          "id_servicio": 4,
          "nombre_servicio": "Cesión de Marca",
          "total_ingresos": 2250000.00,
          "total_transacciones": 8,
          "porcentaje": 14.75
        }
      ]
    }
  }
}
```

### Campos Disponibles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `distribucion_por_servicio.total_ingresos` | `number` | Total de ingresos de todos los servicios |
| `distribucion_por_servicio.servicios` | `array` | Array de objetos con información de cada servicio |
| `servicios[].id_servicio` | `number` | ID único del servicio |
| `servicios[].nombre_servicio` | `string` | Nombre completo del servicio |
| `servicios[].total_ingresos` | `number` | Suma de ingresos de ese servicio |
| `servicios[].total_transacciones` | `number` | Cantidad de pagos realizados |
| `servicios[].porcentaje` | `number` | Porcentaje que representa del total (ya calculado) |

**Notas importantes:**
- Solo aparecen servicios con al menos un pago con estado `'Pagado'`
- Los servicios se ordenan por `total_ingresos` de mayor a menor
- El `porcentaje` suma 100% entre todos los servicios
- El `porcentaje` viene pre-calculado, no es necesario calcularlo

---

## 📊 Estructura de Datos

### Formato Esperado para la Gráfica

```typescript
interface DatosGrafica {
  labels: string[];           // Nombres de servicios
  values: number[];           // Ingresos por servicio
  colors: string[];          // Colores para cada segmento
  porcentajes: number[];      // Porcentajes (opcional, viene del API)
  totalIngresos?: number;     // Total general (opcional, viene del API)
}
```

### Ejemplo de Datos Transformados

```javascript
{
  labels: [
    "Búsqueda de Antecedentes",
    "Registro de Marca (Certificación de marca)",
    "Renovación de Marca",
    "Cesión de Marca"
  ],
  values: [5000000, 4500000, 3500000, 2250000],
  colors: ["#a259e6", "#347cf7", "#ff7d1a", "#b6e61c"],
  porcentajes: [32.79, 29.51, 22.95, 14.75],
  totalIngresos: 15250000
}
```

---

## 🔄 Transformación de Datos

### Función de Transformación (Prioridad)

La función debe **priorizar** el nuevo campo `distribucion_por_servicio`:

```javascript
/**
 * Transforma los datos de la API al formato de la gráfica
 * @param {Object} apiData - Respuesta completa de la API
 * @returns {Object|null} - Datos transformados o null si no hay datos
 */
const transformarDatosAPI = (apiData) => {
  // Validar que apiData existe
  if (!apiData) {
    return null;
  }

  // ✅ PRIORIDAD 1: Nuevo campo distribucion_por_servicio
  if (apiData.data && apiData.data.distribucion_por_servicio) {
    const distribucion = apiData.data.distribucion_por_servicio;
    
    if (distribucion.servicios && Array.isArray(distribucion.servicios)) {
      const servicios = distribucion.servicios;
      
      // Extraer labels, values y porcentajes directamente
      const labels = servicios.map(item => item.nombre_servicio || 'Servicio');
      const values = servicios.map(item => item.total_ingresos || 0);
      const porcentajes = servicios.map(item => item.porcentaje || 0);
      
      // Asignar colores según el nombre del servicio
      const colors = labels.map(label => obtenerColorServicio(label));
      
      return {
        labels,
        values,
        colors,
        porcentajes,
        totalIngresos: distribucion.total_ingresos
      };
    }
  }

  // Estructuras legacy (compatibilidad hacia atrás)
  // ... código para manejar estructuras antiguas si es necesario
  
  return null;
};
```

### Función para Asignar Colores

```javascript
// Colores predefinidos para los servicios
const servicioColors = {
  "Certificación": "#347cf7",
  "Renovación": "#ff7d1a",
  "Proceso de Oposición": "#22c55e",
  "Búsqueda de Antecedentes": "#a259e6",
  "Ampliación de Alcance": "#1cc6e6",
  "Cesión de Marca": "#b6e61c",
  "default": ["#347cf7", "#ff7d1a", "#22c55e", "#a259e6", "#1cc6e6", "#b6e61c"]
};

/**
 * Obtiene el color para un servicio según su nombre
 * @param {string} nombreServicio - Nombre del servicio
 * @param {number} index - Índice para usar color por defecto si no hay coincidencia
 * @returns {string} - Color hexadecimal
 */
const obtenerColorServicio = (nombreServicio, index = 0) => {
  const nombreLower = nombreServicio.toLowerCase();
  
  // Buscar coincidencia parcial
  for (const [key, color] of Object.entries(servicioColors)) {
    if (key === "default") continue;
    
    if (nombreLower.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(nombreLower)) {
      return color;
    }
  }
  
  // Si no hay coincidencia, usar color por defecto
  return servicioColors.default[index % servicioColors.default.length];
};
```

---

## 📱 Implementación en Móvil

### 1. Obtener Datos de la API

```javascript
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-registrack-2.onrender.com'; // o tu URL

const useDashboardIngresos = (periodo = '12meses') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        
        const response = await fetch(
          `${BASE_URL}/api/dashboard/ingresos?periodo=${periodo}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  return { data, loading, error };
};
```

### 2. Transformar Datos

```javascript
const transformarDatosAPI = (apiData) => {
  if (!apiData) return null;

  // ✅ PRIORIDAD 1: Nuevo campo distribucion_por_servicio
  if (apiData.data && apiData.data.distribucion_por_servicio) {
    const distribucion = apiData.data.distribucion_por_servicio;
    
    if (distribucion.servicios && Array.isArray(distribucion.servicios)) {
      const servicios = distribucion.servicios;
      
      const labels = servicios.map(item => item.nombre_servicio || 'Servicio');
      const values = servicios.map(item => item.total_ingresos || 0);
      const porcentajes = servicios.map(item => item.porcentaje || 0);
      
      const colors = labels.map((label, index) => 
        obtenerColorServicio(label, index)
      );
      
      return {
        labels,
        values,
        colors,
        porcentajes,
        totalIngresos: distribucion.total_ingresos
      };
    }
  }

  return null;
};
```

### 3. Calcular Total

```javascript
const calcularTotal = (datos) => {
  if (!datos) return 0;
  
  // Si tenemos totalIngresos del nuevo formato, usarlo
  if (datos.totalIngresos !== undefined) {
    return datos.totalIngresos;
  }
  
  // Sino, calcular desde los values
  if (!datos.values || datos.values.length === 0) return 0;
  return datos.values.reduce((a, b) => a + b, 0);
};
```

### 4. Usar Porcentajes del API

```javascript
// En lugar de calcular:
const porcentaje = (valor / total) * 100;

// Usar directamente del API:
const porcentaje = datos.porcentajes[index];
```

---

## 💻 Ejemplo Completo

### Componente de Gráfica de Dona (React Native)

```javascript
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; // o la librería que uses
import { useDashboardIngresos } from '../hooks/useDashboardIngresos';
import { transformarDatosAPI, calcularTotal, obtenerColorServicio } from '../utils/chartUtils';

const GraficaIngresosPie = ({ periodo = '12meses' }) => {
  const { data: apiData, loading, error } = useDashboardIngresos(periodo);

  // Transformar datos
  const datos = useMemo(() => {
    if (!apiData) return null;
    return transformarDatosAPI(apiData);
  }, [apiData]);

  // Calcular total
  const total = useMemo(() => {
    return calcularTotal(datos);
  }, [datos]);

  // Preparar datos para la gráfica
  const chartData = useMemo(() => {
    if (!datos) return [];

    return datos.labels.map((label, index) => ({
      name: label,
      population: datos.values[index],
      color: datos.colors[index],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  }, [datos]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#347cf7" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (!datos || datos.labels.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribución de Ingresos por Servicio</Text>
      
      {/* Gráfica de dona */}
      <PieChart
        data={chartData}
        width={300}
        height={300}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Leyenda con porcentajes */}
      <View style={styles.legend}>
        {datos.labels.map((label, index) => {
          // Usar porcentaje del API si está disponible, sino calcularlo
          const percent = datos.porcentajes && datos.porcentajes[index] !== null
            ? datos.porcentajes[index].toFixed(1)
            : (total > 0 ? ((datos.values[index] / total) * 100).toFixed(1) : '0.0');

          return (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: datos.colors[index] }]} />
              <Text style={styles.legendLabel}>{label}</Text>
              <Text style={styles.legendPercent}>{percent}%</Text>
            </View>
          );
        })}
      </View>

      {/* Total */}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>
          ${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  legend: {
    marginTop: 20,
    width: '100%'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#347cf7'
  },
  error: {
    color: 'red',
    fontSize: 14
  }
});

export default GraficaIngresosPie;
```

### Utilidades (chartUtils.js)

```javascript
// Colores predefinidos
const servicioColors = {
  "Certificación": "#347cf7",
  "Renovación": "#ff7d1a",
  "Proceso de Oposición": "#22c55e",
  "Búsqueda de Antecedentes": "#a259e6",
  "Ampliación de Alcance": "#1cc6e6",
  "Cesión de Marca": "#b6e61c",
  "default": ["#347cf7", "#ff7d1a", "#22c55e", "#a259e6", "#1cc6e6", "#b6e61c"]
};

export const obtenerColorServicio = (nombreServicio, index = 0) => {
  const nombreLower = nombreServicio.toLowerCase();
  
  for (const [key, color] of Object.entries(servicioColors)) {
    if (key === "default") continue;
    
    if (nombreLower.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(nombreLower)) {
      return color;
    }
  }
  
  return servicioColors.default[index % servicioColors.default.length];
};

export const transformarDatosAPI = (apiData) => {
  if (!apiData) return null;

  // ✅ PRIORIDAD 1: Nuevo campo distribucion_por_servicio
  if (apiData.data && apiData.data.distribucion_por_servicio) {
    const distribucion = apiData.data.distribucion_por_servicio;
    
    if (distribucion.servicios && Array.isArray(distribucion.servicios)) {
      const servicios = distribucion.servicios;
      
      const labels = servicios.map(item => item.nombre_servicio || 'Servicio');
      const values = servicios.map(item => item.total_ingresos || 0);
      const porcentajes = servicios.map(item => item.porcentaje || 0);
      
      const colors = labels.map((label, index) => 
        obtenerColorServicio(label, index)
      );
      
      return {
        labels,
        values,
        colors,
        porcentajes,
        totalIngresos: distribucion.total_ingresos
      };
    }
  }

  return null;
};

export const calcularTotal = (datos) => {
  if (!datos) return 0;
  
  if (datos.totalIngresos !== undefined) {
    return datos.totalIngresos;
  }
  
  if (!datos.values || datos.values.length === 0) return 0;
  return datos.values.reduce((a, b) => a + b, 0);
};
```

---

## 🔄 Compatibilidad Legacy

### Estructuras Legacy (Opcional)

Si necesitas mantener compatibilidad con estructuras antiguas, puedes agregar estas validaciones después de la prioridad 1:

```javascript
const transformarDatosAPI = (apiData) => {
  if (!apiData) return null;

  // ✅ PRIORIDAD 1: Nuevo campo distribucion_por_servicio
  if (apiData.data && apiData.data.distribucion_por_servicio) {
    // ... código anterior
  }

  // Estructuras legacy (solo si no se encontró el nuevo formato)
  let servicios = [];
  
  if (Array.isArray(apiData)) {
    servicios = apiData;
  } else if (apiData.servicios && Array.isArray(apiData.servicios)) {
    servicios = apiData.servicios;
  } else if (apiData.data && Array.isArray(apiData.data)) {
    servicios = apiData.data;
  }
  
  if (servicios.length === 0) {
    return null;
  }

  // Procesar estructura legacy
  const labels = servicios.map(item => 
    item.nombre_servicio || item.nombre || item.servicio || 'Servicio'
  );
  
  const values = servicios.map(item => 
    item.total_ingresos || item.ingresos || item.total || 0
  );
  
  const colors = labels.map((label, index) => 
    obtenerColorServicio(label, index)
  );
  
  return { labels, values, colors, porcentajes: null };
};
```

---

## ✅ Checklist de Implementación

### Backend/API
- [ ] Verificar que el endpoint `/api/dashboard/ingresos` devuelve `distribucion_por_servicio`
- [ ] Verificar que `distribucion_por_servicio.servicios` es un array
- [ ] Verificar que cada servicio tiene `nombre_servicio`, `total_ingresos` y `porcentaje`
- [ ] Verificar que `distribucion_por_servicio.total_ingresos` está presente

### Frontend Móvil
- [ ] Implementar función `transformarDatosAPI` con prioridad al nuevo campo
- [ ] Implementar función `obtenerColorServicio` para asignar colores
- [ ] Implementar función `calcularTotal` que use `totalIngresos` si está disponible
- [ ] Actualizar componente de gráfica para usar `porcentajes` del API
- [ ] Actualizar leyenda para mostrar porcentajes del API
- [ ] Actualizar tooltip/hover para mostrar porcentajes del API
- [ ] Probar con diferentes períodos (`1mes`, `3meses`, `6meses`, `12meses`, `todo`)
- [ ] Manejar casos de error (sin datos, sin conexión, etc.)
- [ ] Manejar estados de carga

### Validaciones
- [ ] Validar que `apiData.data.distribucion_por_servicio` existe antes de usarlo
- [ ] Validar que `distribucion_por_servicio.servicios` es un array
- [ ] Validar que cada servicio tiene los campos requeridos
- [ ] Manejar casos donde `porcentaje` puede ser `null` o `undefined`
- [ ] Manejar casos donde `total_ingresos` puede ser `0`

### Testing
- [ ] Probar con datos reales del API
- [ ] Probar con diferentes períodos
- [ ] Probar con un solo servicio
- [ ] Probar con muchos servicios (más de 10)
- [ ] Probar con servicios sin ingresos
- [ ] Probar manejo de errores

---

## 📝 Notas Importantes

1. **Prioridad del Nuevo Campo:**
   - Siempre verificar primero `apiData.data.distribucion_por_servicio`
   - Solo usar estructuras legacy si el nuevo campo no está disponible

2. **Porcentajes:**
   - Los porcentajes vienen pre-calculados desde la API
   - No es necesario calcularlos manualmente: `(valor / total) * 100`
   - Usar directamente: `datos.porcentajes[index]`

3. **Total de Ingresos:**
   - Usar `distribucion_por_servicio.total_ingresos` si está disponible
   - Solo calcular sumando `values` si el total no viene en el API

4. **Nombres de Servicios:**
   - Los nombres vienen completos desde la API
   - Ejemplos: "Búsqueda de Antecedentes", "Registro de Marca (Certificación de marca)"
   - No es necesario mapear o transformar los nombres

5. **Colores:**
   - Asignar colores según el nombre del servicio
   - Usar colores por defecto si no hay coincidencia
   - Mantener consistencia con la versión web

6. **Formato de Números:**
   - Formatear ingresos con separadores de miles: `$15.250.000`
   - Formatear porcentajes con 1 decimal: `32.8%`
   - Usar `toLocaleString` para formateo

---

## 🔗 Referencias

- **Archivo Web:** `src/features/dashboard/pages/dashAdmin/components/GraficaIngresosPie.jsx`
- **Documentación API:** `documentacion api.md` (líneas 1890-2081)
- **Endpoint:** `GET /api/dashboard/ingresos?periodo={periodo}`

---

**Última actualización:** Diciembre 2024
