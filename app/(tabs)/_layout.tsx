import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      {/* AFTER: Added details route registration to enable proper navigation */}
      {/* href: null hides it from the tab bar while still allowing navigation to work */}
      <Tabs.Screen
        name="details"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
