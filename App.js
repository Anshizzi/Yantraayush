import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  LogBox,
} from "react-native";
import * as Localization from "expo-localization";

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  "props.pointerEvents is deprecated",
]);

const API_BASE =
  Platform.select({
    ios: "http://localhost:8000",
    android: "http://10.0.2.2:8000", // Android emulator localhost
    web: "http://127.0.0.1:8000",    // expo web sometimes uses this
    default: "http://localhost:8000",
  }) || "http://localhost:8000";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Validation", "Please enter email and password");
        return;
      }

      // We send 'email' (frontend) — backend accepts username OR email
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || "Login failed");
      Alert.alert("Success", data?.message || "Logged in");
    } catch (error) {
      Alert.alert("Error", error.message || "Error connecting to backend");
    }
  };

  // show device timezone using expo-localization
  const timezone = Localization.timezone || "Unknown";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.timezone}>Your Timezone: {timezone}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  timezone: {
    fontSize: 16,
    marginBottom: 20,
    color: "gray",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
});
