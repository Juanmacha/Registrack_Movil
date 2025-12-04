import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Panel de Administración</Text>
              <Text style={styles.headerSubtitle}>Bienvenido, {user.nombre} {user.apellido}</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>ADMIN</Text>
            </View>
          </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 200,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  headerBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexShrink: 0,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 24,
  },
});

