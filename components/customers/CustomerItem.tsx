import React from "react"
import { Pressable, View } from "react-native"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons"
import { Customer } from "@/types/customer"
import { Button, ButtonText } from "../ui/button"

interface Props {
  customer: Customer
  onPress: () => void
  onEdit: () => void
  onDelete: () => void
}

const CustomerItem: React.FC<Props> = ({
  customer,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <Pressable onPress={onPress} className="mb-3">
      <Card size="lg" variant="outline" className="p-4">
        <View className="gap-1">
          <Heading size="lg">{customer.name}</Heading>
          <View className="flex-row items-center gap-2">
            <Feather name="home" color="gray" />
            <Text className="text-typography-500">{customer.company}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Feather name="phone" color="gray" />
            <Text className="text-typography-500">{customer.phone}</Text>
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

export default CustomerItem
