import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

import IngresosChart from '@/components/dashboard/IngresosChart';
import MarcasTable from '@/components/dashboard/MarcasTable';
import ServiciosInactivosTable from '@/components/dashboard/ServiciosInactivosTable';
import ServiciosResumen from '@/components/dashboard/ServiciosResumen';
import AdminMenu from '@/components/AdminMenu';

export default function DashboardScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

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
        <Text style={styles.errorText}>No tienes permisos para acceder al dashboard.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Panel de Administración</Text>
        <Text style={styles.headerSubtitle}>Bienvenido, {user.nombre} {user.apellido}</Text>
      </View>

      <View style={styles.section}>
        <IngresosChart />
      </View>

      <View style={styles.section}>
        <ServiciosResumen />
      </View>

      <View style={styles.section}>
        <MarcasTable />
      </View>

      <View style={styles.section}>
        <ServiciosInactivosTable />
      </View>

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
  menuSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 24,
  },
});

