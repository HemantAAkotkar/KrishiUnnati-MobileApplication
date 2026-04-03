// App_Frontend/app/(drawer)/farmer-orders.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BASE_URL } from '../../constants/config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // In a real app, you'd get this from a Global State (Context/Redux) or Storage
  // For the demo, ensure your Login saves the User ID to AsyncStorage
  const fetchOrders = async () => {
  try {
    const token = await AsyncStorage.getItem("token"); //
    const res = await axios.get(`${BASE_URL}/api/orders/farmer/my-orders`, {
      headers: { 'x-auth-token': token } // Fixes the identity handshake
    });
    setOrders(res.data.orders);
  } catch (err) {
    console.error("Sales Ledger Error:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchOrders(); }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/(drawer)/order-status",
        params: { orderId: item._id, role: 'FARMER' }
      })}
    >
      <View style={styles.headerRow}>
        <Text style={styles.productName}>{item.productId?.name}</Text>
        <Text style={[styles.statusBadge, item.status === 'PENDING' ? styles.pending : styles.accepted]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.buyerText}>Buyer: {item.buyerId?.name}</Text>
      <Text style={styles.priceText}>Secured: ₹{item.price}</Text>
      <Text style={styles.hashText}>Hash: {item.blockchainHash.substring(0, 18)}...</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Farmer Sales Ledger (Blockchain)</Text>
      {loading ? <ActivityIndicator size="large" color="#1B4332" /> : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          ListEmptyComponent={<Text style={styles.empty}>No blockchain trades initiated yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B4332', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 18, fontWeight: '700', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, fontSize: 10, fontWeight: 'bold' },
  buyerText: { color: '#666', marginTop: 5 },
  pending: { color: '#666', marginTop: 5 },
  accepted: { color: '#666', marginTop: 5 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#2D6A4F', marginTop: 5 },
  hashText: { fontSize: 10, color: '#999', fontFamily: 'monospace', marginTop: 5 },
  actionPrompt: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionText: { color: '#1B4332', fontWeight: 'bold', textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default FarmerOrders;