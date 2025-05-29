import { View, Text, ActivityIndicator } from "react-native";

export default function SplashLoader() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
      }}
    >
      <ActivityIndicator size="large" color="#BF40BF" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#BF40BF" }}>
        Memuat aplikasi...
      </Text>
    </View>
  );
}
