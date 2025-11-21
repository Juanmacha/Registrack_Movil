import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

import Card from '@/components/dashboard/Card';
import AdminMenu from '@/components/AdminMenu';
import { useState } from 'react';

export default function ProfileScreen() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLoggingOut(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>👤 Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>Información de tu cuenta</Text>
          </View>
          <TouchableOpacity 
            style={[styles.logoutButtonHeader, loggingOut && styles.logoutButtonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}>
            {loggingOut ? (
              <View style={styles.logoutLoadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Cerrando...</Text>
              </View>
            ) : (
              <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
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
              {tieneRolAdministrativo(user) && (
                <View style={styles.adminBadgeInline}>
                  <Text style={styles.adminBadgeTextInline}>🔐 Administrador</Text>
                </View>
              )}
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

      <View style={styles.menuSection}>
        <AdminMenu />
      </View>
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
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(8, 56, 116, 0.3)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    opacity: 0.9,
  },
  logoutButtonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  adminBadgeInline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
  },
  adminBadgeTextInline: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 15,
    color: colors.gray,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: colors.primaryDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  statusBadgeTextInactive: {
    color: '#991B1B',
  },
  menuSection: {
    marginTop: 8,
    marginBottom: 24,
  },
});

