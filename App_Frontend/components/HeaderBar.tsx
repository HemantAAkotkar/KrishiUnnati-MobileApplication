import { View, Text, StyleSheet } from "react-native";
import {COLORS} from "../constants/colors";

export default function HeaderBar({ username, farmName }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>🌾 Krishi-Unnati</Text>
      <View style={styles.profile}>
        <Text style={styles.user}>{username}</Text>
        <Text style={styles.farm}>{farmName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "white", fontSize: 18, fontWeight: "700" },
  profile: { alignItems: "flex-end" },
  user: { color: "white", fontWeight: "600" },
  farm: { color: "#f0f0f0", fontSize: 12 },
});
