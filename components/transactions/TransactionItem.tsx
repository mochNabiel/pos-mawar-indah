import React from "react"
import { Pressable, Text, View } from "react-native"
import { Card } from "@/components/ui/card"

interface Props {
  item: {
    invCode: string
    customerName: string
    createdAt: Date
  }
  onPress: () => void
}

export default function TransactionItem({ item, onPress }: Props) {
  const date = new Date(item.createdAt)

  return (
    <Pressable onPress={onPress} className="mb-4">
      <Card
        size="sm"
        variant="outline"
        className="rounded-lg"
      >
        <View>
          <Text className="text-xl font-semibold">{item.customerName}</Text>
          <Text className="text-typography-700">
            #{item.invCode}
          </Text>
        </View>
        <View className="flex items-end justify-end">
          <Text className="text-xl font-semibold">
            {date.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Text className="text-lg text-typography-700">
            {date.toLocaleTimeString("id-ID", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}
