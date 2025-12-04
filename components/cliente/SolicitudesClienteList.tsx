import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';

import Badge from '../dashboard/Badge';
import Card from '../dashboard/Card';

interface SolicitudesClienteListProps {
  solicitudes: Solicitud[];
  onSolicitudPress: (solicitud: Solicitud) => void;
}

export default function SolicitudesClienteList({
  solicitudes,
  onSolicitudPress,
}: SolicitudesClienteListProps) {
  const getEstadoVariant = (estado: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('finalizada') || estadoLower.includes('finalizado')) {
      return 'success';
    }
    if (estadoLower.includes('anulada') || estadoLower.includes('anulado') || 
        estadoLower.includes('rechazada') || estadoLower.includes('rechazado')) {
      return 'error';
    }
    if (estadoLower.includes('pendiente')) {
      return 'warning';
    }
    if (estadoLower.includes('proceso') || estadoLower.includes('verificación') || 
        estadoLower.includes('procesamiento')) {
      return 'info';
    }
    return 'default';
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const renderItem = ({ item }: { item: Solicitud }) => {
    const estadoVariant = getEstadoVariant(item.estado);

    return (
      <TouchableOpacity onPress={() => onSolicitudPress(item)} activeOpacity={0.7}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.expediente}>{item.expediente}</Text>
              <Badge label={item.estado} variant={estadoVariant} />
            </View>
            <Text style={styles.tipoSolicitud}>{item.tipoSolicitud}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.value}>{item.marca || 'Sin marca'}</Text>
            </View>
            {item.fechaCreacion && (
              <View style={styles.row}>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{formatFecha(item.fechaCreacion)}</Text>
              </View>
            )}
            {item.encargado && item.encargado !== 'Sin asignar' && (
              <View style={styles.row}>
                <Text style={styles.label}>Encargado:</Text>
                <Text style={[styles.value, item.encargado === 'Sin asignar' && styles.sinAsignar]}>
                  {item.encargado}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={solicitudes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  expediente: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  tipoSolicitud: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'right',
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  sinAsignar: {
    color: colors.gray,
    fontStyle: 'italic',
  },
});

