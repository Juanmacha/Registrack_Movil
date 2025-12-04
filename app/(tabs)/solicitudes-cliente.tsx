import { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/authStyles';
import { tieneRolAdministrativo } from '@/utils/roles';

import ClienteMenu from '@/components/ClienteMenu';
import CrearSolicitudClienteModal from '@/components/cliente/CrearSolicitudClienteModal';

export default function SolicitudesClienteScreen() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Debes iniciar sesión para acceder a esta sección.</Text>
      </View>
    );
  }

  if (tieneRolAdministrativo(user)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Esta sección es solo para clientes.</Text>
      </View>
    );
  }

  const handleCrearSolicitud = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Solicitudes</Text>
              <Text style={styles.headerSubtitle}>Crea nuevas solicitudes de servicios</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCrearSolicitud}>
              <Text style={styles.createButtonText}>+ Crear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>¿Cómo crear una solicitud?</Text>
            <Text style={styles.infoDescription}>
              Selecciona el tipo de servicio que necesitas y completa el formulario con la información requerida. 
              Una vez creada la solicitud, podrás procesar el pago para activarla.
            </Text>
          </View>

          <View style={styles.servicesCard}>
            <Text style={styles.servicesTitle}>Servicios Disponibles</Text>
            <View style={styles.servicesList}>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Búsqueda de Antecedentes</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Certificación de Marca</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Renovación de Marca</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Presentación de Oposición</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Cesión de Marca</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Ampliación de Alcance</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>Respuesta a Oposición</Text>
              </View>
            </View>
          </View>
        </View>

        <CrearSolicitudClienteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={() => {
            setModalVisible(false);
          }}
        />
      </ScrollView>
      <ClienteMenu />
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
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    flexShrink: 0,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 200,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.gray,
    fontWeight: '500',
    lineHeight: 18,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    flexShrink: 0,
    marginLeft: -28,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(8, 56, 116, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(8, 56, 116, 0.08)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 22,
  },
  servicesCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryDark,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(8, 56, 116, 0.08)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  serviceBullet: {
    fontSize: 16,
    color: colors.primaryDark,
    marginRight: 12,
    fontWeight: '700',
  },
  serviceText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 20,
  },
});

