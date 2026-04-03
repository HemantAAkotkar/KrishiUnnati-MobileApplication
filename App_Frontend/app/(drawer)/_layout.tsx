import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router'; // useNavigation ko yahan se import karein
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState,useEffect } from 'react';

// --- CUSTOM DRAWER CONTENT ---
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [userName, setUserName] = useState("Loading...");

  useEffect(() => {
    const getUserData = async () => {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Wipe EVERYTHING
              await AsyncStorage.clear();

              // 2. Redirect to login
              // Use replace to ensure the user can't go 'back' to the dashboard
              router.replace('/login');

              console.log("Session cleared and redirected");
            } catch (error) {
              console.error("Logout Error:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Profile Header */}
        <View style={styles.drawerHeader}>
          <Ionicons name="person-circle" size={60} color="#fff" />
          <Text style={styles.userName}>Farmer Portal</Text>
        </View>

        {/* This renders all your <Drawer.Screen> items */}
        <View style={{ flex: 1 }}>
          <DrawerItemList {...props} />
        </View>

        {/* FIXED LOGOUT BUTTON */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#d9534f" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1B4332' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#2D6A4F',
        drawerLabelStyle: { fontSize: 16, marginLeft: -10 },
      }}
    >
      <Drawer.Screen
        name="FarmerDashboard"
        options={{
          drawerLabel: 'Home',
          title: 'Krishi Unnati',
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="order-status"
        options={{
          drawerLabel: 'My Orders',
          title: 'Track Orders',
          drawerIcon: ({ color }) => <Ionicons name="cart-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="ai-models"
        options={{
          drawerLabel: 'AI Market Insights',
          title: 'Smart Farming',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="brain" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'App Settings',
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="farmer-orders"
        options={{
          drawerLabel: 'Sales Ledger', // Global name for all farmers
          title: 'Blockchain Sales',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={color} />,
        }}
      />
    </Drawer>

  );
}
const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#1B4332',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f4',
    backgroundColor: '#fff', // Ensures it's not transparent
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%', // Makes the whole bottom area clickable
  },
  logoutText: {
    fontSize: 16,
    color: '#d9534f',
    fontWeight: 'bold',
    marginLeft: 15,
  }
});