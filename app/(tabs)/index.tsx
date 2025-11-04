// File: frontend/app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, // Use FlatList for the main grid
  TextInput, Alert, StatusBar, Modal, Dimensions, Platform, ScrollView, ActivityIndicator
} from 'react-native';
// Import DraggableFlatList separately
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
// NOTE: Ensure GestureHandlerRootView wraps your app, typically in _layout.tsx

const API_BASE = Platform.select({
  ios: "http://localhost:8000",
  android: "http://10.0.2.2:8000",
  default: "http://localhost:8000",
});

const AVAILABLE_PINS = Array.from({ length: 8 }, (_, i) => `P${i + 1}`);

// --- Interfaces ---
interface Floor {
  id: string;
  name: string;
  pins: string[];
}

interface System {
  id: string;
  name: string;
  description: string;
  floors: Floor[];
}

// Timezone Display
const TimezoneDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedTime = currentTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{formattedTime}</Text>
      <Text style={styles.timezoneText}>{timezone.split('/').pop()?.replace('_', ' ')}</Text>
    </View>
  );
};

// Layout Constants
const { width: windowWidth } = Dimensions.get('window');
const gap = 10;
const numGridCols = 4;
const totalGapSpace = (numGridCols - 1) * gap;
const cardWidth = (windowWidth - 40 - totalGapSpace) / numGridCols;

