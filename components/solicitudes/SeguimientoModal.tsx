import { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useEstadosDisponibles } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface SeguimientoModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SeguimientoModal({
  visible,
  solicitud,
  onClose,
  onSuccess,
}: SeguimientoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
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

  const { estados, loading: loadingEstados, refetch: refetchEstados } = useEstadosDisponibles(
    solicitud?.id_orden_servicio || null,
    visible
  );

  useEffect(() => {
    if (visible && solicitud) {
      refetchEstados();
    } else {
      // Limpiar formulario al cerrar
      setTitulo('');
      setDescripcion('');
      setObservaciones('');
      setNuevoEstado('');
    }
  }, [visible, solicitud]);

  // Obtener lista de estados disponibles
  const estadosDisponibles = estados?.data?.estados_disponibles || estados?.estados_disponibles || [];
  const estadoActual = estados?.data?.estado_actual || estados?.estado_actual || solicitud?.estado || '';

  const handleCrearSeguimiento = async () => {
    if (!solicitud) return;

    // Validaciones
    if (!titulo.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Título requerido',
        message: 'Debes proporcionar un título para el seguimiento.',
        type: 'error',
      });
      return;
    }

    if (titulo.length > 200) {
      setAlertConfig({
        visible: true,
        title: 'Título muy largo',
        message: 'El título no puede exceder 200 caracteres.',
        type: 'error',
      });
      return;
    }

    if (!descripcion.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Descripción requerida',
        message: 'Debes proporcionar una descripción para el seguimiento.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        id_orden_servicio: solicitud.id_orden_servicio,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
      };

      if (observaciones.trim()) {
        payload.observaciones = observaciones.trim();
      }

      if (nuevoEstado) {
        payload.nuevo_proceso = nuevoEstado;
      }

      await solicitudesApiService.crearSeguimiento(payload);

      setAlertConfig({
        visible: true,
        title: 'Seguimiento creado',
        message: nuevoEstado
          ? 'El seguimiento ha sido creado y el estado de la solicitud ha sido actualizado.'
          : 'El seguimiento ha sido creado exitosamente.',
        type: 'success',
      });

      setTimeout(() => {
        setTitulo('');
        setDescripcion('');
        setObservaciones('');
        setNuevoEstado('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al crear seguimiento',
        message: message || 'No se pudo crear el seguimiento. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitulo('');
      setDescripcion('');
      setObservaciones('');
      setNuevoEstado('');
      onClose();
    }
  };

  if (!solicitud) {
    return null;
  }

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={handleClose}
        disabled={loading}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.confirmButton,
          (loading || !titulo.trim() || !descripcion.trim()) && styles.buttonDisabled,
        ]}
        onPress={handleCrearSeguimiento}
        disabled={loading || !titulo.trim() || !descripcion.trim()}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Creando...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Crear Seguimiento</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        onClose={handleClose}
        title={`Agregar Seguimiento - ${solicitud.expediente}`}
        footer={footer}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Estado Actual */}
          {estadoActual && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Estado actual:</Text>
              <Text style={styles.infoValue}>{estadoActual}</Text>
            </View>
          )}

          {/* Título */}
          <View style={styles.formSection}>
            <Text style={styles.label}>
              Título <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, !titulo.trim() && styles.inputEmpty]}
              placeholder="Ej: Revisión de documentos, Cambio de estado..."
              placeholderTextColor={colors.gray}
              value={titulo}
              onChangeText={setTitulo}
              maxLength={200}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              {titulo.length}/200 caracteres
            </Text>
          </View>

          {/* Descripción */}
          <View style={styles.formSection}>
            <Text style={styles.label}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, !descripcion.trim() && styles.textAreaEmpty]}
              placeholder="Describe el seguimiento de la solicitud..."
              placeholderTextColor={colors.gray}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Observaciones */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Observaciones (opcional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Observaciones adicionales..."
              placeholderTextColor={colors.gray}
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Cambiar Estado */}
          {loadingEstados ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>Cargando estados disponibles...</Text>
            </View>
          ) : estadosDisponibles.length > 0 ? (
            <View style={styles.formSection}>
              <Text style={styles.label}>Cambiar estado (opcional)</Text>
              <Text style={styles.helperText}>
                Si seleccionas un nuevo estado, la solicitud cambiará automáticamente y se enviará una notificación al
                cliente.
              </Text>
              <View style={styles.estadosContainer}>
                {estadosDisponibles.map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[styles.estadoButton, nuevoEstado === estado && styles.estadoButtonSelected]}
                    onPress={() => setNuevoEstado(nuevoEstado === estado ? '' : estado)}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.estadoButtonText,
                        nuevoEstado === estado && styles.estadoButtonTextSelected,
                      ]}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {nuevoEstado && (
                <View style={styles.selectedEstadoBox}>
                  <Text style={styles.selectedEstadoText}>
                    Estado seleccionado: <Text style={styles.selectedEstadoValue}>{nuevoEstado}</Text>
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noEstadosBox}>
              <Text style={styles.noEstadosText}>
                No hay estados disponibles para cambiar. La solicitud está en un estado final o no permite cambios.
              </Text>
            </View>
          )}

          {/* Nota sobre documentos */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              💡 <Text style={styles.noteBold}>Nota:</Text> La funcionalidad para adjuntar documentos estará
              disponible próximamente.
            </Text>
          </View>
        </ScrollView>
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
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 20,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  required: {
    color: colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    backgroundColor: '#FFFFFF',
  },
  inputEmpty: {
    borderColor: colors.border,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  textAreaEmpty: {
    borderColor: colors.border,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
  },
  estadosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  estadoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
  },
  estadoButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  estadoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  estadoButtonTextSelected: {
    color: '#FFFFFF',
  },
  selectedEstadoBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  selectedEstadoText: {
    fontSize: 13,
    color: '#065F46',
  },
  selectedEstadoValue: {
    fontWeight: '700',
  },
  noEstadosBox: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  noEstadosText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  noteBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 18,
  },
  noteBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
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

