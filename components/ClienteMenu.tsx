import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { colors } from '@/styles/authStyles';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: 'Solicitudes', route: '/(tabs)/solicitudes-cliente', icon: '📋' },
  { label: 'Mis Procesos', route: '/(tabs)/mis-procesos', icon: '📊' },
  { label: 'Mi Perfil', route: '/(tabs)/perfil', icon: '👤' },
];

export default function ClienteMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContent}>
        {menuItems.map((item) => {
          const isActive = pathname === item.route || pathname?.includes(item.route.replace('/(tabs)/', ''));
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}>
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Text style={[styles.menuIcon, isActive && styles.menuIconActive]}>{item.icon}</Text>
              </View>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0px -2px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
    zIndex: 1000,
  },
  menuContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    gap: 6,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    position: 'relative',
    minHeight: 60,
    maxWidth: 120,
  },
  menuItemActive: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainerActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  menuIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray,
  },
  menuIconActive: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'center',
  },
  menuLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 3,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});

