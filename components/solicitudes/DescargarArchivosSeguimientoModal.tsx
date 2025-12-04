import { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useHistorialSeguimiento } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Solicitud, Seguimiento } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface DescargarArchivosSeguimientoModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
}

export default function DescargarArchivosSeguimientoModal({
  visible,
  solicitud,
  onClose,
}: DescargarArchivosSeguimientoModalProps) {
  const [seguimientosConArchivos, setSeguimientosConArchivos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState<number | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const { historial, loading: loadingHistorial, refetch: refetchHistorial } = useHistorialSeguimiento(
    solicitud?.id_orden_servicio || null,
    false // No auto-fetch, lo haremos manualmente
  );

  // Cargar historial cuando el modal se abre
  useEffect(() => {
    if (visible && solicitud?.id_orden_servicio) {
      refetchHistorial();
    } else {
      // Limpiar cuando se cierra
      setSeguimientosConArchivos([]);
    }
  }, [visible, solicitud?.id_orden_servicio]);

  // Filtrar seguimientos con archivos cuando el historial cambia
  useEffect(() => {
    // Solo procesar si no está cargando y hay datos
    if (!loadingHistorial && historial) {
      if (historial.length > 0) {
        // Filtrar solo seguimientos que tienen documentos adjuntos
        const conArchivos = historial.filter((s) => {
          const docs = s.documentos_adjuntos;
          // Verificar que documentos_adjuntos existe y tiene contenido
          if (!docs) return false;
          if (typeof docs === 'string') {
            // Si es string, verificar que no esté vacío o sea 'null'
            return docs !== '' && docs !== 'null' && docs.trim() !== '';
          }
          if (typeof docs === 'object') {
            // Si es objeto, verificar que tenga keys
            return Object.keys(docs).length > 0;
          }
          return false;
        });
        setSeguimientosConArchivos(conArchivos);
      } else {
        setSeguimientosConArchivos([]);
      }
    }
  }, [historial, loadingHistorial]);

  // Convertir blob a base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleDescargar = async (seguimiento: Seguimiento) => {
    if (!seguimiento.id_seguimiento) return;

    setDescargando(seguimiento.id_seguimiento);
    try {
      const blob = await solicitudesApiService.descargarArchivosSeguimiento(seguimiento.id_seguimiento);
      
      // Validar que el blob sea válido
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('El archivo recibido no es válido');
      }
      
      const filename = `seguimiento_${seguimiento.id_seguimiento}_archivos.zip`;

      // En web, descargar directamente usando el blob
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.URL !== 'undefined') {
        let url: string | null = null;
        try {
          url = window.URL.createObjectURL(blob);
          if (!url) {
            throw new Error('No se pudo crear la URL del archivo');
          }
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          // Usar setTimeout para asegurar que el click se procese antes de remover
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
            if (url) {
              window.URL.revokeObjectURL(url);
            }
          }, 100);
          
          setAlertConfig({
            visible: true,
            title: 'Descarga completada',
            message: 'El archivo se ha descargado correctamente.',
            type: 'success',
          });
        } catch (urlError) {
          if (url) {
            window.URL.revokeObjectURL(url);
          }
          throw urlError;
        }
        return;
      }

      // En móvil, usar expo-file-system y expo-sharing
      const base64 = await blobToBase64(blob);
      const base64Data = base64.split(',')[1]; // Remover el prefijo data:application/zip;base64,

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        setAlertConfig({
          visible: true,
          title: 'Descarga completada',
          message: `El archivo se ha guardado en: ${fileUri}`,
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error al descargar archivos:', error);
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al descargar',
        message: message || 'No se pudieron descargar los archivos. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setDescargando(null);
    }
  };

  if (!solicitud) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={`Descargar Archivos - ${solicitud.expediente}`}>
        {loadingHistorial ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Cargando seguimientos...</Text>
          </View>
        ) : seguimientosConArchivos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay seguimientos con archivos adjuntos</Text>
            <Text style={styles.emptySubtext}>
              Solo se pueden descargar archivos de seguimientos que tengan documentos adjuntos.
            </Text>
          </View>
        ) : (
          <View style={styles.container}>
            <Text style={styles.infoText}>
              Selecciona el seguimiento del cual deseas descargar los archivos:
            </Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {seguimientosConArchivos.map((item) => (
                <TouchableOpacity
                  key={String(item.id_seguimiento || Math.random())}
                  style={styles.seguimientoItem}
                  onPress={() => handleDescargar(item)}
                  disabled={descargando === item.id_seguimiento}>
                  <View style={styles.seguimientoContent}>
                    <Text style={styles.seguimientoTitulo}>{item.titulo}</Text>
                    <Text style={styles.seguimientoFecha}>
                      {new Date(item.fecha || item.fecha_registro || '').toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {item.descripcion && (
                      <Text style={styles.seguimientoDescripcion} numberOfLines={2}>
                        {item.descripcion}
                      </Text>
                    )}
                  </View>
                  <View style={styles.downloadIcon}>
                    {descargando === item.id_seguimiento ? (
                      <ActivityIndicator size="small" color={colors.primaryDark} />
                    ) : (
                      <Text style={styles.downloadIconText}>📥</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  seguimientoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
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
  seguimientoContent: {
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
    marginBottom: 8,
  },
  seguimientoDescripcion: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
  downloadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  downloadIconText: {
    fontSize: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 16,
    textAlign: 'center',
  },
});

