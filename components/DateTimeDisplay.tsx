import React, { useEffect, useState } from "react"
import { View } from "react-native"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Feather } from "@expo/vector-icons"

export const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View className="flex flex-row gap-3 mb-4">
      <Card variant="outline" className="flex-1 flex flex-row gap-3 mb-4">
        <Feather name="calendar" size={24} color="black" />
        <Text className="font-semibold">
          {currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </Card>
      <Card variant="outline" className="flex-1 flex flex-row gap-3 mb-4">
        <Feather name="clock" size={24} color="black" />
        <Text className="font-semibold">
          {currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
      </Card>
    </View>
  )
}
