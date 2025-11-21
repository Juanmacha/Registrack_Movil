import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/styles/authStyles';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'error':
        return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      case 'warning':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'info':
        return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.badge, { backgroundColor: variantStyles.bg, borderColor: variantStyles.border }]}>
      <Text style={[styles.text, { color: variantStyles.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

