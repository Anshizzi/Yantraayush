// In frontend/app/_layout.tsx

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}