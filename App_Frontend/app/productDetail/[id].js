// App_Frontend/app/productDetail/[id].js
import React, { useState, useEffect } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, FlatList } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '../../constants/config';
import { COLORS } from '../../constants/colors';
import { BASE_URL, BlockChainURL, API_HEADERS } from '../../constants/config';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // 1. Fetch main product
        const response = await axios.get(`${BASE_URL}/api/products/${id}`);
        if (response.data.success) {
          const mainProduct = response.data.product;
          setProduct(mainProduct);

          // 2. Fetch similar products (AI Recommendation Simulation)
          const similarRes = await axios.get(`${BASE_URL}/api/products`);
          if (similarRes.data.success) {
            const filtered = similarRes.data.products.filter(
              (p) => p.category === mainProduct.category && p._id !== mainProduct._id
            );
            setSimilarProducts(filtered);
          }
        }
      } catch (error) {
        console.error("Detail Fetch Error:", error);
        Alert.alert("Error", "Could not load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const isDuplicate = cart.find(item => item._id === product._id);

      if (!isDuplicate) {
        cart.push({ ...product, addedAt: Date.now(), expiryTime: Date.now() + 30 * 60 * 1000 });
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
        Alert.alert("Success", `${product.name} added to your Cart!`);
      } else {
        Alert.alert("Note", "Item is already in your cart.");
      }
    } catch (error) { console.error(error); }
  };

  const handleInstantBuy = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      const userData = JSON.parse(userJson);
      
      // Calculate total once to be safe
      const totalPrice = product.price * quantity;

      // 1. Create Order in MERN Backend (C: Drive)
      // Note: We don't send orderId here; the backend CREATES it.
      const res = await axios.post(`${BASE_URL}/api/orders/create`, {
        productId: product._id, // You should probably keep this for your DB records
        farmerId: product.sellerId?._id || product.sellerId,
        buyerId: userData._id,
        price: product.price,
        quantity: quantity,
        totalAmount: totalPrice 
      });

      if (res.data.success) {
        // GET the newly created ID from the MERN response
        const newOrderId = res.data.order._id; 
        const farmerId = product.sellerId?._id || product.sellerId;

        // 2. TRIGGER BLOCKCHAIN ESCROW LOCK (E: Drive)
        try {
          const escrowRes = await axios.post(`${BlockChainURL}/api/v1/pay-system-kup/escrow/lock`, {
            buyerId: userData._id,
            farmerId: farmerId,
            amount: totalPrice, // Sending the full locked amount
            orderId: newOrderId  // Now we have the real ID from Step 1
          }, { headers: API_HEADERS });

          if (escrowRes.data.success) {
            Alert.alert("Success", `Order Placed! ₹${totalPrice} is now secured in KUP Escrow.`);
            
            // Sync local state if necessary, then navigate
            router.replace({
              pathname: "/(drawer)/order-status",
              params: { orderId: newOrderId }
            });
          }
        } catch (escrowErr) {
          console.error("Escrow Failed:", escrowErr.response?.data || escrowErr.message);
          Alert.alert("Payment Error", "MERN order created, but Blockchain Escrow failed.");
        }
      }
    } catch (error) {
       console.error("Order Creation Failed:", error.response?.data || error.message);
       Alert.alert("Transaction Failed", error.response?.data?.message || "Check Balance");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.image }} style={styles.image} />

        <View style={styles.detailsCard}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.categoryBadge}>{product.category}</Text>
          <Text style={styles.price}>₹{product.price} <Text style={styles.unit}>/ quintal</Text></Text>

          {/* QUANTITY SELECTOR */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Select Quantity (Quintals):</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qBtn}>
                <Feather name="minus" size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qBtn}>
                <Feather name="plus" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.totalPreview}>Total Payable: ₹{(product.price * quantity).toLocaleString()}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleInstantBuy}>
            <Text style={styles.buyNowButtonText}>SECURE ORDER NOW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionHeader}>Product Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: "100%", height: 280, borderRadius: 20, marginBottom: 16 },
  detailsCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 2, marginBottom: 15 },
  name: { fontSize: 24, fontWeight: "bold", color: '#1B4332' },
  categoryBadge: { color: '#2D6A4F', fontWeight: '600', fontSize: 12, backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  location: { fontSize: 14, color: '#666', marginTop: 8 },
  price: { fontSize: 24, fontWeight: "800", color: '#1B4332', marginVertical: 10 },
  unit: { fontSize: 14, fontWeight: '400', color: '#666' },
  seller: { fontSize: 14, color: '#333', marginTop: 5 },
  buttonContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  addToCartButton: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1B4332', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addToCartButtonText: { marginLeft: 10, fontWeight: 'bold', color: '#1B4332' },
  buyNowButton: { flex: 1, backgroundColor: '#1B4332', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buyNowButtonText: { fontWeight: 'bold', fontSize: 16, color: '#FFF' },
  descriptionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 1 },
  descriptionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  descriptionText: { lineHeight: 22, color: '#555', fontSize: 14 },

  // Similar Products Styles
  similarSection: { marginTop: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  horizontalList: { marginLeft: -5 },
  similarCard: { backgroundColor: '#FFF', width: 140, marginRight: 15, borderRadius: 15, padding: 10, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  similarImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 8 },
  similarName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  similarPrice: { fontSize: 13, color: '#2D6A4F', fontWeight: '700', marginTop: 2 }
});