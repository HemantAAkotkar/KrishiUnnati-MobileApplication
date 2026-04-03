import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, BlockChainURL, API_HEADERS } from '../../constants/config';

const { width } = Dimensions.get('window');

const FarmerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState([]); // Crops (Farmers Only)
  const [orderHistory, setOrderHistory] = useState([]); // Persistent History (Both)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ active: 0, earnings: 0, totalOrders: 0 });

  /**
   * LOAD DATA FROM BACKEND
   */
  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const userId = parsedUser._id || parsedUser.id;

      // 1. Fetch PERSISTENT Orders (C: Drive)
      // We hit the user-specific route to ensure history stays after refresh
      const orderRes = await axios.get(`${BASE_URL}/api/orders/user/${userId}`);
      let myOrders = [];

      if (orderRes.data.success) {
        myOrders = orderRes.data.orders || [];
        setOrderHistory(myOrders);
      }

      // 2. Role-Specific Logic
      if (parsedUser.role?.toLowerCase() === 'farmer') {
        // --- FARMER VIEW ---
        const prodRes = await axios.get(`${BASE_URL}/api/products`);
        if (prodRes.data.success) {
          const myCrops = prodRes.data.products.filter((p: any) => {
            const sId = p.sellerId?._id || p.sellerId;
            return sId === userId;
          });
          setListings(myCrops);

          const earnings = myOrders
            .filter((o: any) => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

          setStats({ active: myCrops.length, earnings: earnings, totalOrders: myOrders.length });
        }
      } else {
        // --- BUYER VIEW ---
        setStats({ active: 0, earnings: 0, totalOrders: myOrders.length });
      }

    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isFarmer = user?.role?.toLowerCase() === 'farmer';

  if (loading && !refreshing) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#1B4332" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste,</Text>
            <Text style={styles.nameText}>{user?.fullName?.split(' ')[0] || 'User'}!</Text>
            <View style={styles.roleBadge}><Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text></View>
          </View>
          <TouchableOpacity style={styles.avatarBorder} onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.fullName}&background=1B4332&color=fff` }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* STATS SECTION */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="receipt-outline" size={20} color="#1B4332" />
            <Text style={styles.statNum}>{stats.totalOrders.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>{isFarmer ? "Total Sales" : "Orders Placed"}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F1F8E9' }]}>
            {isFarmer ? (
              <>
                <FontAwesome5 name="coins" size={18} color="#2D6A4F" />
                <Text style={styles.statNum}>₹{stats.earnings}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(drawer)/WalletScreen')}>
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#2D6A4F" />
                <Text style={styles.statNum}>Wallet</Text>
                <Text style={styles.statLabel}>Check Balance</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CONDITIONAL UI: Farmer Inventory vs Buyer Market Access */}
        {isFarmer ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Active Inventory</Text>
              <TouchableOpacity onPress={() => router.push('/AddProduct')}>
                <Ionicons name="add-circle" size={24} color="#2D6A4F" />
              </TouchableOpacity>
            </View>
            {listings.length === 0 ? <Text style={styles.emptyText}>No crops listed yet.</Text> :
              listings.slice(0, 2).map((item: any) => (
                <View key={item._id} style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.prodImg} />
                  <View style={styles.prodInfo}>
                    <Text style={styles.prodName}>{item.name}</Text>
                    <Text style={styles.prodDetails}>₹{item.price}/q • Stock: {item.quantity}</Text>
                  </View>
                </View>
              ))
            }
          </>
        ) : (
          <View style={styles.buyerCard}>
            <View style={styles.aiHeader}>
              <MaterialCommunityIcons name="shield-lock" size={24} color="#1B4332" />
              <Text style={styles.aiBadge}>ESCROW PROTECTION ACTIVE</Text>
            </View>
            <Text style={styles.aiMainText}>Your funds are safely locked in our blockchain vault. We only pay the farmer after you verify delivery.</Text>
            <TouchableOpacity style={styles.marketBtn} onPress={() => router.push('/marketplace')}>
              <Text style={styles.marketBtnText}>Browse Fresh Crops</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PERSISTENT ORDER HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        {orderHistory.length === 0 ? (
  <Text style={styles.emptyText}>No transaction history found.</Text>
) : (
  orderHistory.map((order: any) => {
    const isPending = order.status === 'PENDING';
    const isAccepted = order.status === 'ACCEPTED';

    return (
      <TouchableOpacity
        key={order._id}
        activeOpacity={0.8}
        // Wrapping everything ensures the whole yellow box is clickable
        onPress={() => router.push({ 
          pathname: '/(drawer)/order-status', 
          params: { orderId: order._id } 
        })}
        style={[
          styles.orderWrapper, 
          isPending && isFarmer && styles.pendingBorder
        ]}
      >
        <View style={styles.productCard}>
          <MaterialCommunityIcons
            name={order.status === 'COMPLETED' ? "check-decagram" : "clock-fast"}
            size={30}
            color={order.status === 'COMPLETED' ? "#2D6A4F" : "#F57F17"}
          />
          <View style={styles.prodInfo}>
            <Text style={styles.prodName}>{order.productId?.name || "Market Order"}</Text>
            <Text style={styles.prodDetails}>₹{order.totalAmount} • {order.status}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </View>

        {/* --- FARMER SPECIFIC MESSAGE (Now inside the clickable area) --- */}
        {isFarmer && isPending && (
          <View style={styles.actionPrompt}>
            <Ionicons name="alert-circle" size={16} color="#B45309" />
            <Text style={styles.actionText}>
              Action Required: Tap to Accept Order
            </Text>
          </View>
        )}

        {/* --- BUYER SPECIFIC MESSAGE (Now inside the clickable area) --- */}
        {!isFarmer && isAccepted && order.deliveryDate && (
          <View style={styles.deliveryPrompt}>
            <FontAwesome5 name="truck" size={12} color="#1B4332" />
            <Text style={styles.deliveryText}>
              Arriving by: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  })
)}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 20 },
  greeting: { fontSize: 13, color: '#666' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },
  roleBadge: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 4 },
  roleText: { fontSize: 9, fontWeight: 'bold', color: '#2D6A4F' },
  avatarBorder: { padding: 2, borderRadius: 30, borderWidth: 2, borderColor: '#2D6A4F' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: (width - 60) / 2, padding: 15, borderRadius: 20, justifyContent: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#1B4332', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#555' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  buyerCard: { backgroundColor: '#F0FDF4', borderRadius: 20, padding: 20, marginBottom: 25, borderLeftWidth: 5, borderLeftColor: '#1B4332' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiBadge: { fontSize: 9, fontWeight: 'bold', color: '#1B4332', marginLeft: 8 },
  aiMainText: { fontSize: 13, color: '#333', lineHeight: 18 },
  marketBtn: { backgroundColor: '#1B4332', padding: 12, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  marketBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  productCard: { backgroundColor: '#FFF', borderRadius: 15, flexDirection: 'row', padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  prodImg: { width: 50, height: 50, borderRadius: 10 },
  prodInfo: { flex: 1, marginLeft: 15 },
  orderWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  pendingBorder: {
    borderColor: '#F57F17',
    borderWidth: 1.5,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  actionText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  deliveryPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  deliveryText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  prodName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  prodDetails: { fontSize: 12, color: '#666', marginTop: 2 },
  hashText: { fontSize: 8, color: '#AAA', marginTop: 4, fontFamily: 'monospace' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', marginVertical: 20 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 13, marginTop: 10 },
});

export default FarmerDashboard;