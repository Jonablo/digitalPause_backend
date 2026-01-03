import { useRF07 } from "@/src/useRF07";
import { Text, View } from "react-native";

export default function Index() {
  const { sessionCount } = useRF07();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 18 }}>RF-07 – Sesiones comenzadas</Text>
      <Text style={{ fontSize: 32 }}>{sessionCount}</Text>
    </View>
  );
}
