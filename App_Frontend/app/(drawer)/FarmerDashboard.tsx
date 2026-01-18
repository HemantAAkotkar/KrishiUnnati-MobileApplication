import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../constants/config'; // Ensure this path is correct

const { width } = Dimensions.get('window');

const FarmerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ active: 0, earnings: 0 });
  
  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 1. API Call
      const res = await axios.get(`${BASE_URL}/api/products`);
      
      if (res.data.success) {
        // 2. Filter & Map: Filter by current user ID
        const myCrops = res.data.products
          .filter((p: any) => 
            // Checking both object structure and string ID for safety
            (p.sellerId?._id === parsedUser._id || p.sellerId === parsedUser._id)
          )
          .map((p: any) => ({
            ...p,
            status: p.status || "Pending" 
          }));

        setListings(myCrops);

        // 3. Stats Calculation: Done inside the logic block
        const activeCount = myCrops.length;
        
        const totalEarnings = myCrops
          .filter((p: any) => p.status === 'Delivered')
          .reduce((sum: number, p: any) => sum + (Number(p.price) * Number(p.quantity)), 0);

        setStats({ active: activeCount, earnings: totalEarnings });
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

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

        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste,</Text>
            <Text style={styles.nameText}>{user?.fullName?.split(' ')[0] || 'Farmer'}!</Text>
            <Text style={styles.subGreeting}>Your Fields, Your Fortune</Text>
          </View>
          <TouchableOpacity style={styles.avatarBorder}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.fullName}&background=1B4332&color=fff` }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* QUICK STATS CARDS */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="list" size={20} color="#1B4332" />
            <Text style={styles.statNum}>{stats.active.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F1F8E9' }]}>
            <FontAwesome5 name="wallet" size={18} color="#2D6A4F" />
            <Text style={styles.statNum}>₹{stats.earnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        {/* SMART PRICE ASSISTANT (AI) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Price Assistant</Text>
          <MaterialCommunityIcons name="auto-fix" size={20} color="#2D6A4F" />
        </View>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={24} color="#1B4332" />
            <Text style={styles.aiBadge}>AI RECOMMENDATION</Text>
          </View>
          <Text style={styles.aiMainText}>
            Market analysis shows <Text style={{ fontWeight: 'bold', color: '#1B4332' }}>Wheat</Text> prices in {user?.location?.district || 'your area'} are trending UP.
          </Text>
          <Text style={styles.aiSubText}>Suggestion: Wait 3 days to list for 5% more profit.</Text>
        </View>

        {/* RECENT LISTINGS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Active Crops</Text>
          <TouchableOpacity onPress={() => router.push('/marketplace')}>
            <Text style={styles.viewAll}>Explore Market</Text>
          </TouchableOpacity>
        </View>

        {/* DYNAMIC LISTINGS */}
        {listings.length === 0 ? (
          <Text style={styles.emptyText}>No crops listed yet. Start by adding one!</Text>
        ) : (
          listings.map((item: any) => (
            <View key={item._id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.prodImg} />
              <View style={styles.prodInfo}>
                <Text style={styles.prodName}>{item.name}</Text>
                <Text style={styles.prodDetails}>Qty: {item.quantity} • ₹{item.price}/q</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? '#C8E6C9' : '#FFF9C4' }]}>
                  <Text style={styles.statusText}>
                    {item.status === 'Delivered' ? 'Order Delivered' : 'Order is Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/AddProduct')}
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.btnText}>List New Crop</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
  greeting: { fontSize: 16, color: '#666' },
  nameText: { fontSize: 28, fontWeight: 'bold', color: '#1B4332' },
  subGreeting: { fontSize: 14, color: '#888', marginTop: 2 },
  avatarBorder: { padding: 3, borderRadius: 30, borderWidth: 2, borderColor: '#2D6A4F' },
  avatar: { width: 50, height: 50, borderRadius: 25 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: (width - 60) / 2, padding: 20, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#1B4332', marginTop: 10 },
  statLabel: { fontSize: 12, color: '#555', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { color: '#2D6A4F', fontWeight: 'bold' },

  aiCard: { backgroundColor: '#F0FDF4', borderRadius: 20, padding: 20, borderLeftWidth: 5, borderLeftColor: '#1B4332', marginBottom: 30 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiBadge: { fontSize: 10, fontWeight: 'bold', color: '#1B4332', marginLeft: 8, letterSpacing: 1 },
  aiMainText: { fontSize: 15, color: '#333', lineHeight: 22 },
  aiSubText: { fontSize: 13, color: '#2D6A4F', marginTop: 5, fontStyle: 'italic' },

  productCard: { backgroundColor: '#FFF', borderRadius: 15, flexDirection: 'row', padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  prodImg: { width: 80, height: 80, borderRadius: 12 },
  prodInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  prodName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  prodDetails: { fontSize: 13, color: '#666', marginTop: 4 },
  statusBadge: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  statusText: { fontSize: 10, color: '#2D6A4F', fontWeight: 'bold' },

  primaryBtn: { backgroundColor: '#1B4332', flexDirection: 'row', padding: 18, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginVertical: 20, fontStyle: 'italic' },
  // ... updated status colors in render logic above ...
});

export default FarmerDashboard;