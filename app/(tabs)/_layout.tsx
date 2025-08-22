// In frontend/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Login' }}/>
      <Tabs.Screen name="explore" options={{ title: 'Home' }}/>
    </Tabs>
  );
}