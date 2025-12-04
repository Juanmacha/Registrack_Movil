import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

import Card from '@/components/dashboard/Card';
import ClienteMenu from '@/components/ClienteMenu';
import CustomAlert from '@/components/CustomAlert';
import { useState, useEffect } from 'react';

export default function PerfilTabScreen() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirigir si no está autenticado (usando useEffect para evitar actualización durante render)
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

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

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      setLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Mi Perfil</Text>
              <Text style={styles.headerSubtitle}>Información de tu cuenta</Text>
            </View>
            <TouchableOpacity 
              style={[styles.logoutButtonHeader, loggingOut && styles.logoutButtonDisabled]} 
              onPress={handleLogoutClick}
              disabled={loggingOut}>
              {loggingOut ? (
                <View style={styles.logoutLoadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Cerrando...</Text>
                </View>
              ) : (
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Card>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{user.nombre} {user.apellido}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Correo electrónico:</Text>
              <Text style={styles.value}>{user.correo}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Tipo de documento:</Text>
              <Text style={styles.value}>
                {user.tipo_documento || (user as any).tipodedocumento || 'No disponible'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Número de documento:</Text>
              <Text style={styles.value}>
                {user.documento || (user as any).numero_documento || (user as any).numeroDocumento || (user as any).numerodedocumento || 'No disponible'}
              </Text>
            </View>

            {user.telefono && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{user.telefono}</Text>
              </View>
            )}

            {user.direccion && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{user.direccion}</Text>
              </View>
            )}

            {user.ciudad && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Ciudad:</Text>
                <Text style={styles.value}>{user.ciudad}</Text>
              </View>
            )}

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.label}>Estado de cuenta:</Text>
              <View style={[styles.statusBadge, user.estado ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                <Text style={[styles.statusBadgeText, !user.estado && styles.statusBadgeTextInactive]}>
                  {user.estado ? '✓ Activo' : '✗ Inactivo'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {user.rol && (
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Rol y Permisos</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Rol:</Text>
                <Text style={styles.value}>{user.rol.nombre || 'N/A'}</Text>
              </View>

              {user.rol.estado && (
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={styles.label}>Estado del rol:</Text>
                  <View style={[styles.statusBadge, styles.statusBadgeActive]}>
                    <Text style={styles.statusBadgeText}>
                      {user.rol.estado}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>
      <ClienteMenu />

      {/* Modal de confirmación de cierre de sesión */}
      <CustomAlert
        visible={showLogoutConfirm}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        type="warning"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
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
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(8, 56, 116, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  logoutButtonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoRowLast: {
    borderBottomWidth: 0,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  statusBadgeTextInactive: {
    color: '#991B1B',
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

