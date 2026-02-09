// frontend/app/%28tabs%29/_layout.tsx - Layout component for the bottom tab navigation in the Expo Router application, defining the structure and styling of the tabs and their icons.
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#00FFC2', 
        tabBarInactiveTintColor: '#888', 
        tabBarStyle: {
          backgroundColor: '#101010', 
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Grid',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" color={color} size={size} />
          ),
        }}
      />
      {/* Hide the signup tab from the bottom bar if it exists inside the (tabs) folder */}
      <Tabs.Screen 
        name="signup" 
        options={{ 
          href: null, // This hides it from the bottom tab bar
        }}
      />
    </Tabs>
  );
}