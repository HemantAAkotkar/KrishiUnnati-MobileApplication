// // src/screens/ProfileScreen.jsx
// import { useRouter } from 'expo-router';
// import React from 'react';
// import {
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import { SafeAreaView } from "react-native-safe-area-context";

// // Import all the refactored pieces
// import { COLORS } from '../constants/colors';
// import { MOCK_USER } from '../constants/mockData';

// import AppHeader from '../components/Common/AppHeader';
// import FooterNav from '../components/Common/FooterNav';
// import ActionItem from '../components/Profile/ActionItem';
// import UserGreetingCard from '../components/Profile/UserGreetingCard';

// const ProfileScreen = () => {
//     const router = useRouter();

//     const handleLogout = () => {
//         Alert.alert('Logout', 'Are you sure you want to log out?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Logout',
//                 style: 'destructive',
//                 onPress: () => {
//                     // In a real app, clear AsyncStorage, Redux state, etc.
//                     console.log("User logged out (mock)");
//                     router.replace('/login'); // Navigate to login, clearing stack
//                 },
//             },
//         ]);
//     };

//     const viewBlockchainWallet = () => {
//         Alert.alert("Blockchain Wallet", "Navigating to Wallet details.\nBalance: " + MOCK_USER.balance);
//         // router.push('/wallet'); // Actual navigation in a real app
//     };

//     const goToSellerDashboard = () => {
//         Alert.alert("Seller Dashboard", "Navigating to manage your listings and sales.");
//         // router.push('/seller-dashboard'); // Actual navigation in a real app
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <AppHeader title="Your Account" showBackButton={true} showCartButton={true} />

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <UserGreetingCard />

//                 {/* SECTION 1: Orders & Transactions */}
//                 <Text style={styles.sectionHeader}>Transactions & Orders</Text>
//                 <View style={styles.sectionContainer}>
//                     <ActionItem
//                         iconName="package"
//                         title="Your Orders"
//                         subtitle="Track, return, or buy things again"
//                         onPress={() => router.push('/orders')}
//                     />
//                     <ActionItem
//                         iconName="credit-card"
//                         title="Payment & Wallet"
//                         subtitle="Manage saved cards and bank accounts"
//                         onPress={() => router.push('/payments')}
//                     />
//                     <ActionItem
//                         iconName="cpu"
//                         title="Blockchain Wallet Balance"
//                         subtitle={`Current Balance: ${MOCK_USER.balance}`}
//                         onPress={viewBlockchainWallet}
//                         isLastItem={true} // Mark as last item to remove bottom border
//                     />
//                 </View>

//                 {/* SECTION 2: Krishi-Unnati Specific */}
//                 <Text style={styles.sectionHeader}>Krishi Services</Text>
//                 <View style={styles.sectionContainer}>
//                     <ActionItem
//                         iconName="shopping-bag"
//                         title="Your Store (Seller Dashboard)"
//                         subtitle="Manage your agri-listings and sales"
//                         onPress={goToSellerDashboard}
//                     />
//                     <ActionItem
//                         iconName="map-pin"
//                         title="Your Addresses"
//                         subtitle="Edit addresses for deliveries"
//                         onPress={() => router.push('/addresses')}
//                     />
//                     <ActionItem
//                         iconName="help-circle"
//                         title="Customer Support"
//                         subtitle="Need help with an order or listing?"
//                         onPress={() => router.push('/support')}
//                         isLastItem={true}
//                     />
//                 </View>

//                 {/* SECTION 3: Settings and Exit */}
//                 <Text style={styles.sectionHeader}>Settings & Legal</Text>
//                 <View style={styles.sectionContainer}>
//                     <ActionItem
//                         iconName="lock"
//                         title="Security & Privacy"
//                         subtitle="Change password, manage linked devices"
//                         onPress={() => router.push('/settings/security')}
//                     />
//                     <ActionItem
//                         iconName="log-out"
//                         title="Log Out"
//                         subtitle="Securely sign out of Krishi-Unnati"
//                         onPress={handleLogout}
//                         isDanger={true}
//                         isLastItem={true}
//                     />
//                 </View>

//                 <View style={{ height: 50 }} />
//             </ScrollView>

//             <FooterNav activeScreen="account" />
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     scrollContent: {
//         paddingBottom: 20,
//     },
//     sectionHeader: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.secondary,
//         marginTop: 20,
//         marginBottom: 5,
//         paddingHorizontal: 15,
//     },
//     sectionContainer: {
//         backgroundColor: COLORS.card,
//         marginHorizontal: 10,
//         borderRadius: 10,
//         elevation: 1,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//         overflow: 'hidden', // Ensures borderRadius clips children
//     },
// });

// export default ProfileScreen;


import React from "react";

export default function Profile(){
    return(
        <h1>Welcome</h1>
    );
}