export default function HomeScreen() {
  const [systems, setSystems] = useState<System[]>([]);
  const [isAddSystemModalVisible, setAddSystemModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isAddFloorModalVisible, setAddFloorModalVisible] = useState(false);
  const [isEditPinsModalVisible, setEditPinsModalVisible] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [tempPinAssignments, setTempPinAssignments] = useState<System | null>(null);

  const [newSystemName, setNewSystemName] = useState('');
  const [newSystemDescription, setNewSystemDescription] = useState('');
  const [newFloorName, setNewFloorName] = useState('');

  const router = useRouter();

  // --- API Call Functions ---

  const fetchSystems = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { router.replace('/'); return; }
      const response = await fetch(`${API_BASE}/systems/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { await AsyncStorage.removeItem('token'); router.replace('/'); return; }
      if (!response.ok) throw new Error('Failed to fetch systems');
      const data = await response.json();
      setSystems(data);
    } catch (error: any) {
      console.error("Fetch systems error:", error);
      Alert.alert('Error', 'Could not load system data.');
    }
  }, [router]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  const handleSaveSystem = async () => {
    if (!newSystemName.trim()) { Alert.alert('Validation Error', 'System name is required.'); return; }
    try {
        const token = await AsyncStorage.getItem('token');
        const newSystemData = { name: newSystemName, description: newSystemDescription };
        const response = await fetch(`${API_BASE}/systems/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newSystemData)
        });
        if (!response.ok) throw new Error('Failed to save system');
        const updatedSystemsList = await response.json();
        setSystems(updatedSystemsList);
        setAddSystemModalVisible(false);
        setNewSystemName('');
        setNewSystemDescription('');
    } catch (error: any) {
        console.error("Save system error:", error);
        Alert.alert('Error', `Could not save system: ${error.message}`);
    }
  };

  const handleDeleteSystem = async (id: string) => {
    console.log(`[Delete System] Deleting system: ${id}`);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/systems/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok || response.status === 204) {
        setSystems(prev => prev.filter(sys => sys.id !== id));
      } else {
        const errorData = await response.text(); throw new Error(errorData || 'Failed to delete system');
      }
    } catch (error: any) {
      console.error("[Delete System] Error:", error.message);
      Alert.alert('Error', `Could not delete system: ${error.message}`);
      await fetchSystems();
    }
  };

  const handleAddFloor = async () => {
      if (!newFloorName.trim() || !selectedSystem) {
        Alert.alert('Error', 'Floor name cannot be empty.');
        return;
      }
      const trimmedName = newFloorName.trim();
      const nameExists = selectedSystem.floors.some(
          floor => floor.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (nameExists) {
          Alert.alert('Error', `A floor named '${trimmedName}' already exists in this system.`);
          return;
      }

      try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_BASE}/systems/${selectedSystem.id}/floors`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: trimmedName })
          });
          if (!response.ok) {
             const err = await response.json(); throw new Error(err.detail || 'Failed to add floor');
          }
          const updatedSystemData = await response.json();

          setSystems(prevSystems => prevSystems.map(sys =>
              sys.id === updatedSystemData.id ? updatedSystemData : sys
          ));
          setSelectedSystem(updatedSystemData);

          setAddFloorModalVisible(false);
          setNewFloorName('');

      } catch (error: any) {
          console.error("Add floor error:", error);
          Alert.alert('Error', `Could not add floor: ${error.message}`);
      }
    };

  // --- MODIFIED: This function is now fixed and will show pop-ups ---
  const handleSendData = async () => {
    // REMOVED the broken Alert.alert wrapper
    try {
      console.log("[Send Data] Attempting to send...");
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/systems/send`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (!response.ok) {
          console.error("[Send Data] Server error:", data.detail);
          throw new Error(data.detail || 'Failed to send data');
      }

      // This "Success" pop-up will now appear
      console.log("[Send Data] Success:", data.message);
      Alert.alert('Success', data.message || 'Data sent successfully!');

    } catch (error: any) {
      // This "Error" pop-up will now appear on failure
      console.error("[Send Data] Catch Block:", error.message);
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    }
  };

  // --- MODIFIED: This function now calls handleSendData on success ---
  const handleUpdateSystemPinAssignments = async () => {
    if (!tempPinAssignments) return;

    const assignmentsPayload = {
        assignments: tempPinAssignments.floors.map(floor => ({
            floor_id: floor.id,
            pins: floor.pins
        }))
    };

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE}/systems/${tempPinAssignments.id}/pin_assignments`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(assignmentsPayload)
        });
         if (!response.ok) {
           const err = await response.json(); throw new Error(err.detail || 'Failed to update pin assignments');
         }
        const updatedSystemData = await response.json();

        setSystems(prevSystems => prevSystems.map(sys =>
            sys.id === updatedSystemData.id ? updatedSystemData : sys
        ));
        setSelectedSystem(updatedSystemData);
        setEditPinsModalVisible(false);
        setTempPinAssignments(null);

        // --- NEW FEATURE ---
        // After successfully saving, automatically send data to Divyani
        console.log("Pin assignments saved. Now sending data to external API...");
        await handleSendData(); // <--- CALLS THE FIXED SEND FUNCTION
        // --- END NEW FEATURE ---

    } catch (error: any) {
        console.error("Update pin assignments error:", error);
        Alert.alert('Error', `Could not update pin assignments: ${error.message}`);
         setEditPinsModalVisible(false);
         setTempPinAssignments(null);
    }
  };

   const handleDeleteFloor = async (systemId: string, floorId: string) => {
    try {
      console.log(`[Delete Floor Test] Attempting delete: System ${systemId}, Floor ${floorId}`);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/systems/${systemId}/floors/${floorId}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok && response.status !== 204) {
          const err = await response.text();
          console.error("[Delete Floor Test] Server error response:", err);
          throw new Error(err || 'Failed to delete floor');
      }

      console.log("[Delete Floor Test] Success from server.");
       const currentSelectedSystem = systems.find(sys => sys.id === systemId);
       if (currentSelectedSystem) {
           const newFloors = currentSelectedSystem.floors.filter(f => f.id !== floorId);
           const systemWithFloorDeleted = {...currentSelectedSystem, floors: newFloors };
           setSystems(prev => prev.map(sys => sys.id === systemId ? systemWithFloorDeleted : sys));
           setSelectedSystem(systemWithFloorDeleted);
           console.log("[Delete Floor Test] UI updated optimistically.");
       } else {
           console.warn("[Delete Floor Test] Could not find system locally after delete attempt. Refetching.");
           await fetchSystems();
       }

    } catch (error: any) {
        console.error("[Delete Floor Test] CATCH BLOCK:", error);
        Alert.alert('Error', `Could not delete floor: ${error.message}`);
        await fetchSystems();
        const refreshedSystem = systems.find(sys => sys.id === systemId);
        setSelectedSystem(refreshedSystem || null);
    }
  };

  const handleSaveFolderOrder = async (orderedFloors: Floor[]) => {
      if (!selectedSystem) return;
      setIsSavingOrder(true);
      const orderedFloorIds = orderedFloors.map(f => f.id);
      try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_BASE}/systems/${selectedSystem.id}/floor_order`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ ordered_floor_ids: orderedFloorIds })
          });
          if (!response.ok) {
              const err = await response.json(); throw new Error(err.detail || 'Failed to save order');
          }
          const updatedSystemData = await response.json();
           setSystems(prevSystems => prevSystems.map(sys =>
               sys.id === updatedSystemData.id ? updatedSystemData : sys
           ));
           setSelectedSystem(updatedSystemData);
           console.log("Floor order saved successfully.");

      } catch (error: any) {
          console.error("Save floor order error:", error);
          Alert.alert('Error', `Could not save floor order: ${error.message}`);
          const originalSystem = systems.find(sys => sys.id === selectedSystem.id);
          setSelectedSystem(originalSystem || null);

      } finally {
          setIsSavingOrder(false);
      }
  };


  // --- Modal Open/Close Handlers ---
  const openAddSystemModalHandler = () => {
    setNewSystemName('');
    setNewSystemDescription('');
    setAddSystemModalVisible(true);
  };
  const openDetailModalHandler = (system: System) => {
    setSelectedSystem(system);
    setDetailModalVisible(true);
  };
  const openAddFloorModalHandler = () => {
    if (!selectedSystem) return;
    setNewFloorName('');
    setAddFloorModalVisible(true);
   };

  const openEditPinsModalHandler = () => {
    if (!selectedSystem) return;
    setTempPinAssignments(JSON.parse(JSON.stringify(selectedSystem)));
    setEditPinsModalVisible(true);
  };

  const closeEditPinsModal = () => {
      setEditPinsModalVisible(false);
      setTempPinAssignments(null);
  }

  // --- Drag and Drop Handler ---
  const handleDragEnd = ({ data: reorderedFloors }: { data: Floor[] }) => {
    if (!selectedSystem) return;
    const updatedSystem = { ...selectedSystem, floors: reorderedFloors };
    setSelectedSystem(updatedSystem);
    handleSaveFolderOrder(reorderedFloors);
  };

  const handlePinCellPress = (floorId: string, pin: string) => {
    if (!tempPinAssignments) return;

    const updatedSystem = JSON.parse(JSON.stringify(tempPinAssignments));
    let pinCurrentlyAssignedTo: string | null = null;
    let currentFloorIndex = -1;

    updatedSystem.floors.forEach((floor: Floor, index: number) => {
        if (floor.id === floorId) currentFloorIndex = index;
        if (floor.pins.includes(pin)) pinCurrentlyAssignedTo = floor.id;
    });

    if (currentFloorIndex === -1) return;

    if (pinCurrentlyAssignedTo === floorId) {
        updatedSystem.floors[currentFloorIndex].pins = updatedSystem.floors[currentFloorIndex].pins.filter((p: string) => p !== pin);
    } else {
        if (pinCurrentlyAssignedTo) {
             updatedSystem.floors.forEach((floor: Floor) => {
                 if (floor.id === pinCurrentlyAssignedTo) {
                     floor.pins = floor.pins.filter((p: string) => p !== pin);
                 }
             });
        }
        updatedSystem.floors[currentFloorIndex].pins.push(pin);
    }
    setTempPinAssignments(updatedSystem);
  };


  // --- Render Functions ---
  const renderSystemCard = ({ item }: { item: System }) => (
    <TouchableOpacity style={styles.systemCard} onPress={() => openDetailModalHandler(item)}>
        <View style={styles.systemHeader}>
            <MaterialCommunityIcons name="server-network" size={24} color="#00FFC2" />
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDeleteSystem(item.id); }}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
        </View>
        <View style={styles.systemInfo}>
            <Text style={styles.systemCardTitle} numberOfLines={1}>{item.name}</Text>
            {item.description ? (
                 <Text style={styles.systemCardDescription} numberOfLines={2} ellipsizeMode='tail'>
                     {item.description}
                 </Text>
            ) : null }
            <ScrollView style={styles.floorListInCard} nestedScrollEnabled={true}>
                {item.floors.length > 0 ? (
                    item.floors.map(floor => (
                        <View key={floor.id} style={styles.floorStatusItem}>
                            <View style={[
                                styles.statusDot,
                                floor.pins.length > 0 ? styles.statusDotGreen : styles.statusDotRed
                            ]} />
                            <Text style={styles.floorNameInCard} numberOfLines={1}>{floor.name}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noFloorsInCardText}>No Floors</Text>
                )}
            </ScrollView>
        </View>
    </TouchableOpacity>
  );

  const renderFloorItem = useCallback(({ item: floor, drag, isActive }: RenderItemParams<Floor>) => {
      if (!selectedSystem) return null;

      return (
          <ScaleDecorator>
              <TouchableOpacity
                  style={[ styles.floorListItem, isActive ? styles.floorListItemActive : {}, ]}
                  onLongPress={drag}
                  disabled={isActive}
              >
                   <MaterialCommunityIcons name="drag-vertical" size={24} color="#888" style={styles.dragHandle} />
                  <Text style={styles.floorName}>{floor.name}</Text>
                  <Text style={styles.floorPins}>Pins: {floor.pins.join(', ') || 'None'}</Text>
                  <TouchableOpacity
                      style={styles.deleteFloorButton}
                      onPress={() => handleDeleteFloor(selectedSystem.id, floor.id)} // Calls direct function
                  >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
              </TouchableOpacity>
          </ScaleDecorator>
      );
  }, [selectedSystem, handleDeleteFloor]); // <-- FIX: Added handleDeleteFloor dependency


  // --- Main Return ---
  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
         <View style={styles.header}>
          <Text style={styles.title}>My Systems</Text>
          <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleSendData} style={styles.sendButton}>
                  <MaterialCommunityIcons name="send-circle-outline" size={28} color="#00FFC2" />
              </TouchableOpacity>
              <TimezoneDisplay />
          </View>
        </View>
         <FlatList
             data={systems}
             renderItem={renderSystemCard}
             keyExtractor={item => item.id}
             numColumns={numGridCols}
             contentContainerStyle={styles.list}
             columnWrapperStyle={{ gap: gap }}
             ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                      <MaterialCommunityIcons name="view-grid-plus-outline" size={60} color="#444" />
                      <Text style={styles.emptyText}>No Systems Added</Text>
                      <Text style={styles.emptySubText}>Tap the '+' button to add your first system.</Text>
                  </View>
             }
           />

        {/* --- ADD SYSTEM MODAL --- */}
        <Modal visible={isAddSystemModalVisible} onRequestClose={() => setAddSystemModalVisible(false)} transparent={true} animationType="fade" >
           <View style={styles.modalBackdrop}>
               <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Add New System</Text>
                  <TextInput style={styles.input} placeholder="System Name" placeholderTextColor="#666" value={newSystemName} onChangeText={setNewSystemName}/>
                  <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Description" placeholderTextColor="#666" value={newSystemDescription} onChangeText={setNewSystemDescription} multiline/>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setAddSystemModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveSystem}>
                      <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
        </Modal>

         {/* --- SYSTEM DETAIL MODAL --- */}
         <Modal visible={isDetailModalVisible} onRequestClose={() => setDetailModalVisible(false)} transparent={true} animationType="fade">
             <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDetailModalVisible(false)}>
                 {selectedSystem && (
                     <TouchableOpacity style={[styles.modalView, styles.detailModalView]} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                         <Text style={styles.modalTitle}>{selectedSystem.name}</Text>
                         <Text style={styles.detailDescription}>{selectedSystem.description || 'No description.'}</Text>
                         <Text style={styles.floorListTitle}>Floors: (Long press to reorder)</Text>
                          <DraggableFlatList
                              data={selectedSystem.floors}
                              keyExtractor={(floor) => floor.id}
                              renderItem={renderFloorItem}
                              onDragEnd={handleDragEnd}
                              ListEmptyComponent={<Text style={styles.noFloorsText}>No floors added yet.</Text>}
                              style={styles.floorList}
                          />
                         <TouchableOpacity style={[styles.button, styles.addFloorButton]} onPress={openAddFloorModalHandler}>
                             <Text style={styles.buttonText}>+ Add Floor</Text>
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.button, styles.editAllPinsButton]} onPress={openEditPinsModalHandler}>
                             <Text style={styles.buttonText}>Edit Pin Assignments</Text>
                         </TouchableOpacity>
                          {isSavingOrder && <ActivityIndicator size="small" color="#aaa" style={styles.savingIndicator} />}
                     </TouchableOpacity>
                 )}
             </TouchableOpacity>
         </Modal>


        {/* --- ADD FLOOR MODAL --- */}
        <Modal visible={isAddFloorModalVisible} onRequestClose={() => setAddFloorModalVisible(false)} transparent={true} animationType="fade">
           <View style={styles.modalBackdrop}>
               <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Add New Floor to {selectedSystem?.name}</Text>
                  <TextInput style={styles.input} placeholder="Floor Name" placeholderTextColor="#666" value={newFloorName} onChangeText={setNewFloorName} autoFocus={true}/>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setAddFloorModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddFloor}>
                      <Text style={[styles.buttonText, styles.saveButtonText]}>Add Floor</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
        </Modal>

        {/* --- EDIT PINS MODAL --- */}
        <Modal visible={isEditPinsModalVisible} onRequestClose={closeEditPinsModal} transparent={true} animationType="fade">
           <View style={styles.modalBackdrop}>
               <View style={[styles.modalView, styles.editPinsModalView]}>
                  <Text style={styles.modalTitle}>Assign Pins for {tempPinAssignments?.name}</Text>
                  <ScrollView horizontal={true} contentContainerStyle={styles.pinMatrixScrollView}>
                    <View>
                        <View style={[styles.pinMatrixRow, styles.pinMatrixHeaderRow]}>
                            <View style={styles.floorHeaderCell}><Text style={styles.pinMatrixHeaderText}></Text></View>
                            {AVAILABLE_PINS.map(pin => (
                                <View key={pin} style={styles.pinHeaderCell}><Text style={styles.pinMatrixHeaderText}>{pin}</Text></View>
                            ))}
                        </View>
                        {tempPinAssignments?.floors.map((floor) => {
                            const takenByOthers = new Set<string>();
                            tempPinAssignments.floors.forEach(otherFloor => {
                                if (otherFloor.id !== floor.id) {
                                    otherFloor.pins.forEach(p => takenByOthers.add(p));
                                }
                            });

                            return (
                                <View key={floor.id} style={styles.pinMatrixRow}>
                                    <View style={styles.floorHeaderCell}><Text style={styles.floorNameText}>{floor.name}</Text></View>
                                    {AVAILABLE_PINS.map(pin => {
                                        const isAssignedToCurrent = floor.pins.includes(pin);
                                        const isAssignedToOther = takenByOthers.has(pin);
                                        const isDisabled = isAssignedToOther && !isAssignedToCurrent;

                                        return (
                                            <TouchableOpacity
                                                key={`${floor.id}-${pin}`}
                                                style={[
                                                    styles.pinCell,
                                                    isAssignedToCurrent && styles.pinCellSelected,
                                                    isAssignedToOther && !isAssignedToCurrent && styles.pinCellTaken,
                                                ]}
                                                onPress={() => handlePinCellPress(floor.id, pin)}
                                                disabled={isDisabled}
                                            />
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>
                  </ScrollView>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeEditPinsModal}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateSystemPinAssignments}>
                      <Text style={[styles.buttonText, styles.saveButtonText]}>Save Assignments</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
        </Modal>

        <TouchableOpacity style={styles.fab} onPress={openAddSystemModalHandler}>
          <MaterialCommunityIcons name="plus" size={30} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    timeContainer: { alignItems: 'flex-end' },
    timeText: { color: '#fff', fontSize: 16 },
    timezoneText: { color: '#888', fontSize: 12 },
    list: { paddingHorizontal: 20, paddingTop: 10 },
    systemCard: {
        width: cardWidth,
        minHeight: cardWidth * 0.75,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    systemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    systemInfo: {
        alignSelf: 'stretch',
        flex: 1,
    },
    systemCardTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 4,
    },
    systemCardDescription: {
        color: '#a0a0a0',
        fontSize: 11,
        marginBottom: 6,
    },
    floorListInCard: {
        flex: 1,
        marginTop: 4,
    },
    floorStatusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    statusDot: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        marginRight: 7,
    },
    statusDotGreen: {
        backgroundColor: '#2ecc71',
    },
    statusDotRed: {
        backgroundColor: '#e74c3c',
    },
    floorNameInCard: {
        color: '#D0D0D0',
        fontSize: 13,
        flexShrink: 1,
    },
    noFloorsInCardText: {
        color: '#888',
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 4,
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', },
    sendButton: { marginRight: 15, padding: 5, },
    emptyContainer: { alignItems: 'center', paddingTop: '20%', flex: 1, justifyContent: 'center' },
    emptyText: { color: '#999', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
    emptySubText: { color: '#666', fontSize: 14, marginTop: 5, textAlign: 'center' },
    fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#00FFC2', justifyContent: 'center', alignItems: 'center', right: 20, bottom: 30, elevation: 8, shadowColor: '#00FFC2', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }},
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', },
    modalView: { width: '90%', maxWidth: 400, backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'stretch', },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center', },
    input: { backgroundColor: '#2b2b2b', color: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, },
    descriptionInput: { height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    button: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cancelButton: { backgroundColor: '#333', marginRight: 10, flex: 1 },
    saveButton: { backgroundColor: '#007AFF', flex: 1 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    saveButtonText: { color: '#fff' },
    // Detail Modal Styles
    detailModalView: { maxHeight: '85%', width: '90%', maxWidth: 550 },
    detailDescription: { color: '#b0b0b0', fontSize: 15, textAlign: 'center', marginBottom: 20, },
    floorListTitle: { fontSize: 16, fontWeight: '600', color: '#ccc', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 5 },
    floorList: { width: '100%', maxHeight: 300, marginBottom: 15 },
    floorListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        paddingRight: 15,
        borderRadius: 8,
        marginBottom: 8,
    },
    floorListItemActive: {
        backgroundColor: '#3a3a3a',
        opacity: 0.9,
        shadowColor: "#000",
        shadowOffset: {	width: 0, height: 2, },
	    shadowOpacity: 0.25,
	    shadowRadius: 3.84,
	    elevation: 5,
    },
    dragHandle: {
        marginRight: 10,
        paddingLeft: 10,
    },
    floorName: { color: '#eee', fontSize: 15, flex: 2, marginRight: 10 },
    floorPins: { color: '#888', fontSize: 12, flex: 3, marginRight: 10 },
    deleteFloorButton: { padding: 5, marginLeft: 10 },
    noFloorsText: { color: '#888', textAlign: 'center', marginTop: 15, fontStyle: 'italic' },
    addFloorButton: { backgroundColor: '#007AFF', marginBottom: 10, alignSelf: 'stretch' },
    editAllPinsButton: { backgroundColor: '#5856D6', alignSelf: 'stretch' },
    savingIndicator: { marginTop: 10, },

    // Edit Pins Modal Styles
    editPinsModalView: { width: '95%', maxWidth: 800 },
    pinMatrixScrollView: { paddingBottom: 10 },
    pinMatrixRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5},
    pinMatrixHeaderRow: { borderBottomWidth: 1, borderBottomColor: '#555', paddingBottom: 8, marginBottom: 8},
    floorHeaderCell: { width: 100, paddingRight: 10, alignItems: 'flex-start'},
    pinHeaderCell: { width: 45, alignItems: 'center'},
    pinMatrixHeaderText: { color: '#aaa', fontSize: 12, fontWeight: 'bold'},
    floorNameText: { color: '#eee', fontSize: 14, fontWeight: '500'},
    pinCell: {
        width: 45, height: 35,
        borderRadius: 6,
        backgroundColor: '#444',
        borderWidth: 1,
        borderColor: '#555',
        marginHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinCellSelected: {
        backgroundColor: '#2ecc71', // Green
        borderColor: '#27ae60',
    },
    pinCellTaken: {
        backgroundColor: '#e74c3c', // Red
        borderColor: '#c0392b',
        opacity: 0.7,
    },
});