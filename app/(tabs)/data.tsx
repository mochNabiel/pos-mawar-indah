import { useRouter } from "expo-router"
import { View } from "react-native"
import React from "react"

import { Heading } from "@/components/ui/heading"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Pressable } from "@/components/ui/pressable"

import { Feather } from "@expo/vector-icons"

const Data = () => {
  const router = useRouter()
  return (
    <View className="flex-1 bg-white justify-center items-center p-5">
      <Pressable onPress={() => router.push("/fabrics")} className="w-full">
        <Card
          size="lg"
          variant="outline"
          className="flex flex-row items-center gap-5 m-3"
        >
          <Feather name="file-text" size={24} color="black" />
          <View>
            <Heading size="lg" className="mb-1">
              Data Kain
            </Heading>
            <Text size="sm">Klik untuk melihat data kain</Text>
          </View>
        </Card>
      </Pressable>
    </View>
  )
}

export default Data
