import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface StatusModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success';
}

export default function StatusModal({ visible, message, onClose, type = 'error' }: StatusModalProps) {
  const accentColor = type === 'error' ? "#FF4B4B" : "#00FFC2";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Animated backdrop */}
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.container}>
          <BlurView intensity={60} tint="dark" style={styles.card}>
            {/* Top accent line */}
            <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

            <View style={[
              styles.iconWrapper,
              { backgroundColor: type === 'error' ? 'rgba(255,75,75,0.1)' : 'rgba(0,255,194,0.1)' }
            ]}>
              <MaterialCommunityIcons 
                name={type === 'error' ? "shield-alert-outline" : "shield-check-outline"} 
                size={44} 
                color={accentColor} 
              />
            </View>

            <Text style={styles.title}>
              {type === 'error' ? 'Security Alert' : 'Success'}
            </Text>

            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.button, { borderColor: accentColor }]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>
                {type === 'error' ? 'Try Again' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  container: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden', // clips the blurview
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  card: { 
    padding: 30, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)' 
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '800', 
    letterSpacing: 0.5,
    marginTop: 10 
  },
  message: { 
    color: '#BBB', 
    textAlign: 'center', 
    marginVertical: 18, 
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400'
  },
  button: { 
    width: '100%',
    paddingVertical: 14, 
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 5
  },
  buttonText: { 
    textAlign: 'center',
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 1
  }
});