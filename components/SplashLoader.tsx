import { View } from "react-native";
import LoadingMessage from "@/components/LoadingMessage";

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
      <LoadingMessage message="Memuat aplikasi..." />
    </View>
  );
}
