import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/styles/authStyles';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Entendido',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.primary;
      default:
        return colors.accent;
    }
  };

  const handleOverlayPress = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleOverlayPress}>
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {onCancel && (
              <Pressable style={[styles.button, styles.buttonWithCancel, styles.cancelButton]} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable style={[styles.button, onCancel && styles.buttonWithCancel, { backgroundColor: getButtonColor() }]} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonWithCancel: {
    flex: 1,
    minWidth: 0,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.gray,
    fontSize: 16,
    fontWeight: '600',
  },
});

