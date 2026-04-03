import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderStatus = () => {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const router = useRouter();

  const fetchStatus = async () => {
    try {
      // 1. Get data from storage
      const storedRole = await AsyncStorage.getItem('role');
      const storedId = await AsyncStorage.getItem('userId');
      const storedUser = await AsyncStorage.getItem('user');

      let finalRole = storedRole;
      let finalId = storedId;

      // 2. If individual keys are null, extract from the 'user' object
      if (!finalRole || !finalId) {
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          finalRole = parsedUser.role;
          finalId = parsedUser._id || parsedUser.id;
        }
      }

      // 3. Update State
      setCurrentUserRole(finalRole || '');
      setCurrentUserId(finalId || '');

      // 4. Fetch order details
      const res = await axios.get(`${BASE_URL}/api/orders/${orderId}`);
      setOrder(res.data.order);
      
      // NEW DEBUG LOG TO VERIFY FIX
      console.log("--- FIXED AUTH CHECK ---");
      console.log("Detected Role:", finalRole);
      console.log("Detected ID:", finalId);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { if (orderId) fetchStatus(); }, [orderId]);

  const handleAction = async () => {
    setLoading(true);
    try {
      // --- FARMER ACTION: ACCEPT ORDER ---
      if (currentUserRole === 'Farmer' && order.status === 'PENDING') {
        // Fix for Web: Alert.prompt only works on iOS. Using standard Alert for cross-platform.
        const confirmAndAccept = async (days: string) => {
          const daysNum = parseInt(days) || 3;
          const dDate = new Date();
          dDate.setDate(dDate.getDate() + daysNum);

          const res = await axios.put(`${BASE_URL}/api/orders/farmer-accept/${order._id}`, {
            deliveryDate: dDate,
            status: 'ACCEPTED' 
          });

          if (res.data.success) {
            Alert.alert("Success ✅", "Shipment initiated. Progress bar updated.");
            fetchStatus();
          }
        };

        if (Platform.OS === 'ios') {
          Alert.prompt("Delivery Time", "Days to deliver?", [{ text: "Confirm", onPress: (d) => confirmAndAccept(d || "3") }], "plain-text", "3");
        } else {
          // Standard Alert for Android/Web Browser
          Alert.alert("Confirm Shipment", "Start shipment for this order?", [
            { text: "Cancel", style: "cancel" },
            { text: "Accept (3 Days)", onPress: () => confirmAndAccept("3") }
          ]);
        }
      }
      // --- BUYER ACTION: RELEASE FUNDS ---
      else if (currentUserRole === 'Buyer' && order.status === 'ACCEPTED') {
        const res = await axios.post(`${BASE_URL}/api/orders/finalize/${orderId}`);
        if (res.data.success) {
          Alert.alert("Funds Released ⚙️", "₹" + order.totalAmount + " transferred to Farmer's wallet.");
          fetchStatus();
        }
      }
    } catch (err: any) {
      Alert.alert("Transaction Failed", err.response?.data?.message || "Check Network");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert("Reject Order?", "This will unlock buyer funds.", [
      { text: "No" },
      { text: "Yes, Reject", style: 'destructive', onPress: async () => {
        await axios.put(`${BASE_URL}/api/orders/update/${orderId}`, { status: 'REJECTED' });
        fetchStatus();
      }}
    ]);
  };

  if (!order) return <ActivityIndicator size="large" color="#1B4332" style={{ flex: 1 }} />;

  // CRITICAL: Robust ID Comparison (Trims and handles Object vs String)
  const farmerIdRaw = order.farmerId?._id || order.farmerId;
  const isOwner = currentUserId.toString() === farmerIdRaw.toString();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Blockchain Audit Trail</Text>
        <Text style={styles.hash}>TX ID: {order.blockchainHash}</Text>

        {/* --- TRACEABILITY PROGRESS BAR --- */}
        <View style={styles.trackerContainer}>
          <View style={styles.step}>
            <Ionicons name="checkmark-circle" size={24} color="#2D6A4F" />
            <Text style={styles.stepText}>Funds Locked</Text>
          </View>
          <View style={[styles.line, (order.status !== 'PENDING' && order.status !== 'REJECTED') && styles.lineActive]} />
          <View style={styles.step}>
            <Ionicons 
              name={(order.status === 'PENDING' || order.status === 'REJECTED') ? "ellipse-outline" : "checkmark-circle"} 
              size={24} 
              color={(order.status === 'PENDING' || order.status === 'REJECTED') ? "#ccc" : "#2D6A4F"} 
            />
            <Text style={styles.stepText}>Shipped</Text>
          </View>
          <View style={[styles.line, order.status === 'COMPLETED' && styles.lineActive]} />
          <View style={styles.step}>
            <Ionicons 
              name={order.status === 'COMPLETED' ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={order.status === 'COMPLETED' ? "#2D6A4F" : "#ccc"} 
            />
            <Text style={styles.stepText}>Settled</Text>
          </View>
        </View>

        {/* --- ORDER SUMMARY CARD --- */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Commodity:</Text>
            <Text style={styles.value}>{order.productId?.name || "Loading..."}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Locked:</Text>
            <Text style={styles.value}>₹{order.totalAmount}</Text>
          </View>
          
          {order.deliveryDate && (
            <View style={styles.dateRow}>
               <FontAwesome5 name="calendar-check" size={14} color="#2D6A4F" />
               <Text style={styles.dateText}>
                 Delivery expected: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
               </Text>
            </View>
          )}
        </View>

        {/* --- ACTION ZONE --- */}
        <View style={{ marginTop: 25 }}>
          
          {/* 1. FARMER ACTIONS */}
          {currentUserRole === 'Farmer' && isOwner && order.status === 'PENDING' && (
            <View style={{ gap: 12 }}>
              <TouchableOpacity style={styles.mainBtn} onPress={handleAction} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CONFIRM & INITIATE SHIPMENT</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#fee2e2'}]} onPress={handleReject}>
                <Text style={[styles.btnText, {color: '#b91c1c'}]}>REJECT ORDER</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 2. BUYER WAITING STATE */}
          {currentUserRole === 'Buyer' && order.status === 'PENDING' && (
            <View style={styles.waitingContainer}>
              <ActivityIndicator size="small" color="#B45309" />
              <Text style={styles.waitingText}>Waiting for Farmer to ship...</Text>
            </View>
          )}

          {/* 3. BUYER RELEASE ACTION */}
          {currentUserRole === 'Buyer' && order.status === 'ACCEPTED' && (
            <View style={{ gap: 15 }}>
              <View style={styles.infoBox}>
                 <Ionicons name="shield-checkmark" size={20} color="#1B4332" />
                 <Text style={styles.infoText}>Only release funds once the crop is physically delivered to you.</Text>
              </View>
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#FFC107' }]} onPress={handleAction}>
                <Text style={[styles.btnText, { color: '#000' }]}>ACCEPT DELIVERY & RELEASE PAYMENT</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 4. FINAL STATES */}
          {order.status === 'COMPLETED' && (
            <View style={styles.completedContainer}>
              <MaterialCommunityIcons name="shield-check" size={50} color="#2D6A4F" />
              <Text style={styles.completedText}>Smart Escrow Settled</Text>
              <Text style={styles.subCompletedText}>Funds released to Farmer. Ledger Closed.</Text>
            </View>
          )}

          {order.status === 'REJECTED' && (
            <View style={[styles.completedContainer, {backgroundColor: '#fee2e2'}]}>
              <Ionicons name="close-circle" size={50} color="#b91c1c" />
              <Text style={[styles.completedText, {color: '#b91c1c'}]}>Order Cancelled</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  backBtn: { marginBottom: 10, width: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B4332' },
  hash: { fontSize: 9, color: '#999', marginBottom: 25, fontFamily: 'monospace' },
  trackerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  step: { alignItems: 'center', width: 85 },
  stepText: { fontSize: 10, marginTop: 5, color: '#555', fontWeight: 'bold' },
  line: { flex: 1, height: 2, backgroundColor: '#ccc', marginHorizontal: -15, marginBottom: 15 },
  lineActive: { backgroundColor: '#2D6A4F' },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#777', fontSize: 13 },
  value: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  dateRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 5, gap: 8 },
  dateText: { fontSize: 13, color: '#2D6A4F', fontWeight: 'bold' },
  mainBtn: { backgroundColor: '#1B4332', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  waitingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBEB', padding: 15, borderRadius: 12 },
  waitingText: { marginLeft: 10, color: '#B45309', fontWeight: 'bold' },
  infoBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, gap: 8 },
  infoText: { flex: 1, fontSize: 12, color: '#1B4332' },
  completedContainer: { alignItems: 'center', padding: 25, borderRadius: 15, backgroundColor: '#f0fdf4' },
  completedText: { fontSize: 18, fontWeight: 'bold', color: '#2D6A4F', marginTop: 10 },
  subCompletedText: { color: '#666', fontSize: 12, textAlign: 'center' }
});

export default OrderStatus;