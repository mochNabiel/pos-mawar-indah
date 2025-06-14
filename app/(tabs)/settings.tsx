import React from "react"
import { View, Text } from "react-native"
import { logout } from "@/utils/auth"
import { useRouter } from "expo-router"
import { Button, ButtonText } from "@/components/ui/button"
import { collection, getDocs } from "firebase/firestore"

import fabricData from "@/fabricdata.json"
import { db } from "@/utils/firebase"

const Setting = () => {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace("/(auth)/login")
  }

  const handleSubmit = async () => {
    const fabricRef = collection(db, "fabrics")
    const snapshot = await getDocs(fabricRef)
    const fabrics = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }))
    console.log(fabrics.length)
  }

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold mb-4">Pengaturan</Text>
      <Button onPress={handleLogout} variant="link" action="negative">
        <ButtonText>Logout</ButtonText>
      </Button>
      <Button onPress={handleSubmit}>
        <ButtonText>data fabric</ButtonText>
      </Button>
    </View>
  )
}

export default Setting
