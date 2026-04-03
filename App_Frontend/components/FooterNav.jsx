import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../styles/categoryStyles';

const FooterNav = () => {
  const router = useRouter();
  return (
    <View style={styles.footerNav}>
      <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/')}>
        <Ionicons name="home-outline" size={24} color={COLORS.secondary} />
        <Text style={styles.footerNavText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/marketplace')}>
        <Feather name="grid" size={24} color={COLORS.primary} />
        <Text style={[styles.footerNavText, { color: COLORS.primary, fontWeight: 'bold' }]}>Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/(drawer)/FarmerDashboard')}>
        <Feather name="user" size={24} color={COLORS.secondary} />
        <Text style={styles.footerNavText}>Profile</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/marketplace')}>
        <Feather name="shopping-cart" size={24} color={COLORS.secondary} />
        <Text style={styles.footerNavText}>Cart</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        style={styles.footerNavItem}
        onPress={() => router.push('/category')} // Changed from /marketplace
      >
        <Feather name="grid" size={24} color={COLORS.primary} />
        <Text style={[styles.footerNavText, { color: COLORS.primary, fontWeight: 'bold' }]}>
          Categories
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default FooterNav;
