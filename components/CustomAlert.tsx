import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/styles/authStyles';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Entendido',
  onConfirm,
}: CustomAlertProps) {
  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <Pressable style={styles.overlay} onPress={onConfirm}>
        <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable style={[styles.button, { backgroundColor: getButtonColor() }]} onPress={onConfirm}>
            <Text style={styles.buttonText}>{confirmText}</Text>
          </Pressable>
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

