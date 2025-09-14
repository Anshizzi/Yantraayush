import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

//computer's current IP address
const API_BASE = "http://192.168.25.1:8000";

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Sign-up failed.'; // Default message
        
        if (response.status === 422 && data.detail && Array.isArray(data.detail)) {
          const firstError = data.detail[0];
          errorMessage = `Invalid ${firstError.loc[1]}: ${firstError.msg}`;
        } 
        else if (data.detail) {
          errorMessage = data.detail;
        }
        
        throw new Error(errorMessage);
      }

      Alert.alert('Success', 'Account created successfully! Please log in.');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Sign-Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            placeholderTextColor="#555"
          />
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonTextPrimary}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.back()} disabled={loading}>
          <Text style={styles.buttonTextSecondary}>Back to Login</Text>
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