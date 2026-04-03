import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Static Data: Indian Person Names, Numbers, and Locations
const MOCK_BUYERS = [
  { id: '1', name: 'Rajesh Deshmukh', phone: '+91 98230 12345', location: 'Nagpur, MH' },
  { id: '2', name: 'Suresh Patil', phone: '+91 94221 55678', location: 'Amravati, MH' },
  { id: '3', name: 'Amit Sharma', phone: '+91 70588 99012', location: 'Indore, MP' },
  { id: '4', name: 'Vijay Kulkarni', phone: '+91 88055 44321', location: 'Pune, MH' },
  { id: '5', name: 'Anil Rathod', phone: '+91 99700 11223', location: 'Akola, MH' },
  { id: '6', name: 'Pankaj Tiwari', phone: '+91 91582 33445', location: 'Bhopal, MP' },
  { id: '7', name: 'Gajanan Pawar', phone: '+91 77200 88990', location: 'Yavatmal, MH' },
  { id: '8', name: 'Sunil Jadhav', phone: '+91 95522 11004', location: 'Wardha, MH' },
  { id: '9', name: 'Ramesh Gupta', phone: '+91 90110 55443', location: 'Jabalpur, MP' },
  { id: '10', name: 'Dinesh Kale', phone: '+91 86001 22334', location: 'Morshi, MH' },
];

export default function Profile() {
  // Logic to pick 5 random buyers for the "refresh" effect
  const getRandomBuyers = () => [...MOCK_BUYERS].sort(() => 0.5 - Math.random()).slice(0, 5);

  const [buyers, setBuyers] = useState(getRandomBuyers());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network delay of 1 second
    setTimeout(() => {
      setBuyers(getRandomBuyers());
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderBuyer = ({ item }) => (
    <View style={styles.buyerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.location}>
          <Ionicons name="location" size={12} color="#2D6A4F" /> {item.location}
        </Text>
      </View>
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#2D6A4F" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buyer Directory</Text>
        <Text style={styles.headerSub}>Active Traders in your Region</Text>
      </View>

      <FlatList
        data={buyers}
        keyExtractor={(item) => item.id}
        renderItem={renderBuyer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B4332']} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { padding: 25, backgroundColor: '#1B4332', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#D8F3DC', marginTop: 4 },
  listContent: { padding: 15 },
  buyerCard: {flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D8F3DC', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1B4332', fontWeight: 'bold', fontSize: 20 },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  phone: { fontSize: 13, color: '#666', marginTop: 2 },
  location: { fontSize: 12, color: '#2D6A4F', marginTop: 4, fontWeight: '600' },
  verifiedBadge: { padding: 5 }
});