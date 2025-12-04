import { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useSolicitudDetalle } from '@/hooks/useSolicitudes';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import Badge from '../dashboard/Badge';
import Card from '../dashboard/Card';
import ErrorMessage from '../dashboard/ErrorMessage';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from '../solicitudes/Modal';

interface DetalleProcesoModalProps {
  visible: boolean;
  solicitud: Solicitud;
  onClose: () => void;
  onVerSeguimiento: () => void;
  onSuccess?: () => void;
}

export default function DetalleProcesoModal({
  visible,
  solicitud,
  onClose,
  onVerSeguimiento,
  onSuccess,
}: DetalleProcesoModalProps) {
  const { solicitud: detalle, loading, error, refetch } = useSolicitudDetalle(
    visible ? solicitud.id_orden_servicio : null, // Solo pasar el ID cuando el modal está visible
    false // No hacer fetch automático, lo haremos manualmente cuando el modal se abra
  );
  const [descargando, setDescargando] = useState(false);
  const [intentoFallido, setIntentoFallido] = useState(false);

  useEffect(() => {
    if (visible && solicitud.id_orden_servicio) {
      setIntentoFallido(false);
      // Pequeño delay para asegurar que el modal esté completamente visible
      const timer = setTimeout(() => {
        refetch().catch(() => {
          setIntentoFallido(true);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, solicitud.id_orden_servicio]); // refetch está memoizado, no necesita estar en dependencias

  const getEstadoVariant = (estado: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('finalizada') || estadoLower.includes('finalizado')) {
      return 'success';
    }
    if (estadoLower.includes('anulada') || estadoLower.includes('anulado')) {
      return 'error';
    }
    if (estadoLower.includes('rechazada') || estadoLower.includes('rechazado')) {
      return 'error';
    }
    if (estadoLower.includes('pendiente')) {
      return 'warning';
    }
    return 'info';
  };

  const handleDescargarArchivos = async () => {
    try {
      setDescargando(true);
      const { blob, filename } = await solicitudesApiService.descargarArchivosSolicitudZip(
        solicitud.id_orden_servicio
      );

      // Manejo para web
      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        if (onSuccess) {
          onSuccess();
        }
        setDescargando(false);
        return;
      }

      // Manejo para móvil
      if (!FileSystem.documentDirectory) {
        throw new Error('No se pudo acceder al directorio de documentos');
      }

      // Convertir blob a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          if (!reader.result) {
            throw new Error('No se pudo leer el archivo');
          }

          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];

          if (!base64Data) {
            throw new Error('Error al convertir el archivo a base64');
          }

          // Guardar archivo
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Compartir archivo
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/zip',
              dialogTitle: 'Descargar archivos de la solicitud',
            });
          } else {
            throw new Error('La función de compartir no está disponible en este dispositivo');
          }

          if (onSuccess) {
            onSuccess();
          }
        } catch (err: any) {
          const mensaje = obtenerMensajeErrorUsuario(err);
          alert(`Error al descargar archivos: ${mensaje}`);
        } finally {
          setDescargando(false);
        }
      };
      reader.onerror = () => {
        setDescargando(false);
        alert('Error al leer el archivo');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setDescargando(false);
      const mensaje = obtenerMensajeErrorUsuario(err);
      alert(`Error al descargar archivos: ${mensaje}`);
    }
  };

  const estadoVariant = getEstadoVariant(solicitud.estado);

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={onVerSeguimiento}
        disabled={loading}>
        <Text style={styles.actionButtonText}>📋 Ver Seguimiento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={handleDescargarArchivos}
        disabled={loading || descargando}>
        <Text style={styles.actionButtonText}>
          {descargando ? '⏳ Descargando...' : '📥 Descargar Documentos'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Detalle de Proceso - ${solicitud.expediente}`}
      footer={footer}>
      {loading ? (
        <LoadingSpinner />
      ) : error && intentoFallido ? (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              No se pudo cargar el detalle completo, pero puedes ver la información básica a continuación.
            </Text>
            <Text style={styles.errorSubtext}>
              {typeof error === 'string' ? error : error?.message || 'Error desconocido'}
            </Text>
          </View>
          {/* Mostrar información básica disponible */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Estado del Proceso</Text>
                <Badge label={solicitud.estado} variant={estadoVariant} />
              </View>
            </Card>
          </View>
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
                <Text style={styles.label}>Marca:</Text>
                <Text style={styles.value}>{solicitud.marca || 'Sin marca'}</Text>
              </View>
              {solicitud.encargado && solicitud.encargado !== 'Sin asignar' && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Encargado:</Text>
                  <Text style={styles.value}>{solicitud.encargado}</Text>
                </View>
              )}
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
        </View>
      ) : error ? (
        <ErrorMessage message={typeof error === 'string' ? error : error?.message || 'Error desconocido'} onRetry={refetch} />
      ) : (
        <View style={styles.container}>
          {/* Estado */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Estado del Proceso</Text>
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
                <Text style={styles.label}>Marca:</Text>
                <Text style={styles.value}>{solicitud.marca || 'Sin marca'}</Text>
              </View>

              {solicitud.encargado && solicitud.encargado !== 'Sin asignar' && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Encargado:</Text>
                  <Text style={styles.value}>{solicitud.encargado}</Text>
                </View>
              )}

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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  motivoText: {
    color: colors.error,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary || '#6B7280',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorSubtext: {
    color: colors.gray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

