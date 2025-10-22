// File: frontend/app/_layout.tsx

import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import

export default function RootLayout() {
  return (
    // Wrap the entire layout
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{
          title: "Create Account",
          headerStyle: { backgroundColor: '#101010' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}