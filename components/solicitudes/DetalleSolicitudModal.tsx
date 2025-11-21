import { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSolicitudDetalle, useHistorialSeguimiento } from '@/hooks/useSolicitudes';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';

import Badge from '../dashboard/Badge';
import Card from '../dashboard/Card';
import ErrorMessage from '../dashboard/ErrorMessage';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface DetalleSolicitudModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onEditar?: () => void;
  onAnular?: () => void;
  onAsignarEmpleado?: () => void;
  onAgregarSeguimiento?: () => void;
  onDescargarArchivos?: () => void;
}

export default function DetalleSolicitudModal({
  visible,
  solicitud,
  onClose,
  onEditar,
  onAnular,
  onAsignarEmpleado,
  onAgregarSeguimiento,
  onDescargarArchivos,
}: DetalleSolicitudModalProps) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  
  const { solicitud: detalle, loading, error, refetch } = useSolicitudDetalle(
    solicitud?.id_orden_servicio || null,
    visible && solicitud !== null
  );

  const { historial, loading: loadingHistorial, refetch: refetchHistorial } = useHistorialSeguimiento(
    solicitud ? solicitud.id_orden_servicio : null,
    mostrarHistorial
  );

  useEffect(() => {
    if (visible && solicitud) {
      refetch();
    }
  }, [visible, solicitud]);

  if (!solicitud) {
    return null;
  }

  const puedeEditar = !['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'].includes(
    solicitud.estado
  );

  const puedeAnular = !['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'].includes(
    solicitud.estado
  );

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

  const estadoVariant = getEstadoVariant(solicitud.estado);

  const footer = (
    <View style={styles.footerActions}>
      {onDescargarArchivos && (
        <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={onDescargarArchivos}>
          <Text style={styles.actionButtonText} numberOfLines={1}>📥 Descargar</Text>
        </TouchableOpacity>
      )}
      {onAgregarSeguimiento && (
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={onAgregarSeguimiento}>
          <Text style={styles.actionButtonText} numberOfLines={1}>➕ Seguimiento</Text>
        </TouchableOpacity>
      )}
      {onAsignarEmpleado && (
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={onAsignarEmpleado}>
          <Text style={styles.actionButtonText} numberOfLines={1}>👤 Asignar</Text>
        </TouchableOpacity>
      )}
      {onEditar && puedeEditar && (
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onEditar}>
          <Text style={styles.actionButtonText} numberOfLines={1}>✏️ Editar</Text>
        </TouchableOpacity>
      )}
      {onAnular && puedeAnular && (
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={onAnular}>
          <Text style={styles.actionButtonText} numberOfLines={1}>❌ Anular</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose} title={`Detalle de Solicitud - ${solicitud.expediente}`} footer={footer}>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <View style={styles.container}>
          {/* Estado */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Estado de la Solicitud</Text>
                <Badge label={solicitud.estado} variant={estadoVariant} />
              </View>
            </Card>
          </View>

          {/* Información General */}
          <View style={styles.section}>
            <Card>
              <Text style={styles.sectionTitle}>Información General</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Expediente:</Text>
                <Text style={styles.value}>{solicitud.expediente}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Tipo de Solicitud:</Text>
                <Text style={styles.value}>{solicitud.tipoSolicitud}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Titular:</Text>
                <Text style={styles.value}>{solicitud.titular}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Marca:</Text>
                <Text style={styles.value}>{solicitud.marca}</Text>
              </View>

              {solicitud.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{solicitud.email}</Text>
                </View>
              )}

              {solicitud.telefono && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>{solicitud.telefono}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Encargado:</Text>
                <Text style={[styles.value, solicitud.encargado === 'Sin asignar' && styles.sinAsignar]}>
                  {solicitud.encargado}
                </Text>
              </View>

              {solicitud.fechaCreacion && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Fecha de Creación:</Text>
                  <Text style={styles.value}>
                    {new Date(solicitud.fechaCreacion).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
            </Card>
          </View>

          {/* Información Adicional del Detalle */}
          {detalle && (
            <>
              {(detalle.pais || detalle.ciudad || detalle.direccion) && (
                <View style={styles.section}>
                  <Card>
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    
                    {detalle.pais && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>País:</Text>
                        <Text style={styles.value}>{detalle.pais}</Text>
                      </View>
                    )}

                    {detalle.ciudad && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Ciudad:</Text>
                        <Text style={styles.value}>{detalle.ciudad}</Text>
                      </View>
                    )}

                    {detalle.direccion && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Dirección:</Text>
                        <Text style={styles.value}>{detalle.direccion}</Text>
                      </View>
                    )}
                  </Card>
                </View>
              )}

              {(detalle.tipodedocumento || detalle.numerodedocumento) && (
                <View style={styles.section}>
                  <Card>
                    <Text style={styles.sectionTitle}>Documentación</Text>
                    
                    {detalle.tipodedocumento && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Tipo de Documento:</Text>
                        <Text style={styles.value}>{detalle.tipodedocumento}</Text>
                      </View>
                    )}

                    {detalle.numerodedocumento && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Número de Documento:</Text>
                        <Text style={styles.value}>{detalle.numerodedocumento}</Text>
                      </View>
                    )}

                    {detalle.tipodepersona && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Tipo de Persona:</Text>
                        <Text style={styles.value}>{detalle.tipodepersona}</Text>
                      </View>
                    )}
                  </Card>
                </View>
              )}

              {detalle.motivo_anulacion && (
                <View style={styles.section}>
                  <Card>
                    <Text style={styles.sectionTitle}>Información de Anulación</Text>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Motivo:</Text>
                      <Text style={[styles.value, styles.motivoText]}>{detalle.motivo_anulacion}</Text>
                    </View>

                    {detalle.fecha_anulacion && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Fecha de Anulación:</Text>
                        <Text style={styles.value}>
                          {new Date(detalle.fecha_anulacion).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    )}
                  </Card>
                </View>
              )}
            </>
          )}

          {/* Historial de Seguimiento */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial de Seguimiento</Text>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => {
                    setMostrarHistorial(!mostrarHistorial);
                    if (!mostrarHistorial) {
                      refetchHistorial();
                    }
                  }}>
                  <Text style={styles.toggleButtonText}>
                    {mostrarHistorial ? 'Ocultar' : 'Mostrar'} Historial
                  </Text>
                </TouchableOpacity>
              </View>

              {mostrarHistorial && (
                <View style={styles.historialContainer}>
                  {loadingHistorial ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : historial.length === 0 ? (
                    <Text style={styles.emptyText}>No hay seguimientos registrados</Text>
                  ) : (
                    historial.map((seguimiento, index) => (
                      <View key={seguimiento.id_seguimiento || index} style={styles.seguimientoItem}>
                        <View style={styles.seguimientoHeader}>
                          <Text style={styles.seguimientoTitulo}>{seguimiento.titulo}</Text>
                          <Text style={styles.seguimientoFecha}>
                            {new Date(seguimiento.fecha || seguimiento.fecha_registro || '').toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.seguimientoDescripcion}>{seguimiento.descripcion}</Text>
                        {seguimiento.observaciones && (
                          <Text style={styles.seguimientoObservaciones}>
                            <Text style={styles.observacionesLabel}>Observaciones: </Text>
                            {seguimiento.observaciones}
                          </Text>
                        )}
                        {seguimiento.nuevo_estado && (
                          <View style={styles.estadoCambio}>
                            <Text style={styles.estadoCambioText}>
                              Estado cambiado a: <Text style={styles.estadoCambioValue}>{seguimiento.nuevo_estado}</Text>
                            </Text>
                          </View>
                        )}
                        {seguimiento.usuario && (
                          <Text style={styles.seguimientoUsuario}>Por: {seguimiento.usuario}</Text>
                        )}
                      </View>
                    ))
                  )}
                </View>
              )}
            </Card>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
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
  motivoText: {
    color: colors.danger,
  },
  historialContainer: {
    marginTop: 12,
    gap: 12,
  },
  seguimientoItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  seguimientoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  seguimientoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    flex: 1,
  },
  seguimientoFecha: {
    fontSize: 12,
    color: colors.gray,
  },
  seguimientoDescripcion: {
    fontSize: 14,
    color: colors.primaryDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  seguimientoObservaciones: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  observacionesLabel: {
    fontWeight: '600',
  },
  estadoCambio: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  estadoCambioText: {
    fontSize: 13,
    color: colors.primaryDark,
  },
  estadoCambioValue: {
    fontWeight: '700',
  },
  seguimientoUsuario: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    maxWidth: '48%',
    flexBasis: 'auto',
  },
  primaryButton: {
    backgroundColor: colors.primaryDark,
  },
  secondaryButton: {
    backgroundColor: colors.accent,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  downloadButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

