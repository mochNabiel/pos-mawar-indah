import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

export default function BackButton({ path }: { path: string }) {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.push(path)} className="p-5">
      <Feather name="chevron-left" size={24} />
    </Pressable>
  )
}
