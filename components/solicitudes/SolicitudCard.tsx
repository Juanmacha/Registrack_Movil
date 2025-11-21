import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';

import Badge from '../dashboard/Badge';
import Card from '../dashboard/Card';

interface SolicitudCardProps {
  solicitud: Solicitud;
  onPress: () => void;
}

const getEstadoVariant = (estado: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('finalizada') || estadoLower.includes('finalizado')) {
    return 'success';
  }
  if (estadoLower.includes('anulada') || estadoLower.includes('anulado') || estadoLower.includes('rechazada') || estadoLower.includes('rechazado')) {
    return 'error';
  }
  if (estadoLower.includes('pendiente')) {
    return 'warning';
  }
  if (estadoLower.includes('proceso') || estadoLower.includes('verificación') || estadoLower.includes('procesamiento')) {
    return 'info';
  }
  return 'default';
};

export default function SolicitudCard({ solicitud, onPress }: SolicitudCardProps) {
  const estadoVariant = getEstadoVariant(solicitud.estado);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.expediente}>{solicitud.expediente}</Text>
            <Badge label={solicitud.estado} variant={estadoVariant} />
          </View>
          <Text style={styles.tipoSolicitud}>{solicitud.tipoSolicitud}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>Titular:</Text>
            <Text style={styles.value}>{solicitud.titular}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Marca:</Text>
            <Text style={styles.value}>{solicitud.marca}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Encargado:</Text>
            <Text style={[styles.value, solicitud.encargado === 'Sin asignar' && styles.sinAsignar]}>
              {solicitud.encargado}
            </Text>
          </View>

          {solicitud.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{solicitud.email}</Text>
            </View>
          )}

          {solicitud.fechaCreacion && (
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>
                {new Date(solicitud.fechaCreacion).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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

