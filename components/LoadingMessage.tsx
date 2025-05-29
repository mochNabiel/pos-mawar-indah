import { View, Text } from "react-native"
import React from "react"
import { Center } from "@/components/ui/center"
import { Spinner } from "@/components/ui/spinner"

const LoadingMessage = ({ message }: { message: string }) => {
  return (
    <Center className="flex-1">
      <View className="flex-row items-center gap-2">
        <Spinner size="large" color="#BF40BF" />
        <Text className="text-self-purple">{message}</Text>
      </View>
    </Center>
  )
}

export default LoadingMessage
