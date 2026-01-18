// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// export default function RootLayout() {
  
//   return (
//       <Stack>
//         {/* <Stack.Screen name="dashboard" options={{headerShown: false,}}/> */}
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="login" options={{ headerShown: false }} />
//       <Stack.Screen name="marketplace" options={{ headerShown: false }} />
//       {/* <Stack.Screen name="category" options={{ headerShown: false }} /> */}
//       {/* <Stack.Screen name="profile" options={{ headerShown: false }} />       */}
//       {/* <Stack.Screen name="farmerConfirmation" options={{ headerShown: false }} /> */}
//       {/* <Stack.Screen name="productDetail" options={{ headerShown: false }} /> */}
//       {/* <Stack.Screen name="AddProduct" options={{ headerShown: false }} /> */}
//       {/* <Stack.Screen name="buyer-Dashboard" options={{ headerShown: false }} /> */}
//       {/* <Stack.Screen name="prototype" options={{ headerShown: false }} /> */}
//       </Stack>
//   );
// }

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth & Splash */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="login" />

        {/* The Drawer Group */}
        <Stack.Screen name="(drawer)" /> 

        {/* Marketplace (Outside the drawer folder) */}
        <Stack.Screen name="marketplace" options={{ headerShown: false }} />
        
        {/* Product Detail (Inside a folder named productDetail) */}
        <Stack.Screen name="productDetail/[id]" options={{ headerShown: true, title: 'Product Details' }} />
        
        {/* Add Product */}
        <Stack.Screen name="AddProduct" options={{ presentation: 'modal', title: 'List Crop' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}