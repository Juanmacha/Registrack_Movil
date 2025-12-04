import { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useHistorialSeguimiento } from '@/hooks/useSolicitudes';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import Card from '../dashboard/Card';
import ErrorMessage from '../dashboard/ErrorMessage';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from '../solicitudes/Modal';

interface HistorialSeguimientoModalProps {
  visible: boolean;
  solicitud: Solicitud;
  onClose: () => void;
}

export default function HistorialSeguimientoModal({
  visible,
  solicitud,
  onClose,
}: HistorialSeguimientoModalProps) {
  const { historial, loading, error, refetch } = useHistorialSeguimiento(
    solicitud.id_orden_servicio,
    visible
  );
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    if (visible && solicitud.id_orden_servicio) {
      // Pequeño delay para asegurar que el modal esté completamente visible
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, solicitud.id_orden_servicio]); // refetch está memoizado, no necesita estar en dependencias

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const handleDescargarArchivos = async (idSeguimiento: number) => {
    try {
      setDescargandoId(idSeguimiento);
      const blob = await solicitudesApiService.descargarArchivosSeguimiento(idSeguimiento);

      // Manejo para web
      if (Platform.OS === 'web') {
        const filename = `seguimiento_${idSeguimiento}_archivos.zip`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setDescargandoId(null);
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
          const filename = `seguimiento_${idSeguimiento}_archivos.zip`;
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Compartir archivo
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/zip',
              dialogTitle: 'Descargar archivos de seguimiento',
            });
          } else {
            throw new Error('La función de compartir no está disponible en este dispositivo');
          }
        } catch (err: any) {
          const mensaje = obtenerMensajeErrorUsuario(err);
          alert(`Error al descargar archivos: ${mensaje}`);
        } finally {
          setDescargandoId(null);
        }
      };
      reader.onerror = () => {
        setDescargandoId(null);
        alert('Error al leer el archivo');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setDescargandoId(null);
      const mensaje = obtenerMensajeErrorUsuario(err);
      alert(`Error al descargar archivos: ${mensaje}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const tieneArchivos = item.documentos_adjuntos && Object.keys(item.documentos_adjuntos).length > 0;
    const estaDescargando = descargandoId === item.id_seguimiento;

    return (
      <Card style={styles.seguimientoCard}>
        <View style={styles.seguimientoHeader}>
          <View style={styles.seguimientoHeaderLeft}>
            <Text style={styles.seguimientoTitulo}>{item.titulo}</Text>
            <Text style={styles.seguimientoFecha}>{formatFecha(item.fecha || item.fecha_registro)}</Text>
          </View>
          {item.nuevo_estado && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{item.nuevo_estado}</Text>
            </View>
          )}
        </View>

        {item.descripcion && (
          <View style={styles.seguimientoBody}>
            <Text style={styles.seguimientoDescripcion}>{item.descripcion}</Text>
          </View>
        )}

        {item.observaciones && (
          <View style={styles.seguimientoBody}>
            <Text style={styles.observacionesLabel}>Observaciones:</Text>
            <Text style={styles.observacionesText}>{item.observaciones}</Text>
          </View>
        )}

        {item.usuario && (
          <View style={styles.seguimientoFooter}>
            <Text style={styles.usuarioText}>Por: {item.usuario}</Text>
          </View>
        )}

        {tieneArchivos && (
          <TouchableOpacity
            style={styles.descargarButton}
            onPress={() => handleDescargarArchivos(item.id_seguimiento)}
            disabled={estaDescargando}>
            <Text style={styles.descargarButtonText}>
              {estaDescargando ? '⏳ Descargando...' : '📥 Descargar Archivos'}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Historial de Seguimiento - ${solicitud.expediente}`}>
      {loading ? (
        <LoadingSpinner message="Cargando historial de seguimiento..." />
      ) : error ? (
        <ErrorMessage message={typeof error === 'string' ? error : error?.message || 'Error desconocido'} onRetry={refetch} />
      ) : historial.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay seguimientos registrados para este proceso.</Text>
        </View>
      ) : (
        <FlatList
          data={historial}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_seguimiento?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  seguimientoCard: {
    marginBottom: 16,
    padding: 16,
  },
  seguimientoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  seguimientoHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  seguimientoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  seguimientoFecha: {
    fontSize: 12,
    color: colors.gray,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  seguimientoBody: {
    marginBottom: 12,
  },
  seguimientoDescripcion: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  observacionesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 14,
    color: '#000',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  seguimientoFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  usuarioText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  descargarButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  descargarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
});

