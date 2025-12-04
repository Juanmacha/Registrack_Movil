import { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useEmpleados } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Empleado, Solicitud } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface AsignarEmpleadoModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AsignarEmpleadoModal({
  visible,
  solicitud,
  onClose,
  onSuccess,
}: AsignarEmpleadoModalProps) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
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

  const { empleados, loading: loadingEmpleados, refetch: refetchEmpleados } = useEmpleados(visible);

  useEffect(() => {
    if (visible) {
      refetchEmpleados();
      // Obtener empleado actual asignado
      if (solicitud?.id_empleado_asignado) {
        setEmpleadoSeleccionado(solicitud.id_empleado_asignado);
      }
    } else {
      setBusqueda('');
      setEmpleadoSeleccionado(null);
    }
  }, [visible, solicitud]);

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = empleados.filter((empleado) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    const nombreCompleto = `${empleado.nombres} ${empleado.apellidos}`.toLowerCase();
    return nombreCompleto.includes(texto) || empleado.correo.toLowerCase().includes(texto);
  });

  const handleAsignar = async () => {
    if (!solicitud || !empleadoSeleccionado) return;

    setLoading(true);
    try {
      await solicitudesApiService.asignarEmpleado(solicitud.id_orden_servicio, empleadoSeleccionado);

      setAlertConfig({
        visible: true,
        title: 'Empleado asignado',
        message: 'El empleado ha sido asignado exitosamente a la solicitud.',
        type: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al asignar',
        message: message || 'No se pudo asignar el empleado. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setBusqueda('');
      setEmpleadoSeleccionado(null);
      onClose();
    }
  };

  if (!solicitud) {
    return null;
  }

  const empleadoActual = empleados.find((e) => e.id_empleado === solicitud.id_empleado_asignado);

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={handleClose}
        disabled={loading}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.confirmButton, (loading || !empleadoSeleccionado) && styles.buttonDisabled]}
        onPress={handleAsignar}
        disabled={loading || !empleadoSeleccionado}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Asignando...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Asignar Empleado</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        onClose={handleClose}
        title={`Asignar Empleado - ${solicitud.expediente}`}
        footer={footer}>
        <View style={styles.container}>
          {empleadoActual && (
            <View style={styles.currentEmployeeBox}>
              <Text style={styles.currentEmployeeLabel}>Empleado actual:</Text>
              <Text style={styles.currentEmployeeName}>
                {empleadoActual.nombres} {empleadoActual.apellidos}
              </Text>
              <Text style={styles.currentEmployeeEmail}>{empleadoActual.correo}</Text>
            </View>
          )}

          <View style={styles.searchSection}>
            <Text style={styles.label}>Buscar empleado:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o email..."
              placeholderTextColor={colors.gray}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          {loadingEmpleados ? (
            <LoadingSpinner />
          ) : (
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>
                {empleadosFiltrados.length} empleado{empleadosFiltrados.length !== 1 ? 's' : ''} disponible
                {empleadosFiltrados.length !== 1 ? 's' : ''}
              </Text>
              <FlatList
                data={empleadosFiltrados}
                keyExtractor={(item) => item.id_empleado.toString()}
                renderItem={({ item }) => {
                  const isSelected = empleadoSeleccionado === item.id_empleado;
                  return (
                    <TouchableOpacity
                      style={[styles.empleadoItem, isSelected && styles.empleadoItemSelected]}
                      onPress={() => setEmpleadoSeleccionado(item.id_empleado)}
                      activeOpacity={0.7}>
                      <View style={styles.empleadoInfo}>
                        <Text style={styles.empleadoNombre}>
                          {item.nombres} {item.apellidos}
                        </Text>
                        <Text style={styles.empleadoEmail}>{item.correo}</Text>
                        {item.telefono && <Text style={styles.empleadoTelefono}>{item.telefono}</Text>}
                      </View>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                scrollEnabled={true}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}
        </View>
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
    gap: 16,
  },
  currentEmployeeBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  currentEmployeeLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentEmployeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  currentEmployeeEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  searchSection: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
  },
  empleadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  empleadoItemSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#EFF6FF',
  },
  empleadoInfo: {
    flex: 1,
    gap: 4,
  },
  empleadoNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  empleadoEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  empleadoTelefono: {
    fontSize: 12,
    color: colors.gray,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    maxWidth: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

