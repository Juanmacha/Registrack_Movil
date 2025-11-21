import { useState } from 'react';
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

export default function IngresosChart() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(PERIODO_DEFAULT);
  const { data, loading, error, refetch } = useDashboardIngresos(periodo);

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

  // Calcular ingresos por servicio si no vienen directamente
  let ingresosPorServicio = data?.ingresos_por_servicio || [];
  
  // Si no hay ingresos_por_servicio, calcular desde ingresos_por_mes
  if (ingresosPorServicio.length === 0 && data?.ingresos_por_mes && data.ingresos_por_mes.length > 0) {
    const serviciosMap = new Map<string, number>();
    
    data.ingresos_por_mes.forEach((mes) => {
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

  if (!data || ingresosPorServicio.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Distribución de Ingresos</Text>
        <Text style={styles.emptyText}>No hay datos disponibles para el período seleccionado.</Text>
      </Card>
    );
  }

  const totalIngresos = data.total_ingresos || ingresosPorServicio.reduce((sum, item) => sum + item.ingresos, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(
      amount,
    );
  };

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
        {ingresosPorServicio.map((item, index) => {
          const porcentaje = totalIngresos > 0 ? ((item.ingresos / totalIngresos) * 100).toFixed(1) : '0';
          const color = SERVICIO_COLORS[item.nombre] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;

          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: color }]} />
              <View style={styles.legendContent}>
                <Text style={styles.legendName}>{item.nombre}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(item.ingresos)}</Text>
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

