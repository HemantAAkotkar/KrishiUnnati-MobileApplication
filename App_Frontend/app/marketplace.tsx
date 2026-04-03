import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
const COLORS = { primary: '#4CAF50', secondary: '#00796B', background: '#F9F9F9', textDark: '#212121', placeholder: '#9E9E9E', accent: '#FFC107' };
// ... keep your imports ...
const Marketplace = () => {
    const router = useRouter();
    const { filterCategory } = useLocalSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Set initial active category based on params from Category Screen
    const [activeCat, setActiveCat] = useState(filterCategory || 'All');
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
    // Filter Logic: Handles both Search and Category Selection
    useEffect(() => {
        let result = products;
        if (activeCat !== 'All') {
            result = result.filter(p => p.category === activeCat);
        }
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredProducts(result);
    }, [activeCat, searchQuery, products]);
    useEffect(() => { fetchProducts(); }, []);
    // Handle Category Click
    const handleCategoryPress = (cat) => {
        setActiveCat(cat);
    };
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts(); // Refresh base data
    }, []);
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
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
            {/* --- ADDED HORIZONTAL CATEGORY ROW HERE --- */}
            <View style={{ height: 60 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={['All', 'Grains', 'Fruits', 'Seeds', 'Tools', 'Fertilizers']}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.horizontalCatRow}
                    renderItem={({ item: cat }) => (
                        <TouchableOpacity
                            onPress={() => handleCategoryPress(cat)}
                            style={[
                                styles.catChip,
                                activeCat === cat && styles.activeCatChip
                            ]}
                        >
                            <Text style={activeCat === cat ? styles.activeText : styles.catText}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredProducts} // Use filtered data here
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No crops matching your criteria.</Text>}
                />
            )}
            {/* Bottom Bar */}
            <View style={styles.amazonTabBar}>
                {/* Home */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('/marketplace')}
                >
                    <Ionicons name="home" size={24} color={COLORS.primary} />
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>
                {/* Profile (You) */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('/(drawer)/FarmerDashboard')}
                >
                    <Ionicons name="person-outline" size={24} color={COLORS.secondary} />
                    <Text style={styles.tabText}>Profile</Text>
                </TouchableOpacity>
                {/* Cart */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('/CartScreen')}
                >
                    <Ionicons name="cart-outline" size={24} color={COLORS.secondary} />
                    <Text style={styles.tabText}>Cart</Text>
                </TouchableOpacity>
                {/* More (Menu) */}
                {/* <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('/more')} // Agar aap Drawer open karwana chahte hain
                >
                    <Ionicons name="menu-outline" size={26} color={COLORS.secondary} />
                    <Text style={styles.tabText}>More</Text>
                </TouchableOpacity> */}
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
    tabText: { fontSize: 10 },
    horizontalCatRow: {
        paddingHorizontal: 15,
        alignItems: 'center',
        height: 50,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activeCatChip: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    catText: {
        color: '#555',
        fontWeight: '500',
    },
    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
export default Marketplace;