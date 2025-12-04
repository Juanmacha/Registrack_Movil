import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useSolicitudesFinalizadas } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';
import { tieneRolAdministrativo } from '@/utils/roles';

import AdminMenu from '@/components/AdminMenu';
import AsignarEmpleadoModal from '@/components/solicitudes/AsignarEmpleadoModal';
import DescargarArchivosSeguimientoModal from '@/components/solicitudes/DescargarArchivosSeguimientoModal';
import DetalleSolicitudModal from '@/components/solicitudes/DetalleSolicitudModal';
import SolicitudesList from '@/components/solicitudes/SolicitudesList';

export default function SolicitudesFinalizadasScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { solicitudes, loading, error, refetch } = useSolicitudesFinalizadas();
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarAsignarEmpleado, setMostrarAsignarEmpleado] = useState(false);
  const [mostrarDescargarArchivos, setMostrarDescargarArchivos] = useState(false);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return null;
  }

  if (!tieneRolAdministrativo(user)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tienes permisos para acceder a esta sección.</Text>
      </View>
    );
  }

  const handleSolicitudPress = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarDetalle(true);
  };

  const handleCloseDetalle = () => {
    setMostrarDetalle(false);
    setSolicitudSeleccionada(null);
  };

  const handleAsignarEmpleado = () => {
    setMostrarDetalle(false);
    setMostrarAsignarEmpleado(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDescargarArchivos = () => {
    setMostrarDetalle(false);
    setMostrarDescargarArchivos(true);
  };

  const handleDescargarArchivosZip = async () => {
    if (!solicitudSeleccionada?.id_orden_servicio) {
      Alert.alert('Error', 'No se pudo identificar la solicitud');
      return;
    }

    try {
      const idOrdenServicio = solicitudSeleccionada.id_orden_servicio;
      const { blob, filename } = await solicitudesApiService.descargarArchivosSolicitudZip(idOrdenServicio);

      if (Platform.OS === 'web') {
        // Descarga directa en web
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Alert.alert('Éxito', 'Archivos descargados correctamente');
      } else {
        // Descarga en móvil usando expo-file-system y expo-sharing
        const blobToBase64 = (blob: Blob): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
              } else {
                reject(new Error('No se pudo leer el archivo'));
              }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(blob);
          });
        };

        const base64 = await blobToBase64(blob);
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: 'base64' as any,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
        }
      }
    } catch (error) {
      const mensaje = obtenerMensajeErrorUsuario(error);
      Alert.alert('Error al descargar', mensaje);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Solicitudes Finalizadas</Text>
            <Text style={styles.headerSubtitle}>Solicitudes completadas, anuladas o rechazadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SolicitudesList
            solicitudes={solicitudes}
            loading={loading}
            error={error}
            onRefresh={refetch}
            onSolicitudPress={handleSolicitudPress}
          />
        </View>

        {/* Modal de Detalles */}
        <DetalleSolicitudModal
          visible={mostrarDetalle}
          solicitud={solicitudSeleccionada}
          onClose={handleCloseDetalle}
          onAsignarEmpleado={handleAsignarEmpleado}
          onDescargarArchivos={handleDescargarArchivos}
          onDescargarArchivosZip={handleDescargarArchivosZip}
        />

        {/* Modal de Asignar Empleado */}
        <AsignarEmpleadoModal
          visible={mostrarAsignarEmpleado}
          solicitud={solicitudSeleccionada}
          onClose={() => {
            setMostrarAsignarEmpleado(false);
            setSolicitudSeleccionada(null);
          }}
          onSuccess={handleSuccess}
        />

        {/* Modal de Descargar Archivos de Seguimiento */}
        <DescargarArchivosSeguimientoModal
          visible={mostrarDescargarArchivos}
          solicitud={solicitudSeleccionada}
          onClose={() => {
            setMostrarDescargarArchivos(false);
            setSolicitudSeleccionada(null);
          }}
        />
      </ScrollView>
      <AdminMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Espacio para el menú fixed
  },
  header: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryDark,
    ...Platform.select({
      web: { boxShadow: '0px 2px 12px rgba(8, 56, 116, 0.08)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 20,
  },
});

