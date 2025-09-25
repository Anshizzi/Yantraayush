// In frontend/app/(tabs)/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, TextInput, Alert, StatusBar, Modal, Dimensions, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useRouter } from 'expo-router';

// --- API Base URL ---
const API_BASE = Platform.select({
  ios: "http://localhost:8000",
  android: "http://10.0.2.2:8000",
  default: "http://localhost:8000",
});

// --- Time Display Component (no changes) ---
const TimezoneDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{formattedTime}</Text>
      <Text style={styles.timezoneText}>{timezone.split('/').pop()}</Text>
    </View>
  );
};

interface Sensor {
  id: string; // The database will provide this
  name: string;
  description: string;
  pins: string[];
}

const { width } = Dimensions.get('window');
const gap = 10;
const totalGapSpace = (4 - 1) * gap;
const cardWidth = (width - 40 - totalGapSpace) / 4;

export default function HomeScreen() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);
  
  const pinOptions = ['V', 'I', 'R'];
  const router = useRouter();

  // --- FETCH SENSORS FROM BACKEND ---
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          // If no token, user is not logged in, redirect
          router.replace('/');
          return;
        }

        const response = await fetch(`${API_BASE}/sensors/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
            // Token is invalid or expired
            await AsyncStorage.removeItem('token');
            router.replace('/');
            return;
        }

        if (!response.ok) throw new Error('Failed to fetch sensors');
        
        const data = await response.json();
        setSensors(data);
      } catch (error) {
        console.error("Fetch sensors error:", error);
        Alert.alert('Error', 'Could not load sensor data.');
      }
    };
    fetchSensors();
  }, []);


  const handlePinSelect = (pin: string) => {
    setSelectedPins(prev => 
      prev.includes(pin) ? prev.filter(p => p !== pin) : [...prev, pin]
    );
  };

  const openAddSensorModal = () => {
    setNewName('');
    setNewDescription('');
    setSelectedPins([]);
    setModalVisible(true);
  };

  // --- SAVE SENSOR TO BACKEND ---
  const handleSaveSensor = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Sensor name is required.');
      return;
    }
    try {
        const token = await AsyncStorage.getItem('token');
        const newSensorData = {
            name: newName,
            description: newDescription,
            pins: selectedPins,
        };

        const response = await fetch(`${API_BASE}/sensors/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newSensorData)
        });

        if (!response.ok) throw new Error('Failed to save sensor');

        const savedSensor = await response.json();
        setSensors(prev => [...prev, savedSensor]); // Add new sensor from response to state
        setModalVisible(false);

    } catch (error) {
        console.error("Save sensor error:", error);
        Alert.alert('Error', 'Could not save the sensor.');
    }
  };

  // --- DELETE SENSOR FROM BACKEND ---
  const handleDeleteSensor = (id: string) => {
    Alert.alert(
      "Delete Sensor",
      "Are you sure you want to delete this sensor?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await fetch(`${API_BASE}/sensors/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Failed to delete sensor');
                
                setSensors(prevSensors => prevSensors.filter(sensor => sensor.id !== id));
            } catch (error) {
                console.error("Delete sensor error:", error);
                Alert.alert('Error', 'Could not delete the sensor.');
            }
          } 
        }
      ]
    );
  };

  const renderSensor = ({ item }: { item: Sensor }) => (
    <View style={styles.sensorCard}>
      <View style={styles.sensorInfo}>
        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#00FFC2" style={{marginRight: 8}}/>
        <View>
          <Text style={styles.sensorCardTitle}>{item.name}</Text>
          <Text style={styles.sensorCardPins}>{item.pins.join(', ')}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteSensor(item.id)}>
        <MaterialCommunityIcons name="close-circle-outline" size={20} color="rgba(255, 255, 255, 0.4)" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Sensors</Text>
        <TimezoneDisplay />
      </View>

      <FlatList
        data={sensors}
        renderItem={renderSensor}
        keyExtractor={item => item.id.toString()} // Ensure key is a string
        numColumns={4}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: gap }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="view-grid-plus-outline" size={60} color="#444" />
            <Text style={styles.emptyText}>No Sensors Added</Text>
            <Text style={styles.emptySubText}>Tap the '+' button to add your first sensor.</Text>
          </View>
        }
      />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            {/* Modal content remains the same */}
            <Text style={styles.modalTitle}>Add New Sensor</Text>
            <TextInput style={styles.input} placeholder="Sensor Name (e.g., Temp-01)" placeholderTextColor="#666" value={newName} onChangeText={setNewName} />
            <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Description" placeholderTextColor="#666" value={newDescription} onChangeText={setNewDescription} multiline />
            <Text style={styles.pinsLabel}>Select Pins:</Text>
            <View style={styles.pinsContainer}>
              {pinOptions.map(pin => (
                <TouchableOpacity key={pin} style={[ styles.pinButton, selectedPins.includes(pin) && styles.pinButtonSelected ]} onPress={() => handlePinSelect(pin)}>
                  <Text style={[ styles.pinButtonText, selectedPins.includes(pin) && styles.pinButtonTextSelected ]}>{pin}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveSensor}>
                <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={openAddSensorModal}>
        <MaterialCommunityIcons name="plus" size={30} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    timeContainer: { alignItems: 'flex-end' },
    timeText: { color: '#fff', fontSize: 16 },
    timezoneText: { color: '#888', fontSize: 12 },
    list: { paddingHorizontal: 20, paddingTop: 20 },
    sensorCard: {
      width: cardWidth,
      height: cardWidth * 0.7,
      backgroundColor: 'rgba(28, 28, 30, 0.7)',
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 10,
    },
    sensorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sensorCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, },
    sensorCardPins: { color: '#00FFC2', fontSize: 12, marginTop: 2, },
    emptyContainer: { alignItems: 'center', paddingTop: '20%' },
    emptyText: { color: '#999', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
    emptySubText: { color: '#666', fontSize: 14, marginTop: 5 },
    fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#00FFC2', justifyContent: 'center', alignItems: 'center', right: 20, bottom: 30, elevation: 8, },
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', },
    modalView: {
      width: '90%',
      maxWidth: 500,
      backgroundColor: '#1E1E1E',
      borderRadius: 20,
      padding: 25,
      alignItems: 'stretch',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center', },
    input: { backgroundColor: '#2b2b2b', color: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, },
    descriptionInput: { height: 80, textAlignVertical: 'top' },
    pinsLabel: { color: '#999', fontSize: 14, marginBottom: 10 },
    pinsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25, },
    pinButton: { borderWidth: 1, borderColor: '#555', borderRadius: 20, width: 60, height: 40, justifyContent: 'center', alignItems: 'center', },
    pinButtonSelected: { backgroundColor: '#00FFC2', borderColor: '#00FFC2' },
    pinButtonText: { color: '#999', fontSize: 16, fontWeight: 'bold' },
    pinButtonTextSelected: { color: '#000' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    button: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
    cancelButton: { backgroundColor: '#333', marginRight: 10 },
    saveButton: { backgroundColor: '#007AFF' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    saveButtonText: { color: '#fff' },
});
