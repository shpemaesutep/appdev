import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0B1F3A",   // active (selected)
        tabBarInactiveTintColor: "#9CA3AF", // inactive
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E5E5",
        },
      }}
    >
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
