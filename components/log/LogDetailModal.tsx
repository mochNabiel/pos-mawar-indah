import React from "react"
import { View } from "react-native"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge, BadgeText } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { CloseIcon } from "@/components/ui/icon"
import { Feather } from "@expo/vector-icons"
import { Log } from "@/types/logs"

type Props = {
  log: Log | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

const LogDetailModal = ({ log, isOpen, onClose, onDelete }: Props) => {
  if (!log) return null

  const actionMap: Record<string, "success" | "info" | "error" | undefined> = {
    customer: "success",
    kain: "info",
    transaksi: "error",
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="xl">Detail Log</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="lg" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Admin:</Text>
            <Text className="text-lg">{log.adminName}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Role:</Text>
            <Text className="text-lg">{log.adminRole}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Aksi:</Text>
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
          <View className="mb-2">
            <Text className="text-lg font-semibold mb-1">Detail:</Text>
            <Card variant="filled" className="rounded-lg">
              <Text className="text-lg">{log.description}</Text>
            </Card>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Waktu:</Text>
            <Text className="text-lg">
              {new Date(log.timestamp).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}{" "}
              pukul{" "}
              {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </ModalBody>
        <ModalFooter>
          <Button
            action="negative"
            className="w-full flex-row gap-3 justify-center rounded-lg"
            onPress={() => onDelete(log.id)}
          >
            <Feather name="trash" size={20} color="white" />
            <ButtonText>Hapus Log</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LogDetailModal
