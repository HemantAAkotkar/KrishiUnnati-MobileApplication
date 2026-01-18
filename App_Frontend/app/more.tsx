import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

/* ---------- COLORS (same theme as marketplace) ---------- */
const COLORS = {
  primary: '#4CAF50',
  secondary: '#00796B',
  background: '#F5F5F5',
  card: '#FFFFFF',
  textDark: '#212121',
  textLight: '#FFFFFF',
  divider: '#E0E0E0',
  danger: '#F44336',
};

const More = () => {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---------- PROFILE HEADER ---------- */}
        <View style={styles.profileHeader}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>Hello, Farmer 👋</Text>
            <Text style={styles.profileSub}>Welcome to Krishi Unnati</Text>
          </View>
        </View>

        {/* ---------- QUICK ACTIONS (Amazon style) ---------- */}
        <View style={styles.quickRow}>
          <MenuTile
            icon="shopping-bag"
            label="My Orders"
            onPress={() => router.push('/orders')}
          />
          <MenuTile
            icon="repeat"
            label="Buy Again"
            onPress={() => {}}
          />
          <MenuTile
            icon="user"
            label="Account"
            onPress={() => router.push('/dashboard')}
          />
        </View>

        {/* ---------- SECTION: CATEGORIES ---------- */}
        <Section title="Shop by Category">
          <MenuItem icon="leaf" label="Crops" />
          <MenuItem icon="tool" label="Farming Tools" />
          <MenuItem icon="droplet" label="Fertilizers" />
          <MenuItem icon="truck" label="Logistics" />
        </Section>

        {/* ---------- SECTION: SETTINGS ---------- */}
        <Section title="Settings">
          <MenuItem icon="map-pin" label="Your Address" />
          <MenuItem icon="bell" label="Notifications" />
          <MenuItem icon="lock" label="Privacy & Security" />
          <MenuItem icon="credit-card" label="Payments" />
        </Section>

        {/* ---------- SECTION: HELP ---------- */}
        <Section title="Help & Support">
          <MenuItem icon="help-circle" label="Customer Support" />
          <MenuItem icon="info" label="About Krishi Unnati" />
        </Section>

        {/* ---------- LOGOUT ---------- */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Feather name={icon} size={20} color={COLORS.secondary} />
    <Text style={styles.menuLabel}>{label}</Text>
    <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
  </TouchableOpacity>
);

const MenuTile = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <Feather name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.tileText}>{label}</Text>
  </TouchableOpacity>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  profileImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    resizeMode: 'contain',
  },
  profileName: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  profileSub: {
    color: COLORS.textLight,
    fontSize: 12,
    opacity: 0.9,
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 15,
  },
  tile: {
    alignItems: 'center',
  },
  tileText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  section: {
    marginTop: 12,
    backgroundColor: COLORS.card,
  },
  sectionTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textDark,
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

export default More;
