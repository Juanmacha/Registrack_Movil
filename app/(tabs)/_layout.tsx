import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { tieneRolAdministrativo } from '@/utils/roles';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const esCliente = user && !tieneRolAdministrativo(user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // Ocultar tab bar para clientes (usan ClienteMenu)
        tabBarStyle: esCliente ? { display: 'none' } : undefined,
      }}>
      {/* Menú para Clientes */}
      <Tabs.Screen
        name="solicitudes-cliente"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
          ...(esCliente ? {} : { href: null }),
        }}
      />
      <Tabs.Screen
        name="mis-procesos"
        options={{
          title: 'Mis Procesos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle" color={color} />,
          ...(esCliente ? {} : { href: null }),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          ...(esCliente ? {} : { href: null }),
        }}
      />
      {/* Menú para Administradores/Empleados */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          ...(esCliente ? { href: null } : {}),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          ...(esCliente ? { href: null } : {}),
        }}
      />
    </Tabs>
  );
}
