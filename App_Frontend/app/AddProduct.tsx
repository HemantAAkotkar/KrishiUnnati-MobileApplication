import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL, API_HEADERS } from '../constants/config';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Grains',
    price: '',
    quantity: '',
    description: '',
    image: null as string | null
  });

  // 1. Pick Image from Gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  // 2. AI Price Prediction Logic
  const getAiPrice = async () => {
    if (!form.name || !form.quantity) {
      Alert.alert("Error", "Enter Crop Name and Quantity for AI to analyze.");
      return;
    }
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr || '{}');

      const res = await axios.post(`${BASE_URL}/api/ai/predict-price`, {
        name: form.name,
        quantity: form.quantity,
        state: user.state || "Maharashtra"
      }, { headers: API_HEADERS });

      setForm({ ...form, price: res.data.predictedPrice.toString() });
      Alert.alert("AI Suggestion", `Best market price: ₹${res.data.predictedPrice}/quintal`);
    } catch (e) {
      Alert.alert("AI Offline", "Ensure Python server is running on port 5001");
    } finally {
      setLoading(false);
    }
  };

  // 3. Final Submit Logic (Cloudinary + MongoDB)
  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.quantity || !form.image) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(userStr || '{}');

      // 1. Prepare FormData
      const formData = new FormData();
      const uri = form.image;
      const fileName = uri.split('/').pop();
      const fileType = fileName.split('.').pop();

      formData.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      } as any);

      // 2. Upload using native FETCH (Better for Multipart)
      console.log("🚀 Uploading to:", `${BASE_URL}/api/products/upload`);
      
      const uploadResponse = await fetch(`${BASE_URL}/api/products/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          // Note: DO NOT set Content-Type here; fetch sets it with the boundary automatically
        },
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || "Upload failed");
      }

      const finalImageUrl = uploadResult.url || uploadResult.imageUrl;
      console.log("✅ Image URL:", finalImageUrl);

      // 3. Save Product Data (Back to Axios for JSON)
      const response = await axios.post(`${BASE_URL}/api/products/add`, {
        name: form.name,
        category: form.category || "Grains",
        price: Number(form.price),
        quantity: Number(form.quantity),
        image: finalImageUrl,
        sellerId: user._id,
        description: form.description,
        location: { state: user.state, district: user.district }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert("Success ✅", "Crop listed!");
        router.replace('/(drawer)/FarmerDashboard');
      }

    } catch (e) {
      console.log("❌ Error:", e.message);
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>List New Crop</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image }} style={styles.preview} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="camera" size={50} color="#1B4332" />
            <Text style={{ color: '#1B4332', marginTop: 10, fontWeight: '500' }}>Add Crop Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Crop Name (e.g., Basmati Rice)"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Price / Quintal"
          keyboardType="numeric"
          value={form.price}
          onChangeText={(v) => setForm({ ...form, price: v })}
        />
        <TouchableOpacity style={styles.aiBtn} onPress={getAiPrice}>
          <MaterialCommunityIcons name="robot" size={22} color="#fff" />
          <Text style={styles.aiBtnText}>AI Predict</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Available Quantity (Quintals)"
        keyboardType="numeric"
        value={form.quantity}
        onChangeText={(v) => setForm({ ...form, quantity: v })}
      />

      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        placeholder="Describe quality, variety, or harvest date..."
        multiline
        numberOfLines={4}
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
      />

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>List Crop in Marketplace</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', marginBottom: 20 },
  imageBox: {
    height: 200,
    backgroundColor: '#F0FDF4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#1B4332',
    marginBottom: 20,
    overflow: 'hidden'
  },
  preview: { width: '100%', height: '100%' },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    fontSize: 16
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 15 },
  aiBtn: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2
  },
  aiBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  submitBtn: {
    backgroundColor: '#1B4332',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});