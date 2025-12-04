import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useMisSolicitudes } from '@/hooks/useSolicitudes';
import { Solicitud, ESTADOS_TERMINALES } from '@/types/solicitudes';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

import DetalleProcesoModal from '@/components/cliente/DetalleProcesoModal';
import HistorialSeguimientoModal from '@/components/cliente/HistorialSeguimientoModal';
import SolicitudesClienteList from '@/components/cliente/SolicitudesClienteList';
import ProcesoActivoCard from '@/components/cliente/ProcesoActivoCard';
import ClienteMenu from '@/components/ClienteMenu';

type TabType = 'activos' | 'historial';

export default function MisProcesosTabScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { solicitudes, loading, error, refetch } = useMisSolicitudes();
  const [tabActivo, setTabActivo] = useState<TabType>('activos');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(false);
  const refetchRef = useRef(refetch);

  // Actualizar la referencia cuando refetch cambie
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  // Redirigir si no está autenticado (usando useEffect para evitar actualización durante render)
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Refrescar datos cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      // Usar la referencia para evitar dependencias que cambien
      refetchRef.current();
    }, [])
  );

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Verificar que sea cliente (no administrativo)
  const esAdministrativo = tieneRolAdministrativo(user);
  if (esAdministrativo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Esta sección es solo para clientes.</Text>
      </View>
    );
  }

  // Filtrar solicitudes según el tab activo
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const estado = s.estado || '';
    const esTerminal = ESTADOS_TERMINALES.includes(estado as any);
    
    if (tabActivo === 'activos') {
      return !esTerminal;
    } else {
      return esTerminal;
    }
  });

  const handleSolicitudPress = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarDetalle(true);
  };

  const handleVerSeguimiento = () => {
    setMostrarDetalle(false);
    setMostrarSeguimiento(true);
  };

  const handleCloseDetalle = () => {
    setMostrarDetalle(false);
    setSolicitudSeleccionada(null);
  };

  const handleCloseSeguimiento = () => {
    setMostrarSeguimiento(false);
    setSolicitudSeleccionada(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Mis Procesos</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tabActivo === 'activos' && styles.tabActive]}
          onPress={() => setTabActivo('activos')}>
          <Text style={[styles.tabText, tabActivo === 'activos' && styles.tabTextActive]}>
            Procesos Activos ({solicitudes.filter((s) => !ESTADOS_TERMINALES.includes((s.estado || '') as any)).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActivo === 'historial' && styles.tabActive]}
          onPress={() => setTabActivo('historial')}>
          <Text style={[styles.tabText, tabActivo === 'historial' && styles.tabTextActive]}>
            Historial ({solicitudes.filter((s) => ESTADOS_TERMINALES.includes((s.estado || '') as any)).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando procesos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {typeof error === 'string' ? error : error?.message || 'Error desconocido'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : solicitudesFiltradas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {tabActivo === 'activos'
              ? 'No tienes procesos activos en este momento.'
              : 'No hay procesos en tu historial.'}
          </Text>
        </View>
      ) : tabActivo === 'activos' ? (
        <ProcesoActivoCard
          solicitudes={solicitudesFiltradas}
          onSolicitudPress={handleSolicitudPress}
          onVerSeguimiento={handleVerSeguimiento}
        />
      ) : (
        <SolicitudesClienteList
          solicitudes={solicitudesFiltradas}
          onSolicitudPress={handleSolicitudPress}
        />
      )}

      {/* Modales */}
      {solicitudSeleccionada && (
        <>
          <DetalleProcesoModal
            visible={mostrarDetalle}
            solicitud={solicitudSeleccionada}
            onClose={handleCloseDetalle}
            onVerSeguimiento={handleVerSeguimiento}
            onSuccess={handleSuccess}
          />
          <HistorialSeguimientoModal
            visible={mostrarSeguimiento}
            solicitud={solicitudSeleccionada}
            onClose={handleCloseSeguimiento}
          />
        </>
      )}
      <ClienteMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: colors.primaryDark,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: colors.gray,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

