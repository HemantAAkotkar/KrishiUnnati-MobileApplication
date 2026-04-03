// App_Frontend/app/(drawer)/WalletScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { BASE_URL, BlockChainURL, API_HEADERS } from '../../constants/config';

const WalletScreen = () => {
  const [balance, setBalance] = useState("0.00");
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchWalletData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
        
        // Fetch real-time balance from Wallets DB (E: Drive Service)
        const res = await axios.get(`${BlockChainURL}/api/v1/pay-system-kup/wallet/balance/${userData._id}`, {
             headers: API_HEADERS 
        });
        
        if (res.data.success) {
          setBalance(res.data.balance.toString());
        }
      }
    } catch (err) {
      console.log("Balance Fetch Error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      return Alert.alert("Invalid Amount", "Please enter a valid amount to deposit.");
    }

    setLoading(true);
    try {
      // 1. Hit Wallet Service (E: Drive)
      const res = await axios.post(`${BlockChainURL}/api/v1/pay-system-kup/wallet/deposit`, {
        userId: user._id,
        amount: Number(depositAmount)
      }, { headers: API_HEADERS });

      if (res.data.success) {
        // 2. Update MERN User DB (C: Drive) to keep balance field synced
        await axios.put(`${BASE_URL}/api/users/update-balance`, {
            userId: user._id,
            amount: Number(depositAmount),
            type: 'add'
        }, { headers: API_HEADERS });

        Alert.alert("Success", `₹${depositAmount} deposited successfully!`);
        setDepositAmount("");
        fetchWalletData(); // Refresh UI
      }
    } catch (error) {
      Alert.alert("Deposit Failed", "Could not connect to Wallet Service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Ionicons name="wallet-outline" size={24} color="#FFF" />
          <Text style={styles.walletTitle}>Krishi-Chain Wallet</Text>
        </View>
        <Text style={styles.balance}>₹{balance}</Text>
        <Text style={styles.address}>ID: {user?.walletId || "Not Linked"}</Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.label}>Deposit Funds</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount (₹)"
          keyboardType="numeric"
          value={depositAmount}
          onChangeText={setDepositAmount}
        />
        <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Add Money to Wallet</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  walletCard: { backgroundColor: '#1B4332', padding: 25, borderRadius: 20, margin: 15, elevation: 8 },
  walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  walletTitle: { color: '#FFF', marginLeft: 10, fontSize: 16, opacity: 0.9 },
  balance: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  address: { color: '#B7E4C7', fontSize: 12, marginTop: 10, fontFamily: 'monospace' },
  actionCard: { backgroundColor: '#FFF', margin: 15, padding: 20, borderRadius: 20, elevation: 4 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#1B4332', marginBottom: 15 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, fontSize: 18, marginBottom: 20 },
  depositBtn: { backgroundColor: '#2D6A4F', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default WalletScreen;