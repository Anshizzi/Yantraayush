// In frontend/app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide the default header for all tabs
        tabBarActiveTintColor: '#00FFC2', // Active icon color
        tabBarInactiveTintColor: '#888', // Inactive icon color
        tabBarStyle: {
          backgroundColor: '#101010', // Dark background for the tab bar
          borderTopWidth: 0, // Remove the top border line
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
    </Tabs>
  );
}