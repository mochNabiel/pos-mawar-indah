import React from "react"
import { View, Text } from "react-native"
import { logout } from "@/utils/auth"
import { useRouter } from "expo-router"
import { Button, ButtonText } from "@/components/ui/button"

const Setting = () => {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace("/(auth)/login")
  }

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold mb-4">Pengaturan</Text>
      <Button onPress={handleLogout} variant="link" action="negative">
        <ButtonText>Logout</ButtonText>
      </Button>
    </View>
  )
}

export default Setting
