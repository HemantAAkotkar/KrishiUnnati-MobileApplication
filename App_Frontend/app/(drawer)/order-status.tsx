import { View, Text, StyleSheet } from 'react-native';

export default function OrderStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tracking your harvest deliveries...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#1B4332' }
});