import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';

import Badge from '../dashboard/Badge';
import Card from '../dashboard/Card';

interface ProcesoActivoCardProps {
  solicitudes: Solicitud[];
  onSolicitudPress: (solicitud: Solicitud) => void;
  onVerSeguimiento: (solicitud: Solicitud) => void;
  onVerPagos?: (solicitud: Solicitud) => void;
}

interface ProcessState {
  id: number;
  name: string;
  status_key: string;
  orden: number;
  es_final?: boolean;
}

export default function ProcesoActivoCard({
  solicitudes,
  onSolicitudPress,
  onVerSeguimiento,
  onVerPagos,
}: ProcesoActivoCardProps) {
  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const obtenerEstadosDelServicio = (solicitud: Solicitud): ProcessState[] => {
    if (!solicitud.servicioCompleto) return [];
    
    // El servicio puede tener process_states en diferentes formatos
    const servicio = solicitud.servicioCompleto as any;
    const processStates = servicio.process_states || servicio.processStates || [];
    
    // Ordenar por orden
    return processStates
      .map((state: any) => ({
        id: state.id || state.id_proceso,
        name: state.name || state.nombre,
        status_key: state.status_key || state.statusKey,
        orden: state.orden || state.order_number || 0,
        es_final: state.es_final || state.esFinal || false,
      }))
      .sort((a: ProcessState, b: ProcessState) => a.orden - b.orden);
  };

  const encontrarEstadoActual = (solicitud: Solicitud, estados: ProcessState[]): number => {
    if (estados.length === 0) return -1;
    
    const estadoActual = solicitud.estado || '';
    
    // Mapeo de estados comunes
    const estadoMapping: Record<string, string> = {
      'En revisión': 'en_proceso',
      'Pendiente': 'recibida',
      'En proceso': 'en_proceso',
      'Finalizado': 'finalizado',
      'Aprobado': 'aprobado',
      'Rechazado': 'rechazado',
      'Anulado': 'anulado',
    };
    
    // Buscar por nombre exacto
    let idx = estados.findIndex(
      (e) => e.name === estadoActual || e.status_key === estadoActual
    );
    
    // Si no se encuentra, buscar por mapeo
    if (idx === -1) {
      const statusKeyMapeado = estadoMapping[estadoActual];
      if (statusKeyMapeado) {
        idx = estados.findIndex((e) => e.status_key === statusKeyMapeado);
      }
    }
    
    // Si no se encuentra, usar el primer estado como fallback
    if (idx === -1 && estados.length > 0) {
      idx = 0;
    }
    
    return idx;
  };

  const obtenerProximaAccion = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('recibida') || estadoLower.includes('recibido')) {
      return 'Revisión de documentos';
    }
    if (estadoLower.includes('verificación') || estadoLower.includes('verificacion')) {
      return 'Verificación de derechos';
    }
    if (estadoLower.includes('pago') || estadoLower.includes('pagos')) {
      return 'Procesamiento de pago';
    }
    if (estadoLower.includes('consulta')) {
      return 'Consulta en base de datos';
    }
    if (estadoLower.includes('aprobada') || estadoLower.includes('aprobado')) {
      return 'Finalización del proceso';
    }
    return 'Seguimiento del proceso';
  };

  const renderTimeline = (solicitud: Solicitud) => {
    const estados = obtenerEstadosDelServicio(solicitud);
    if (estados.length === 0) {
      // Si no hay estados del servicio, mostrar un mensaje simple
      return (
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineEmptyText}>
            Información de estados no disponible
          </Text>
        </View>
      );
    }
    
    const estadoActualIdx = encontrarEstadoActual(solicitud, estados);
    
    return (
      <View style={styles.timelineContainer}>
        {estados.map((estado, idx) => {
          const esCompletado = idx < estadoActualIdx;
          const esActual = idx === estadoActualIdx;
          const esPendiente = idx > estadoActualIdx;
          
          return (
            <View key={estado.id} style={styles.timelineItem}>
              <View style={styles.timelineContent}>
                <View
                  style={[
                    styles.timelineCircle,
                    esCompletado && styles.timelineCircleCompleted,
                    esActual && styles.timelineCircleActive,
                    esPendiente && styles.timelineCirclePending,
                  ]}>
                  <Text
                    style={[
                      styles.timelineNumber,
                      esActual && styles.timelineNumberActive,
                      esPendiente && styles.timelineNumberPending,
                    ]}>
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    esActual && styles.timelineLabelActive,
                    esPendiente && styles.timelineLabelPending,
                  ]}
                  numberOfLines={2}>
                  {estado.name}
                </Text>
              </View>
              {idx < estados.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    esCompletado || esActual ? styles.timelineLineCompleted : styles.timelineLinePending,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Solicitud }) => {
    const estados = obtenerEstadosDelServicio(item);
    const estadoActualIdx = encontrarEstadoActual(item, estados);
    const estadoActual = estados[estadoActualIdx] || { name: item.estado };
    
    return (
      <TouchableOpacity onPress={() => onSolicitudPress(item)} activeOpacity={0.9}>
        <Card style={styles.card}>
          {/* Encabezado con fondo azul claro */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <View style={styles.marcaContainer}>
                <Text style={styles.marcaText}>{item.marca || 'Sin marca'}</Text>
                <Text style={styles.flagIcon}>🇨🇴</Text>
              </View>
              <Text style={styles.expediente}>Expediente: {item.expediente}</Text>
              <Text style={styles.servicio}>Servicio: {item.tipoSolicitud}</Text>
              <Text style={styles.representante}>
                Representante: {item.titular || 'Sin representante'}
              </Text>
              <Text style={styles.fechaCreacion}>
                Fecha de creación: {formatFecha(item.fechaCreacion)}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.ultimaActualizacionLabel}>Última actualización</Text>
              <Text style={styles.ultimaActualizacionFecha}>
                {formatFecha(item.fechaSolicitud || item.fechaCreacion)}
              </Text>
            </View>
          </View>
          
          {/* Estado actual destacado */}
          <View style={styles.estadoContainer}>
            <Text style={styles.estadoLabel}>Estado actual:</Text>
            <Badge label={item.estado} variant="info" />
          </View>
          
          {/* Timeline */}
          {renderTimeline(item)}
          
          {/* Detalles del proceso actual */}
          <View style={styles.detallesContainer}>
            <Text style={styles.detallesTitle}>Detalles del proceso actual</Text>
            <View style={styles.detallesGrid}>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Etapa actual:</Text>
                <Text style={styles.detalleValue}>{estadoActual.name}</Text>
              </View>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Próxima acción:</Text>
                <Text style={styles.detalleValue}>{obtenerProximaAccion(item.estado)}</Text>
              </View>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Tiempo estimado:</Text>
                <Text style={styles.detalleValue}>15-30 días</Text>
              </View>
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Responsable:</Text>
                <Text style={[styles.detalleValue, item.encargado === 'Sin asignar' && styles.sinAsignar]}>
                  {item.encargado || 'Sin asignar'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onVerSeguimiento(item);
              }}>
              <Text style={styles.actionButtonIcon}>🕐</Text>
              <Text style={styles.actionButtonText}>Ver seguimientos</Text>
            </TouchableOpacity>
            {onVerPagos && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onVerPagos(item);
                }}>
                <Text style={styles.actionButtonIcon}>💳</Text>
                <Text style={styles.actionButtonText}>Ver historial de pagos</Text>
              </TouchableOpacity>
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
    marginBottom: 20,
    overflow: 'hidden',
  },
  headerContainer: {
    backgroundColor: '#f4f8ff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  marcaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  marcaText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  flagIcon: {
    fontSize: 16,
  },
  expediente: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  servicio: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  representante: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  fechaCreacion: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  ultimaActualizacionLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  ultimaActualizacionFecha: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  estadoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  timelineContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  timelineContent: {
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  timelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 3,
  },
  timelineCircleCompleted: {
    backgroundColor: colors.primary,
  },
  timelineCircleActive: {
    backgroundColor: colors.primaryDark,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  timelineCirclePending: {
    backgroundColor: '#E5E7EB',
  },
  timelineNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineNumberActive: {
    fontSize: 16,
  },
  timelineNumberPending: {
    color: colors.gray,
  },
  timelineLabel: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 32,
  },
  timelineLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  timelineLabelPending: {
    color: colors.gray,
  },
  timelineEmptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: 1,
  },
  timelineLineCompleted: {
    backgroundColor: colors.primary,
  },
  timelineLinePending: {
    backgroundColor: '#E5E7EB',
  },
  detallesContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detallesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  detallesGrid: {
    gap: 12,
  },
  detalleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detalleLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
    flex: 1,
  },
  detalleValue: {
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

