import { Platform, StyleSheet } from 'react-native';

export const colors = {
  primary: '#275FAA',
  primaryDark: '#083874',
  accent: '#3B82F6',
  gray: '#6B7280',
  border: '#D1D5DB',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.primaryDark,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: -12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: -12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});

