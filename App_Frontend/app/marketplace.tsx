import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = { primary: '#4CAF50', secondary: '#00796B', background: '#F9F9F9', textDark: '#212121', placeholder: '#9E9E9E', accent: '#FFC107' };

const Marketplace = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchProducts = async (search = '', category = 'All') => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/products`, {
                params: { search, category }
            });
            setProducts(response.data.products);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts(searchQuery, selectedCategory);
    }, [searchQuery, selectedCategory]);

    const renderProductCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/productDetail/${item._id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardLocation}>📍 {item.location?.district || 'Nearby'}</Text>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
                <Text style={styles.sellerName}>By: {item.sellerId?.fullName || 'Farmer'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Krishi Unnati</Text>
            </View>

            <View style={styles.searchBarContainer}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={COLORS.placeholder} />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Search crops..." 
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            fetchProducts(text, selectedCategory);
                        }}
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item._id}
                    numColumns={2} // Better for mobile visibility than 3
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No crops available right now.</Text>}
                />
            )}
            
            {/* Amazon-style Bottom Bar (Static for now) */}
            <View style={styles.amazonTabBar}>
                <TouchableOpacity style={styles.tabItem}><Ionicons name="home" size={24} color={COLORS.primary} /><Text style={styles.tabText}>Home</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(drawer)/FarmerDashboard')}><Ionicons name="person-outline" size={24} color={COLORS.secondary} /><Text style={styles.tabText}>You</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}><Ionicons name="cart-outline" size={24} color={COLORS.secondary} /><Text style={styles.tabText}>Cart</Text></TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ... Styles (Use your provided styles but update card width for 2 columns)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { backgroundColor: COLORS.primary, padding: 15 },
    title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    searchBarContainer: { padding: 10, backgroundColor: COLORS.primary },
    searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', padding: 10, borderRadius: 10, alignItems: 'center' },
    searchInput: { marginLeft: 10, flex: 1 },
    listContainer: { padding: 10 },
    card: { flex: 1, backgroundColor: '#FFF', margin: 5, borderRadius: 10, elevation: 3, overflow: 'hidden' },
    cardImage: { width: '100%', height: 120 },
    cardContent: { padding: 10 },
    cardTitle: { fontWeight: 'bold', fontSize: 14 },
    cardLocation: { fontSize: 10, color: '#666' },
    cardPrice: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    sellerName: { fontSize: 10, fontStyle: 'italic', marginTop: 5 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
    amazonTabBar: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10 },
    tabItem: { flex: 1, alignItems: 'center' },
    tabText: { fontSize: 10 }
});

export default Marketplace;