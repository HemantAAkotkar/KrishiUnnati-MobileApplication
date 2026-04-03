import React, { useState, useEffect } from 'react';
import { FlatList, ScrollView, ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { styles } from '../styles/categoryStyles';

import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import MainCategoryTab from '../components/MainCategoryTab';
import SubCategoryCard from '../components/SubCategoryCard';

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`);
      if (res.data.success) {
        // 1. Get unique category names from products
        const uniqueCatNames = [...new Set(res.data.products.map(p => p.category))];
        
        // 2. Format them for the sidebar
        const formattedCats = uniqueCatNames.map((name, index) => ({
          id: index.toString(),
          name: name,
          icon: getIconForCategory(name) // Helper function
        }));

        setCategories(formattedCats);
        setSelectedCategory(formattedCats[0]);
      }
    } catch (error) {
      console.error("Fetch Categories Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to assign icons dynamically
  const getIconForCategory = (name) => {
    const map = {
      'Grains': 'target',
      'Seeds': 'zap',
      'Fruits': 'sun',
      'Tools': 'tool',
      'Fertilizers': 'droplet'
    };
    return map[name] || 'box';
  };

  if (loading) return <ActivityIndicator size="large" color="#1B4332" style={{flex:1}} />;

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.contentArea}>
        {/* Sidebar */}
        <View style={styles.mainCategoriesSidebar}>
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <MainCategoryTab 
                item={item} 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Dynamic Content */}
        <ScrollView style={styles.subCategoriesContent}>
          <Text style={styles.subContentTitle}>{selectedCategory?.name}</Text>
          <View style={styles.subCategoryGrid}>
             {/* Note: In a dynamic setup, SubCategories are just specific product types */}
             <SubCategoryCard 
                item={{ name: `All ${selectedCategory?.name}`, category: selectedCategory?.name }} 
             />
          </View>
        </ScrollView>
      </View>
      <FooterNav />
    </SafeAreaView>
  );
};

export default CategoryScreen;