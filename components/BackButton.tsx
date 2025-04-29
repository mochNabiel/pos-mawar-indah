// components/common/BackButton.tsx
import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

export default function BackButton() {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.back()} className="mr-5">
      <Feather name="chevron-left" size={24} />
    </Pressable>
  )
}
