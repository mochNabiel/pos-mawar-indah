import React, { useEffect, useState } from "react"
import { View } from "react-native"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Feather } from "@expo/vector-icons"

const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card
      variant="outline"
      className="flex-1 flex flex-row justify-between items-center mb-5"
    >
      <View className="flex gap-2">
        <View className="flex flex-row gap-2 items-center">
          <Feather name="calendar" size={24} color="#BF40BF" />
          <Text className="text-lg font-semibold" style={{ color: "#BF40BF" }}>
            Tanggal
          </Text>
        </View>
        <Text className="text-lg font-semibold">
          {currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
      <View className="flex gap-2">
        <View className="flex flex-row gap-2 items-center">
          <Feather name="clock" size={24} color="#BF40BF" />
          <Text className="text-lg font-semibold" style={{ color: "#BF40BF" }}>
            Waktu
          </Text>
        </View>
        <Text className="text-lg font-semibold">
          {currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
      </View>
    </Card>
  )
}

export default DateTimeDisplay
