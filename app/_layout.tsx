import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons'

export default function RootLayout() {
  return (
    <Tabs>
     <Tabs.Screen
      name="index"
      options={{
        title: 'Schedule',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
    <Tabs.Screen
      name ="account"
      options = {{
        title: 'My Account',
        tabBarIcon: ({color, size}) =>(
          <Ionicons name="person-circle" size={size} color={color} />

        ),
        headerShown: false,
      }}
      
      />
    </Tabs >
  );
}
