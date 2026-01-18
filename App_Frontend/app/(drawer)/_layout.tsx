import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router'; // useNavigation ko yahan se import karein

// --- CUSTOM DRAWER CONTENT ---
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const navigation = useNavigation(); // ✅ Component ke ANDAR call karein

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Storage saaf karein
            await AsyncStorage.clear();

            // 2. Navigation Reset karein
            // Expo Router mein simple 'replace' kaafi hota hai agar AsyncStorage clear ho jaye
            router.replace('/login');

            console.log("Logged out successfully");
          } catch (error) {
            console.error("Logout Error:", error);
          }
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Ionicons name="person-circle" size={60} color="#fff" />
          <Text style={styles.userName}>Farmer Portal</Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#d9534f" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
    </Drawer>
  );
}
const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#1B4332',
    height: 140,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f4',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#d9534f',
    fontWeight: 'bold',
    marginLeft: 15,
  }
});