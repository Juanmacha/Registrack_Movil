import { Platform, Text } from 'react-native';
import Animated from 'react-native-reanimated';

export function HelloWave() {
  // En web, usar un componente simple para evitar problemas con animaciones CSS
  if (Platform.OS === 'web') {
    return (
      <Text style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
      }}>
        👋
      </Text>
    );
  }

  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
