import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { tieneRolAdministrativo } from '@/utils/roles';

import AdminMenu from '@/components/AdminMenu';
import AnularSolicitudModal from '@/components/solicitudes/AnularSolicitudModal';
import AsignarEmpleadoModal from '@/components/solicitudes/AsignarEmpleadoModal';
import CrearSolicitudModal from '@/components/solicitudes/CrearSolicitudModal';
import DetalleSolicitudModal from '@/components/solicitudes/DetalleSolicitudModal';
import EditarSolicitudModal from '@/components/solicitudes/EditarSolicitudModal';
import SeguimientoModal from '@/components/solicitudes/SeguimientoModal';
import SolicitudesList from '@/components/solicitudes/SolicitudesList';

export default function SolicitudesScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { solicitudes, loading, error, refetch } = useSolicitudes();
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarAnular, setMostrarAnular] = useState(false);
  const [mostrarAsignarEmpleado, setMostrarAsignarEmpleado] = useState(false);
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(false);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);

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

  const handleCrearSolicitud = () => {
    setMostrarCrear(true);
  };

  const handleCloseDetalle = () => {
    setMostrarDetalle(false);
    setSolicitudSeleccionada(null);
  };

  const handleEditar = () => {
    setMostrarDetalle(false);
    setMostrarEditar(true);
  };

  const handleAnular = () => {
    setMostrarDetalle(false);
    setMostrarAnular(true);
  };

  const handleAsignarEmpleado = () => {
    setMostrarDetalle(false);
    setMostrarAsignarEmpleado(true);
  };

  const handleAgregarSeguimiento = () => {
    setMostrarDetalle(false);
    setMostrarSeguimiento(true);
  };

  const handleSuccess = () => {
    // Refrescar lista después de cualquier acción exitosa
    refetch();
  };

  const handleDescargarArchivos = async () => {
    // TODO: Implementar descarga de archivos
    console.log('Descargar archivos de solicitud:', solicitudSeleccionada?.id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>📝 Solicitudes</Text>
            <Text style={styles.headerSubtitle}>Gestión de solicitudes de servicios</Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearSolicitud}>
            <Text style={styles.createButtonText}>+ Crear</Text>
          </TouchableOpacity>
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

      <View style={styles.menuSection}>
        <AdminMenu />
      </View>

      {/* Modal de Detalles */}
      <DetalleSolicitudModal
        visible={mostrarDetalle}
        solicitud={solicitudSeleccionada}
        onClose={handleCloseDetalle}
        onEditar={handleEditar}
        onAnular={handleAnular}
        onAsignarEmpleado={handleAsignarEmpleado}
        onAgregarSeguimiento={handleAgregarSeguimiento}
        onDescargarArchivos={handleDescargarArchivos}
      />

      {/* Modal de Anular */}
      <AnularSolicitudModal
        visible={mostrarAnular}
        solicitud={solicitudSeleccionada}
        onClose={() => {
          setMostrarAnular(false);
          setSolicitudSeleccionada(null);
        }}
        onSuccess={handleSuccess}
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

      {/* Modal de Seguimiento */}
      <SeguimientoModal
        visible={mostrarSeguimiento}
        solicitud={solicitudSeleccionada}
        onClose={() => {
          setMostrarSeguimiento(false);
          setSolicitudSeleccionada(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Modal de Crear Solicitud */}
      <CrearSolicitudModal
        visible={mostrarCrear}
        onClose={() => setMostrarCrear(false)}
        onSuccess={handleSuccess}
      />

      {/* Modal de Editar Solicitud */}
      <EditarSolicitudModal
        visible={mostrarEditar}
        solicitud={solicitudSeleccionada}
        onClose={() => {
          setMostrarEditar(false);
          setSolicitudSeleccionada(null);
        }}
        onSuccess={handleSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    paddingTop: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 20,
  },
  menuSection: {
    marginTop: 8,
    marginBottom: 24,
  },
});

