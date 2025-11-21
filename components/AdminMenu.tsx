import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { colors } from '@/styles/authStyles';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: '📊' },
  { label: 'Solicitudes', route: '/solicitudes', icon: '📝' },
  { label: 'Mi Perfil', route: '/profile', icon: '👤' },
];

export default function AdminMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => handleNavigate(item.route)}
            activeOpacity={0.7}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  menuItemActive: {
    backgroundColor: colors.primaryDark,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  menuLabelActive: {
    color: '#FFFFFF',
  },
});

