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
          ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' } 
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
    borderColor: '#e5e7eb',
  },
};

const nativeStyles = Platform.OS !== 'web' ? {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} : {};

const styles = StyleSheet.create({
  ...baseStyles,
  ...nativeStyles,
} as any);

