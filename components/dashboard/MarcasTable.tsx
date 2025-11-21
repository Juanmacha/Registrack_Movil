import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDashboardRenovaciones } from '@/hooks/useDashboard';
import { MarcaCertificada } from '@/types/dashboard';
import { colors } from '@/styles/authStyles';

import Badge from './Badge';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const getUrgenciaBadge = (diasRestantes: number) => {
  if (diasRestantes <= 30) {
    return <Badge label="Crítico" variant="error" />;
  } else if (diasRestantes <= 60) {
    return <Badge label="Urgente" variant="warning" />;
  } else if (diasRestantes <= 90) {
    return <Badge label="Atención" variant="info" />;
  }
  return <Badge label="Normal" variant="success" />;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getClienteNombre = (cliente: MarcaCertificada['cliente']): string => {
  if (typeof cliente === 'string') {
    return cliente;
  }
  return `${cliente.usuario.nombre} ${cliente.usuario.apellido}`;
};

const getEmpleadoNombre = (empleado: MarcaCertificada['empleado']): string => {
  if (!empleado) return 'Sin asignar';
  if (typeof empleado === 'string') {
    return empleado;
  }
  return `${empleado.usuario.nombre} ${empleado.usuario.apellido}`;
};

export default function MarcasTable() {
  const { data, loading, error, refetch } = useDashboardRenovaciones();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <Card>
        <Text style={styles.title}>Marcas Certificadas Próximas a Vencerse</Text>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text style={styles.title}>Marcas Certificadas Próximas a Vencerse</Text>
        <ErrorMessage message={error} onRetry={refetch} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Marcas Certificadas Próximas a Vencerse</Text>
        <Text style={styles.emptyText}>
          No hay marcas certificadas próximas a vencerse en los próximos 90 días.
        </Text>
      </Card>
    );
  }

  const filteredData = data.filter((marca) => {
    const query = searchQuery.toLowerCase();
    const clienteNombre = getClienteNombre(marca.cliente).toLowerCase();
    const empleadoNombre = getEmpleadoNombre(marca.empleado).toLowerCase();
    const marcaNombre = marca.nombre_marca.toLowerCase();
    return clienteNombre.includes(query) || empleadoNombre.includes(query) || marcaNombre.includes(query);
  });

  const sortedData = [...filteredData].sort((a, b) => a.dias_restantes - b.dias_restantes);

  const renderItem = ({ item }: { item: MarcaCertificada }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text style={styles.marcaNombre}>{item.nombre_marca}</Text>
          {getUrgenciaBadge(item.dias_restantes)}
        </View>

        <View style={styles.rowInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{getClienteNombre(item.cliente)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Empleado:</Text>
            <Text style={styles.infoValue}>{getEmpleadoNombre(item.empleado)}</Text>
          </View>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Certificación:</Text>
              <Text style={styles.dateValue}>{formatDate(item.fecha_certificacion)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Vencimiento:</Text>
              <Text style={[styles.dateValue, item.dias_restantes <= 30 && styles.dateValueUrgent]}>
                {formatDate(item.fecha_vencimiento)}
              </Text>
            </View>
          </View>

          <View style={styles.diasContainer}>
            <Text style={styles.diasLabel}>Días restantes:</Text>
            <Text style={[styles.diasValue, item.dias_restantes <= 30 && styles.diasValueUrgent]}>
              {item.dias_restantes}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Card>
      <Text style={styles.title}>Marcas Certificadas Próximas a Vencerse</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por marca, cliente o empleado..."
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
  marcaNombre: {
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
  datesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  dateItem: {
    flex: 1,
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
  dateValueUrgent: {
    color: colors.danger,
  },
  diasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  diasLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  diasValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  diasValueUrgent: {
    color: colors.danger,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 24,
  },
});

