// frontend/app/signup.tsx - Sign-up screen component for the Expo Router application, allowing users to create a new account by entering their email and password, with error handling and navigation back to the sign-in screen if the email is already registered.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_BASE = Platform.select({
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

const SIGNUP_PATH = '/auth/register';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); 
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${SIGNUP_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        // Specifically handle the 400 "Email already registered" error
        if (res.status === 400 && data?.detail === "Email already registered") {
          Alert.alert(
            'Account Exists',
            'This email is already registered. Would you like to sign in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign In', onPress: () => navigateBack() }
            ]
          );
          return;
        }

        const msg = (data && data.detail) || `Sign-up failed (${res.status})`;
        throw new Error(msg);
      }

      Alert.alert('Success', 'Account created! Please sign in.');
      navigateBack(); 
    } catch (error: any) {
      Alert.alert('Sign-Up Error', error?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Video
        source={require('../assets/videos/background.mp4')}
        style={StyleSheet.absoluteFill}
        shouldPlay
        isLooping
        isMuted
        resizeMode="cover"
        useNativeControls={false}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <BlurView intensity={50} tint="dark" style={styles.card}>
          <View style={styles.logoPlaceholder} />
          <Text style={styles.brandName}>YANTAAYUSH</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonTextPrimary}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateBack} disabled={loading}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#000' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '90%', maxWidth: 400, borderRadius: 20, paddingHorizontal: 25, paddingVertical: 35,
    overflow: 'hidden', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', marginBottom: 15 },
  brandName: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#BBBBBB', marginBottom: 30, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: '#FFFFFF', fontSize: 16 },
  buttonPrimary: {
    backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    width: '100%', height: 50, marginTop: 20,
  },
  buttonTextPrimary: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', marginTop: 25 },
  footerText: { color: '#BBBBBB', fontSize: 14 },
  linkText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});