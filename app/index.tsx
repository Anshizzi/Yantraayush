// In frontend/app/index.tsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, ActivityIndicator
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
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
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#555"
          />
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonTextPrimary}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/signup')} disabled={loading}>
          <Text style={styles.buttonTextSecondary}>Create an account</Text>
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
    backgroundColor: '#0B101B',
  },
  card: {
    backgroundColor: '#161D2B', 
    borderRadius: 12,
    padding: 30,
    width: '90%',
    maxWidth: 360,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#AAB3C4',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderColor: '#344054',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    backgroundColor: '#0B101B',
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginTop: 10,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderColor: '#4A80F0',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginTop: 15,
  },
  buttonTextSecondary: {
    color: '#4A80F0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});