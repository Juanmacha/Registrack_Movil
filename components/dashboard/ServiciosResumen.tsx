import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PERIODOS, PERIODO_DEFAULT } from '@/constants/periodos';
import { useDashboardServicios } from '@/hooks/useDashboard';
import { PeriodoValue } from '@/types/dashboard';
import { colors } from '@/styles/authStyles';

import Badge from './Badge';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const getEstadoVariant = (estado: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('finalizado') || estadoLower.includes('completado')) {
    return 'success';
  }
  if (estadoLower.includes('proceso') || estadoLower.includes('revisión')) {
    return 'warning';
  }
  if (estadoLower.includes('pendiente') || estadoLower.includes('inicial')) {
    return 'info';
  }
  if (estadoLower.includes('rechazado') || estadoLower.includes('anulado')) {
    return 'error';
  }
  return 'default';
};

export default function ServiciosResumen() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(PERIODO_DEFAULT);
  const { data, loading, error, refetch } = useDashboardServicios(periodo);

  if (loading) {
    return (
      <Card>
        <Text style={styles.title}>Resumen de Servicios</Text>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text style={styles.title}>Resumen de Servicios</Text>
        <ErrorMessage message={error} onRetry={refetch} />
      </Card>
    );
  }

  if (!data || !data.servicios || data.servicios.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Resumen de Servicios</Text>
        <Text style={styles.emptyText}>No hay datos disponibles para el período seleccionado.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Resumen de Servicios</Text>
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

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Servicios</Text>
          <Text style={styles.summaryValue}>{data.total_servicios}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Solicitudes</Text>
          <Text style={styles.summaryValue}>{data.total_solicitudes}</Text>
        </View>
      </View>

      <View style={styles.serviciosContainer}>
        {data.servicios.map((servicio) => (
          <View key={servicio.id_servicio} style={styles.servicioCard}>
            <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
            <View style={styles.servicioStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Solicitudes</Text>
                <Text style={styles.statValue}>{servicio.total_solicitudes}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Uso</Text>
                <Text style={styles.statValue}>{servicio.porcentaje_uso.toFixed(1)}%</Text>
              </View>
            </View>

            {servicio.estado_distribucion && Object.keys(servicio.estado_distribucion).length > 0 && (
              <View style={styles.estadosContainer}>
                <Text style={styles.estadosLabel}>Estados:</Text>
                <View style={styles.estadosList}>
                  {Object.entries(servicio.estado_distribucion).map(([estado, count]) => (
                    <View key={estado} style={styles.estadoItem}>
                      <Badge label={`${estado}: ${count}`} variant={getEstadoVariant(estado)} />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(8, 56, 116, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  summaryLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 6,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serviciosContainer: {
    gap: 12,
  },
  servicioCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  servicioStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  estadosContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  estadosLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  estadosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  estadoItem: {
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 24,
  },
});

