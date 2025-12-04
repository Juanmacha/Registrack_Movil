import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PERIODOS, PERIODO_DEFAULT } from '@/constants/periodos';
import { useDashboardIngresos } from '@/hooks/useDashboard';
import { PeriodoValue } from '@/types/dashboard';
import { colors } from '@/styles/authStyles';

import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const SERVICIO_COLORS: Record<string, string> = {
  Certificación: '#347cf7',
  Renovación: '#ff7d1a',
  'Proceso de Oposición': '#22c55e',
  'Búsqueda de Antecedentes': '#a259e6',
  'Ampliación de Alcance': '#1cc6e6',
  'Cesión de Marca': '#b6e61c',
};

const DEFAULT_COLORS = ['#347cf7', '#ff7d1a', '#22c55e', '#a259e6', '#1cc6e6', '#b6e61c'];

/**
 * Obtiene el color para un servicio según su nombre
 */
const obtenerColorServicio = (nombreServicio: string, index: number = 0): string => {
  if (!nombreServicio) return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  
  const nombreLower = nombreServicio.toLowerCase();
  
  // Buscar coincidencia parcial
  for (const [key, color] of Object.entries(SERVICIO_COLORS)) {
    if (nombreLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nombreLower)) {
      return color;
    }
  }
  
  // Si no hay coincidencia, usar color por defecto
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

/**
 * Transforma los datos de la API al formato de la gráfica
 * Prioriza el nuevo campo distribucion_por_servicio
 */
const transformarDatosAPI = (apiData: any) => {
  if (!apiData) return null;

  // ✅ PRIORIDAD 1: Nuevo campo distribucion_por_servicio
  if (apiData.distribucion_por_servicio) {
    const distribucion = apiData.distribucion_por_servicio;
    
    if (distribucion.servicios && Array.isArray(distribucion.servicios) && distribucion.servicios.length > 0) {
      const servicios = distribucion.servicios;
      
      // Extraer labels, values y porcentajes directamente
      const labels = servicios.map((item: any) => item.nombre_servicio || 'Servicio');
      const values = servicios.map((item: any) => item.total_ingresos || 0);
      const porcentajes = servicios.map((item: any) => item.porcentaje || 0);
      
      // Asignar colores según el nombre del servicio
      const colors = labels.map((label: string, index: number) => obtenerColorServicio(label, index));
      
      return {
        labels,
        values,
        colors,
        porcentajes,
        totalIngresos: distribucion.total_ingresos || 0,
      };
    }
  }

  // Estructuras legacy (compatibilidad hacia atrás)
  let ingresosPorServicio: Array<{ nombre: string; ingresos: number }> = [];
  
  if (apiData.ingresos_por_servicio && Array.isArray(apiData.ingresos_por_servicio)) {
    ingresosPorServicio = apiData.ingresos_por_servicio;
  } else if (apiData.ingresos_por_mes && Array.isArray(apiData.ingresos_por_mes)) {
    // Calcular desde ingresos_por_mes
    const serviciosMap = new Map<string, number>();
    
    apiData.ingresos_por_mes.forEach((mes: any) => {
      if (mes.servicios && Array.isArray(mes.servicios)) {
        mes.servicios.forEach((servicio: { nombre: string; ingresos: number }) => {
          const current = serviciosMap.get(servicio.nombre) || 0;
          serviciosMap.set(servicio.nombre, current + servicio.ingresos);
        });
      }
    });
    
    ingresosPorServicio = Array.from(serviciosMap.entries()).map(([nombre, ingresos]) => ({
      nombre,
      ingresos,
    }));
  }
  
  if (ingresosPorServicio.length === 0) {
    return null;
  }

  // Procesar estructura legacy
  const labels = ingresosPorServicio.map(item => item.nombre || 'Servicio');
  const values = ingresosPorServicio.map(item => item.ingresos || 0);
  const colors = labels.map((label, index) => obtenerColorServicio(label, index));
  
  // Calcular porcentajes manualmente para estructura legacy
  const total = values.reduce((a, b) => a + b, 0);
  const porcentajes = values.map(val => total > 0 ? (val / total) * 100 : 0);
  
  return {
    labels,
    values,
    colors,
    porcentajes,
    totalIngresos: total,
  };
};

export default function IngresosChart() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(PERIODO_DEFAULT);
  const { data, loading, error, refetch } = useDashboardIngresos(periodo);

  // Transformar datos de la API
  const datosGrafica = useMemo(() => {
    if (!data) return null;
    return transformarDatosAPI(data);
  }, [data]);

  // Calcular total
  const totalIngresos = useMemo(() => {
    if (!datosGrafica) return 0;
    return datosGrafica.totalIngresos || datosGrafica.values.reduce((a, b) => a + b, 0);
  }, [datosGrafica]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(
      amount,
    );
  };

  if (loading) {
    return (
      <Card>
        <Text style={styles.title}>Distribución de Ingresos</Text>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text style={styles.title}>Distribución de Ingresos</Text>
        <ErrorMessage message={error} onRetry={refetch} />
      </Card>
    );
  }

  if (!datosGrafica || datosGrafica.labels.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Distribución de Ingresos</Text>
        <Text style={styles.emptyText}>No hay datos disponibles para el período seleccionado.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Distribución de Ingresos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodoSelector}>
          {PERIODOS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodoButton, periodo === p.value && styles.periodoButtonActive]}
              onPress={() => setPeriodo(p.value)}>
              <Text style={[styles.periodoText, periodo === p.value && styles.periodoTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total de Ingresos</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalIngresos)}</Text>
      </View>

      <ScrollView style={styles.legendContainer} nestedScrollEnabled>
        {datosGrafica.labels.map((label, index) => {
          // Usar porcentaje del API si está disponible, sino calcularlo
          const porcentaje = datosGrafica.porcentajes && datosGrafica.porcentajes[index] !== null && datosGrafica.porcentajes[index] !== undefined
            ? datosGrafica.porcentajes[index].toFixed(1)
            : (totalIngresos > 0 ? ((datosGrafica.values[index] / totalIngresos) * 100).toFixed(1) : '0.0');
          
          const color = datosGrafica.colors[index];
          const valor = datosGrafica.values[index];

          return (
            <View key={`${label}-${index}`} style={styles.legendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: color }]} />
              <View style={styles.legendContent}>
                <Text style={styles.legendName}>{label}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(valor)}</Text>
              </View>
              <Text style={styles.legendPercentage}>{porcentaje}%</Text>
            </View>
          );
        })}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  periodoSelector: {
    marginTop: 8,
  },
  periodoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  periodoButtonActive: {
    backgroundColor: colors.accent,
  },
  periodoText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
  periodoTextActive: {
    color: '#FFFFFF',
  },
  totalContainer: {
    backgroundColor: colors.primaryDark,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(8, 56, 116, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legendContainer: {
    maxHeight: 400,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  legendContent: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  legendAmount: {
    fontSize: 12,
    color: colors.gray,
  },
  legendPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 24,
  },
});

