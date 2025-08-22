// In frontend/app/index.tsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';

const API_BASE = Platform.select({
  ios: "http://localhost:8000",
  android: "http://10.0.2.2:8000",
  default: "http://localhost:8000",
});

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const router = useRouter();

  const handleLogin = async () => {
    if (loading) return; // Prevent multiple clicks while loading
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      router.replace('/(tabs)/');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Could not connect to the server.');
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.loginCard}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#555"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/signup')}
          disabled={loading}
        >
          <Text style={styles.createAccountButtonText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loginCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 25,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    color: '#AAA',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3777F0',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    height: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  createAccountButtonText: {
    color: '#3777F0',
    fontSize: 14,
  },
});