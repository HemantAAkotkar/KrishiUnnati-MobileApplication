import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL } from '../constants/config'; // Import the global IP
// const IP_address = "192.168.135.153";
export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', price: '', quantity: '', description: '', image: null
  });

  // 1. Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    if (!result.canceled) setForm({ ...form, image: result.assets[0].uri });
  };
  
  // 2. AI Price Prediction logic
  const getAiPrice = async () => {
    if (!form.name || !form.quantity) {
      Alert.alert("Error", "Enter Crop Name and Quantity for AI to analyze.");
      return;
    }
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      // Calling your Node.js Bridge -> which calls FastAPI
      const res = await axios.post(`${BASE_URL}/api/ai/predict-price`, {
        name: form.name,
        quantity: form.quantity,
        state: user.state
      });
      
      setForm({ ...form, price: res.data.predictedPrice.toString() });
      Alert.alert("AI Suggestion", `Best market price: ₹${res.data.predictedPrice}/quintal`);
    } catch (e) {
      Alert.alert("AI Offline", "Check if Python server is running on port 5001");
    } finally { setLoading(false); }
  };

  // 3. Final Submit (Cloudinary + MongoDB)
  const handleSubmit = async () => {
  if (!form.image) {
    Alert.alert("Missing Info", "Please upload a crop image first.");
    return;
  }

  setLoading(true);
  try {
    // 1. Get Data from Storage
    const userStr = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token'); // Added this!
    
    if (!userStr || !token) {
      Alert.alert("Error", "Session missing. Please login again.");
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user._id || user.id; // Failsafe for ID

    if (!userId) {
      console.log("User object in storage:", user);
      Alert.alert("Error", "User ID not found in session.");
      return;
    }

    // 2. Image Upload Step
    const formData = new FormData();
    formData.append('image', { 
      uri: form.image, 
      type: 'image/jpeg', 
      name: 'crop.jpg' 
    } as any);

    const uploadRes = await axios.post(`${BASE_URL}/api/products/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 3. Prepare Final Payload
    const productPayload = {
      name: form.name,
      category: "Grains", 
      price: Number(form.price),
      quantity: Number(form.quantity),
      image: uploadRes.data.url,
      sellerId: userId, // Using our failsafe ID
      description: form.description,
      location: { 
        state: user.state || "Not Specified", 
        district: user.district || "Not Specified" 
      }
    };

    console.log("Final Payload being sent:", productPayload);

    // 4. Submit to Database
    const response = await axios.post(`${BASE_URL}/api/products/add`, productPayload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });

    if (response.data.success) {
      Alert.alert("Success ✅", "Your crop has been listed in the market!");
      router.replace('/(drawer)/FarmerDashboard');
    }

  } catch (e: any) {
    console.log("Submit Error Log:", e.response?.data || e.message);
    const errorMsg = e.response?.data?.error || e.response?.data?.message || "Check your network connection.";
    Alert.alert("Failed to list", errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {form.image ? <Image source={{ uri: form.image }} style={styles.preview} /> : 
        <Ionicons name="camera" size={40} color="#1B4332" />}
        <Text style={{color: '#1B4332', marginTop: 5}}>Upload Crop Image</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Crop Name (e.g., Wheat)" value={form.name} onChangeText={(v)=>setForm({...form, name: v})} />
      
      <View style={styles.row}>
        <TextInput style={[styles.input, {flex: 1}]} placeholder="Price / Quintal" keyboardType="numeric" value={form.price} onChangeText={(v)=>setForm({...form, price: v})} />
        <TouchableOpacity style={styles.aiBtn} onPress={getAiPrice}>
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
          <Text style={styles.aiBtnText}>AI Predict</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Quantity (Quintals)" keyboardType="numeric" value={form.quantity} onChangeText={(v)=>setForm({...form, quantity: v})} />
      <TextInput style={[styles.input, {height: 100}]} placeholder="Describe your crop..." multiline value={form.description} onChangeText={(v)=>setForm({...form, description: v})} />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm & List Crop</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  imageBox: { height: 180, backgroundColor: '#F0FDF4', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#1B4332', marginBottom: 20 },
  preview: { width: '100%', height: '100%', borderRadius: 15 },
  input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 15 },
  aiBtn: { backgroundColor: '#1B4332', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  aiBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  submitBtn: { backgroundColor: '#1B4332', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});