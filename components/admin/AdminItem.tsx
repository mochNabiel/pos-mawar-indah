import React from "react"
import { View } from "react-native"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge"
import { Feather } from "@expo/vector-icons"
import { LockIcon, StarIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"

import { UserWithId } from "@/types/user"

interface Props {
  user: UserWithId
  onEdit: (email: string) => void
  onShowDelete: () => void
}

const UserItem: React.FC<Props> = ({ user, onEdit, onShowDelete }) => {
  return (
    <Card size="sm" variant="outline" className="rounded-lg mb-5">
      <View>
        <View className="flex-row items-start justify-between">
          <View className="flex-row gap-2 items-center mb-3">
            <Card variant="filled" size="sm" className="bg-secondary-400 rounded-lg">
              <Feather name="user" size={16} color="black" />
            </Card>
            <Text className="text-xl font-semibold">{user.name}</Text>
          </View>
          {user.role === "admin" ? (
            <Badge size="md" variant="outline" action="success" className="flex-row gap-2 rounded-full">
              <BadgeText>Admin</BadgeText>
              <BadgeIcon as={LockIcon} />
            </Badge>
          ) : (
            <Badge size="md" variant="outline" action="info" className="flex-row gap-2 rounded-full">
              <BadgeText>Superadmin</BadgeText>
              <BadgeIcon as={StarIcon} />
            </Badge>
          )}
        </View>
        <Text className="text-lg text-typography-700">Email: {user.email}</Text>
        <Text className="text-lg text-typography-700">Role: {user.role}</Text>
        <Text className="text-lg text-typography-700 mb-3">
          Terdaftar:{" "}
          {new Date(user.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <Button onPress={() => onEdit(user.email)} className="flex-1 rounded-lg">
            <Feather name="edit" color="white" />
            <ButtonText>Edit</ButtonText>
          </Button>
          <Button variant="outline" action="negative" className="flex-1 rounded-lg" onPress={onShowDelete}>
            <Feather name="trash" color="red" />
            <ButtonText className="text-red-500">Hapus</ButtonText>
          </Button>
        </View>
      </View>
    </Card>
  )
}

export default UserItem
