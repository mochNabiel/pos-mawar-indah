import React from "react"
import { View, Pressable } from "react-native"
import { Log } from "@/types/logs"
import { Heading } from "@/components/ui/heading"
import { Badge, BadgeText } from "@/components/ui/badge"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { MaterialCommunityIcons } from "@expo/vector-icons"

type Props = {
  log: Log
  onPress: (log: Log) => void
}

const LogItem = ({ log, onPress }: Props) => {
  const isUnread = !log.read

  const actionMap: Record<string, "success" | "info" | "error" | undefined> = {
    customer: "success",
    kain: "info",
    transaksi: "error",
  }

  return (
    <Pressable onPress={() => onPress(log)}>
      <Card
        variant="outline"
        size="md"
        className={`flex-row items-center gap-2 rounded-lg ${
          isUnread ? "bg-self-orange/10 border-self-orange" : ""
        }`}
      >
        <MaterialCommunityIcons
          name={isUnread ? "bell-badge" : "bell"}
          size={24}
        />
        <View className="flex-1 gap-1">
          <View className="flex-row justify-between items-center">
            <Heading>{log.adminName}</Heading>
            <Badge
              variant="outline"
              action={actionMap[log.target]}
              className="rounded-full"
            >
              <BadgeText>
                {log.action} {log.target}
              </BadgeText>
            </Badge>
          </View>
          <Text>{log.description}</Text>
          <Text className="text-sm">
            {new Date(log.timestamp).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}{" "}
            |{" "}
            {new Date(log.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}

export default LogItem
