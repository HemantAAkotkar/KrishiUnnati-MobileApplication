import React, { useMemo, useState, useCallback } from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports from your project structure
import CartItem from '../components/Cart/CartItem'; // Adjust path if needed
import AppHeader from '../components/Common/AppHeader';
import FooterNav from '../components/Common/FooterNav';
import { COLORS } from '../constants/colors';

const CartScreen = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. LOAD CART DATA (Triggers every time Amit enters the screen)
  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        try {
          const storedCart = await AsyncStorage.getItem('cart');
          if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            // Ensure every item has an expiryTime for the demo timer
            const now = Date.now();
            const updatedItems = parsedCart.map(item => ({
              ...item,
              expiryTime: item.expiryTime || now + 30 * 60 * 1000 
            }));
            setCartItems(updatedItems);
          }
        } catch (error) {
          console.error("Cart Load Error:", error);
        } finally {
          setLoading(false);
        }
      };
      loadCart();
    }, [])
  );

  // 2. THE "SECURITY GUARD" TIMER LOGIC
  // Checks every 5 seconds if any item's reservation has expired
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      
      setCartItems(prevItems => {
        const remainingItems = prevItems.filter(item => item.expiryTime > currentTime);
        
        if (remainingItems.length !== prevItems.length) {
          // Sync with storage if an item expired
          AsyncStorage.setItem('cart', JSON.stringify(remainingItems));
          Alert.alert(
            "Reservation Expired", 
            "An item was removed from your cart to release inventory for other buyers."
          );
        }
        return remainingItems;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 3. CALCULATION & HANDLERS
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [cartItems]);

  const removeItem = async (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Navigate to the first item for the demo flow
      router.push({
        pathname: `/productDetail/${cartItems[0]._id}`,
        params: { fromCart: 'true' }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // EMPTY STATE UI
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="My Cart" />
        <View style={styles.emptyCartContainer}>
          <Feather name="shopping-bag" size={80} color="#ccc" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Looks like you haven't added any harvest to your interest list yet.
          </Text>
          <TouchableOpacity 
            style={styles.shopNowButton} 
            onPress={() => router.push('/marketplace')}
          >
            <Text style={styles.shopNowButtonText}>Explore Marketplace</Text>
          </TouchableOpacity>
        </View>
        <FooterNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="My Cart" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {cartItems.map((item) => (
            <CartItem 
              key={item._id} 
              item={item} 
              onRemove={() => removeItem(item._id)} 
            />
          ))}
        </View>

        {/* PRICE SUMMARY */}
        <View style={styles.subtotalCallout}>
          <Text style={styles.subtotalText}>Cart Subtotal ({cartItems.length} items):</Text>
          <Text style={styles.subtotalValue}>₹{totalAmount.toLocaleString()}</Text>
        </View>

        {/* CHECKOUT ACTION */}
        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.textDark} />
          <Text style={styles.checkoutButtonText}>PROCEED TO BLOCKCHAIN CHECKOUT</Text>
        </TouchableOpacity>

        <Text style={styles.timerNote}>
          * Items are reserved for 30 minutes to ensure fair market access.
        </Text>
      </ScrollView>

      <FooterNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 }, 
  list: { marginVertical: 10, paddingHorizontal: 15 },
  
  subtotalCallout: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  subtotalText: { fontSize: 14, color: '#666' },
  subtotalValue: { fontSize: 22, fontWeight: 'bold', color: '#1B4332' },
  
  checkoutButton: { 
    backgroundColor: '#FFC107', 
    flexDirection: 'row',
    padding: 18, 
    marginHorizontal: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 3,
    marginTop: 10
  },
  checkoutButtonText: { fontSize: 14, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  timerNote: { textAlign: 'center', fontSize: 10, color: '#999', marginTop: 15, paddingHorizontal: 40 },

  emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyCartTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
  emptyCartSubtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 10, marginBottom: 30 },
  shopNowButton: { backgroundColor: '#1B4332', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  shopNowButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' }
});

export default CartScreen;