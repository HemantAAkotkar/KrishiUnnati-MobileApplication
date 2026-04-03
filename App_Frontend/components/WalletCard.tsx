// Create a reusable component: components/WalletCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export const WalletCard = () => {
  const [balance, setBalance] = useState(0);

  const loadBalance = async () => {
    const userJson = await AsyncStorage.getItem("user"); //
    if (userJson) {
      const user = JSON.parse(userJson);
      setBalance(user.walletBalance || 0);
    }
  };

  useEffect(() => { loadBalance(); }, []);

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>Your Digital Wallet</Text>
        <Text style={styles.balance}>₹{balance.toLocaleString()}</Text>
      </View>
      <Ionicons name="wallet-outline" size={30} color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#1B4332', padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 15 },
  label: { color: '#B7E4C7', fontSize: 12, fontWeight: 'bold' },
  balance: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 5 }
});