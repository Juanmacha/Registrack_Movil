import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Solicitud } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import Modal from './Modal';

interface AnularSolicitudModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnularSolicitudModal({
  visible,
  solicitud,
  onClose,
  onSuccess,
}: AnularSolicitudModalProps) {
  const [motivo, setMotivo] = useState('');
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

  const handleAnular = async () => {
    if (!solicitud) return;

    // Validar motivo
    if (!motivo.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Motivo requerido',
        message: 'Debes proporcionar un motivo para anular la solicitud.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await solicitudesApiService.anularSolicitud(solicitud.id_orden_servicio, motivo.trim());
      
      setAlertConfig({
        visible: true,
        title: 'Solicitud anulada',
        message: 'La solicitud ha sido anulada exitosamente.',
        type: 'success',
      });

      // Limpiar formulario y cerrar después de un momento
      setTimeout(() => {
        setMotivo('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al anular',
        message: message || 'No se pudo anular la solicitud. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMotivo('');
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
        style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
        onPress={handleAnular}
        disabled={loading || !motivo.trim()}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Anulando...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Anular Solicitud</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        onClose={handleClose}
        title={`Anular Solicitud - ${solicitud.expediente}`}
        footer={footer}>
        <View style={styles.container}>
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Esta acción no se puede deshacer. La solicitud será anulada y se enviará una notificación al cliente.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Solicitud:</Text>
            <Text style={styles.infoValue}>{solicitud.expediente}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Titular:</Text>
            <Text style={styles.infoValue}>{solicitud.titular}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Marca:</Text>
            <Text style={styles.infoValue}>{solicitud.marca}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>
              Motivo de anulación <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, !motivo.trim() && styles.textAreaEmpty]}
              placeholder="Describe el motivo por el cual se anula esta solicitud..."
              placeholderTextColor={colors.gray}
              value={motivo}
              onChangeText={setMotivo}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
            <Text style={styles.helperText}>
              {motivo.length} caracteres
            </Text>
          </View>
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
    gap: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  formSection: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  textAreaEmpty: {
    borderColor: colors.border,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    textAlign: 'right',
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
    backgroundColor: colors.danger,
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

