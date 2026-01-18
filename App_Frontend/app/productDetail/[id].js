import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import axios from 'axios';

// IMPORTANT: Imports for your global config and colors
import { BASE_URL } from '../../constants/config'; 
import { COLORS } from '../../constants/colors'; 

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA FROM MONGODB
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Using your backend route created in previous step
        const response = await axios.get(`${BASE_URL}/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
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

  // 3. ACTION HANDLERS
  const handleAddToCart = () => {
    Alert.alert("Basket", `${product.name} added to your interest list.`);
  };

  const handleBuyNow = () => {
    // This will lead to the Smart Contract Phase
    router.push({
        pathname: '/checkout',
        params: { productId: id, price: product.price }
    });
  };

  // 4. LOADING STATE UI
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: COLORS.secondary}}>Fetching Harvest Details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.danger, fontSize: 16 }}>❌ Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* IMAGE FROM CLOUDINARY */}
        <Image 
          source={{ uri: product.image }} 
          style={styles.image} 
        />

        <View style={styles.detailsCard}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>Category: {product.category}</Text>
          <Text style={styles.location}>📍 {product.location?.district}, {product.location?.state}</Text>
          <Text style={styles.price}>₹{product.price} / quintal</Text>
          <Text style={styles.seller}>👨‍🌾 Listed by: {product.sellerId?.fullName || 'Verified Farmer'}</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Feather name="shopping-cart" size={20} color={COLORS.textDark} />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* DYNAMIC DESCRIPTION */}
        <View style={styles.descriptionCard}>
            <Text style={styles.descriptionHeader}>About this Crop</Text>
            <Text style={styles.descriptionText}>
                {product.description || "No additional description provided by the farmer."}
            </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#F9F9F9' },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: "100%", height: 300, borderRadius: 15, marginBottom: 16 },
  detailsCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 4, marginBottom: 15 },
  name: { fontSize: 26, fontWeight: "bold", color: '#212121' },
  category: { fontSize: 16, color: '#00796B', marginVertical: 5 },
  location: { fontSize: 14, color: '#757575' },
  price: { fontSize: 22, fontWeight: "800", color: '#4CAF50', marginVertical: 10 },
  seller: { fontSize: 14, color: '#333', fontWeight: '500', marginTop: 5 },
  buttonContainer: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  addToCartButton: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#4CAF50', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addToCartButtonText: { marginLeft: 10, fontWeight: 'bold' },
  buyNowButton: { flex: 1, backgroundColor: '#FFC107', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buyNowButtonText: { fontWeight: '800', fontSize: 16 },
  descriptionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 2 },
  descriptionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { lineHeight: 22, color: '#444' }
});