import { Platform, StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export default function Card({ children, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        Platform.OS === 'web' 
          ? { boxShadow: '0px 2px 12px rgba(8, 56, 116, 0.08)' } 
          : (styles as any).shadow,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const baseStyles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
};

const nativeStyles = Platform.OS !== 'web' ? {
  shadow: {
    shadowColor: '#083874',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} : {};

const styles = StyleSheet.create({
  ...baseStyles,
  ...nativeStyles,
} as any);

