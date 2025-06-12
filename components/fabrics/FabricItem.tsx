import React from "react"
import { Pressable, View } from "react-native"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Feather } from "@expo/vector-icons"
import { Fabric } from "@/types/fabric"
import { Button, ButtonText } from "@/components/ui/button"
import { Badge, BadgeText } from "@/components/ui/badge"

interface Props {
  fabric: Fabric
  onPress: () => void
  onEdit: () => void
  onDelete: () => void
}

const fabricItem: React.FC<Props> = ({ fabric, onPress, onEdit, onDelete }) => {
  const actionMap: Record<string, "muted" | "info" | "warning" | undefined> = {
    HITAM: "muted",
    PUTIH: "info",
    "WARNA LAIN": "warning",
  }

  return (
    <Pressable onPress={onPress} className="mb-3">
      <Card size="lg" variant="outline" className="p-4">
        <View className="gap-1">
          <View className="flex-row justify-between items-center">
            <Heading size="lg">{fabric.name}</Heading>
            <Badge
              size="md"
              variant="outline"
              action={actionMap[fabric.color]}
              className="flex-row gap-2 rounded-full"
            >
              <BadgeText>{fabric.color}</BadgeText>
            </Badge>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-typography-500">{fabric.code}</Text>
          </View>
          <View className="flex-row items-center gap-3 mt-3">
            <Button onPress={onEdit} className="flex-1 rounded-lg">
              <Feather name="edit" color="white" />
              <ButtonText>Edit</ButtonText>
            </Button>
            <Button
              variant="outline"
              action="negative"
              className="flex-1 rounded-lg"
              onPress={onDelete}
            >
              <Feather name="trash" color="red" />
              <ButtonText className="text-red-500">Hapus</ButtonText>
            </Button>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

export default fabricItem
