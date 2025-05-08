import React from "react"
import { View, Text } from "react-native"
import { logout } from "@/utils/auth"
import { useRouter } from "expo-router"
import { Button, ButtonText } from "@/components/ui/button"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

const Setting = () => {
  const router = useRouter()
  const { user } = useCurrentUser()

  const handleLogout = async () => {
    await logout()
    router.replace("/(auth)/login")
  }

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold mb-4">Pengaturan</Text>
      {/* Coba dulu tanpa auth superadmin */}
      {
        user?.role === "superadmin" && (
          <Button
            onPress={() => router.push("/(protected)/register")}
            variant="solid"
            action="info"
            className="rounded-full mb-4"
          >
            <ButtonText>Register Admin Baru</ButtonText>
          </Button>
        )
      }
      <Button onPress={handleLogout} variant="link" action="negative">
        <ButtonText>Logout</ButtonText>
      </Button>
    </View>
  )
}

export default Setting
