import { View, Text, StyleSheet } from "react-native";
import {COLORS} from "../constants/colors";

export default function RecentActivityItem({ activity }) {
  return (
    <View style={styles.item}>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.text}>{activity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dot: { fontSize: 20, color: COLORS.primary, marginRight: 6 },
  text: { fontSize: 14, color: COLORS.textPrimary },
});
