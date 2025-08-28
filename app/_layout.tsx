// frontend/app/_layout.tsx
import { Stack } from "expo-router";
import { View } from "react-native";
import TimezoneDisplay from "../components/TimezoneDisplay";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <TimezoneDisplay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "Create Account" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}
