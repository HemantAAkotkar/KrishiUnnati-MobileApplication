import { View, Text, StyleSheet } from "react-native";
import {COLORS} from "../constants/colors";

export default function DashboardCard({ title, value, subtitle }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { color: COLORS.secondary, fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "700", color: COLORS.primary },
  subtitle: { color: "#888", fontSize: 12 },
});
