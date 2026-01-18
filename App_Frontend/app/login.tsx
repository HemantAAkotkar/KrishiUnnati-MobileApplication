import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import marketplace from "./marketplace";
import FarmerDashboard from "./(drawer)/FarmerDashboard"

// Standard Image Assets
const backgroundImage = require("../assets/images/Background.jpg");
const logoImage = require("../assets/images/Logo.png");

import { loginUser, registerUser } from "../api/authService";

const AuthScreen = () => {
  const router = useRouter();

  // Navigation & Toggle States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer'); // Default role
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [landSize, setLandSize] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');

  // 1. INPUT SANITIZATION LOGIC
  const handleNumericInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, ''); // Removes anything not a number
    setter(cleaned);
  };

const handleAuthentication = async () => {
  setLoading(true);
  try {
    if (isLoginMode) {
      // --- LOGIN ---
      const response = await loginUser({ email, password });
      
      // LOG for debugging: Ensure response.user contains _id
      console.log("Full API Response:", response); 

      if (response && response.user && response.token) {
        // Force the user object to have an _id property if it's missing but 'id' exists
        const userData = {
          ...response.user,
          _id: response.user._id || response.user.id 
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        
        Alert.alert("Success", `Welcome ${userData.fullName}`);

        const userRole = userData.role.toLowerCase();
        if (userRole === "farmer") {
          router.replace("/(drawer)/FarmerDashboard");
        } else {
          router.replace("/marketplace");
        }
      } else {
        throw new Error("Invalid response from server");
      }

    } else {
      // --- REGISTER ---
      const newUser = {
        fullName, mobileNumber, email, password,
        role, aadhaarNum,
        landSize: Number(landSize) || 0,
        state, district, village
      };

      await registerUser(newUser);
      Alert.alert("Success", "Account created! Please Sign In.");
      setIsLoginMode(true);
    }
  } catch (error) {
    const technicalError = error.response ? JSON.stringify(error.response.data) : error.message;
    console.log("Auth Error:", technicalError);
    Alert.alert("Auth Error", "Please check your credentials or network."); 
  } finally {
    setLoading(false);
  }
};
  // 2. ROLE SELECTOR COMPONENT
  const RoleSelector = () => (
    <View style={styles.roleMenu}>
      {['Farmer', 'Buyer', 'Admin'].map((r) => (
        <TouchableOpacity 
          key={r}
          style={[styles.roleOption, role === r && styles.roleOptionActive]}
          onPress={() => setRole(r)}
        >
          <Text style={[styles.roleOptionText, role === r && styles.roleOptionTextActive]}>
            {r}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSignUpForm = () => (
    <>
      <Text style={styles.formTitle}>Create Account</Text>
      
      <Text style={styles.label}>Register as:</Text>
      <RoleSelector />

      <View style={styles.row}>
        <TextInput 
          style={[styles.input, styles.halfInput]} 
          placeholder="Full Name *" 
          value={fullName} 
          onChangeText={setFullName} 
        />
        <TextInput 
          style={[styles.input, styles.halfInput]} 
          placeholder="Mobile *" 
          value={mobileNumber} 
          onChangeText={(txt) => handleNumericInput(txt, setMobileNumber)} 
          keyboardType="phone-pad" 
          maxLength={10} 
        />
      </View>

      <TextInput style={styles.input} placeholder="Email Address *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.row}>
        <TextInput style={[styles.input, styles.halfInput]} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={[styles.input, styles.halfInput]} placeholder="Confirm *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      </View>

      <TextInput 
        style={styles.input} 
        placeholder="Aadhaar Number (12-digit)" 
        value={aadhaarNum} 
        onChangeText={(txt) => handleNumericInput(txt, setAadhaarNum)} 
        keyboardType="number-pad" 
        maxLength={12} 
      />

      {role === 'Farmer' && (
  <TextInput 
    style={styles.input} 
    placeholder="Land Size (in Acres) *" 
    value={landSize} 
    onChangeText={(txt) => handleNumericInput(txt, setLandSize)} 
    keyboardType="numeric" 
  />
)}

      <View style={styles.row}>
        <TextInput style={[styles.input, styles.thirdInput]} placeholder="State" value={state} onChangeText={setState} />
        <TextInput style={[styles.input, styles.thirdInput]} placeholder="District" value={district} onChangeText={setDistrict} />
        <TextInput style={[styles.input, styles.thirdInput]} placeholder="Village" value={village} onChangeText={setVillage} />
      </View>

      <TouchableOpacity style={styles.authButton} onPress={handleAuthentication} disabled={loading}>
        <Text style={styles.authButtonText}>{loading ? 'Processing...' : 'Create Account'}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Image source={logoImage} style={styles.logo} />
            <Text style={styles.title}>Krishi Unnati</Text>
          </View>
          <View style={styles.formContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {isLoginMode ? (
                /* Keeping Login simple as per your request */
                <View>
                  <Text style={styles.formTitle}>Login</Text>
                  <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                  <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                  <TouchableOpacity style={styles.authButton} onPress={handleAuthentication}>
                    <Text style={styles.authButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : renderSignUpForm()}
              
              <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.toggleLink}>{isLoginMode ? 'Sign Up' : 'Sign In'}</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 68, 32, 0.75)', justifyContent: 'flex-end' },
  titleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 60, height: 60, marginBottom: 10 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  formContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  formTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, height: 50, paddingHorizontal: 15, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  thirdInput: { width: '31%' },
  roleMenu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#DDD', marginHorizontal: 4 },
  roleOptionActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  roleOptionText: { color: '#666', fontWeight: 'bold' },
  roleOptionTextActive: { color: '#FFF' },
  authButton: { backgroundColor: '#22C55E', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  authButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  toggleContainer: { marginTop: 20, alignItems: 'center', paddingBottom: 20 },
  toggleText: { color: '#666' },
  toggleLink: { color: '#22C55E', fontWeight: 'bold' },
});

export default AuthScreen;