import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDashboardInactivas } from '@/hooks/useDashboard';
import { ServicioInactivo } from '@/types/dashboard';
import { colors } from '@/styles/authStyles';

import Badge from './Badge';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const getDiasColor = (dias: number): 'error' | 'warning' | 'info' | 'default' => {
  if (dias >= 30) return 'error';
  if (dias >= 15) return 'warning';
  if (dias >= 8) return 'info';
  return 'default';
};

const getClienteNombre = (cliente: ServicioInactivo['cliente']): string => {
  if (typeof cliente === 'string') {
    return cliente;
  }
  return `${cliente.usuario.nombre} ${cliente.usuario.apellido}`;
};

const getEmpleadoNombre = (empleado: ServicioInactivo['empleado_asignado']): string => {
  if (!empleado) return 'Sin asignar';
  if (typeof empleado === 'string') {
    return empleado;
  }
  return `${empleado.usuario.nombre} ${empleado.usuario.apellido}`;
};

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function ServiciosInactivosTable() {
  const { data, loading, error, refetch } = useDashboardInactivas();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <Card>
        <Text style={styles.title}>Servicios con Inactividad Prolongada</Text>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text style={styles.title}>Servicios con Inactividad Prolongada</Text>
        <ErrorMessage message={error} onRetry={refetch} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Servicios con Inactividad Prolongada</Text>
        <Text style={styles.emptyText}>No hay servicios inactivos.</Text>
      </Card>
    );
  }

  const filteredData = data.filter((servicio) => {
    const query = searchQuery.toLowerCase();
    const servicioNombre = servicio.nombre_servicio.toLowerCase();
    const clienteNombre = getClienteNombre(servicio.cliente).toLowerCase();
    const empleadoNombre = getEmpleadoNombre(servicio.empleado_asignado).toLowerCase();
    const estado = servicio.estado.toLowerCase();
    return (
      servicioNombre.includes(query) ||
      clienteNombre.includes(query) ||
      empleadoNombre.includes(query) ||
      estado.includes(query)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => b.dias_inactivos - a.dias_inactivos);

  const renderItem = ({ item }: { item: ServicioInactivo }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text style={styles.servicioNombre}>{item.nombre_servicio}</Text>
          <Badge label={item.estado} variant={getEstadoVariant(item.estado)} />
        </View>

        <View style={styles.rowInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{getClienteNombre(item.cliente)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Empleado:</Text>
            <Text style={styles.infoValue}>{getEmpleadoNombre(item.empleado_asignado)}</Text>
          </View>

          <View style={styles.diasContainer}>
            <Text style={styles.diasLabel}>Días inactivo:</Text>
            <Badge label={`${item.dias_inactivos} días`} variant={getDiasColor(item.dias_inactivos)} />
          </View>

          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Última actualización:</Text>
            <Text style={styles.dateValue}>{formatDate(item.fecha_ultima_actualizacion)}</Text>
          </View>

          <View style={styles.ordenContainer}>
            <Text style={styles.ordenLabel}>Orden de servicio:</Text>
            <Text style={styles.ordenValue}>#{item.id_orden_servicio}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Card>
      <Text style={styles.title}>Servicios con Inactividad Prolongada</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por servicio, cliente, empleado o estado..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {sortedData.length === 0 ? (
        <Text style={styles.emptyText}>No se encontraron resultados.</Text>
      ) : (
        <ScrollView style={styles.listContainer} nestedScrollEnabled>
          {sortedData.map((item) => (
            <View key={item.id.toString()}>{renderItem({ item })}</View>
          ))}
        </ScrollView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    maxHeight: 600,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
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
  rowContent: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
    flex: 1,
  },
  rowInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
  },
  diasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  diasLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  dateItem: {
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  ordenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  ordenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  ordenValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 24,
  },
});

