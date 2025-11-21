import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/styles/authStyles';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Text style={styles.retry} onPress={onRetry}>
          Reintentar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  message: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retry: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

