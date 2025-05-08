import React from "react"
import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

export default function BackButton({ path }: { path: any }) {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.push(path)} >
      <Feather name="chevron-left" size={24} className="mr-3" />
    </Pressable>
  )
}
