import React, { useState } from "react"
import { View, Text } from "react-native"
import { logout } from "@/utils/auth"
import { useRouter } from "expo-router"
import { Button, ButtonText } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const Setting = () => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    setLoading(false)
    router.replace("/(auth)/login")
  }

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Button
        onPress={handleLogout}
        isDisabled={loading}
        action="negative"
        className="rounded-lg"
      >
        {loading ? (
          <View className="flex-row gap-2 items-center">
            <Spinner color="white" />
            <Text className="text-white">Memproses...</Text>
          </View>
        ) : (
          <ButtonText>Logout</ButtonText>
        )}
      </Button>
    </View>
  )
}

export default Setting
