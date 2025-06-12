import React from "react"
import { View } from "react-native"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from "@/components/ui/modal"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Icon } from "@/components/ui/icon"
import { CloseIcon } from "@/components/ui/icon"
import { Fabric } from "@/types/fabric"
import { Badge, BadgeText } from "@/components/ui/badge"

type Props = {
  fabric: Fabric | null
  isOpen: boolean
  onClose: () => void
}

const FabricDetailModal = ({ fabric, isOpen, onClose }: Props) => {
  if (!fabric) return null

  const actionMap: Record<string, "muted" | "info" | "warning" | undefined> = {
    HITAM: "muted",
    PUTIH: "info",
    "WARNA LAIN": "warning",
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="mb-3">
          <Heading size="xl">Detail Kain</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="lg" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Kode:</Text>
            <Text className="text-lg">{fabric.code}</Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Nama Kain:</Text>
            <Text className="text-lg">{fabric.name || "-"}</Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Warna:</Text>
            <Badge
              size="md"
              variant="outline"
              action={actionMap[fabric.color]}
              className="flex-row gap-2 rounded-lg"
            >
              <BadgeText>{fabric.color}</BadgeText>
            </Badge>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Harga Ecer:</Text>
            <Text className="text-lg">
              Rp {fabric.retailPrice.toLocaleString("id-ID") || "-"}
            </Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Harga Grosir:</Text>
            <Text className="text-lg">
              Rp {fabric.wholesalePrice.toLocaleString("id-ID") || "-"}
            </Text>
          </View>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold">Harga Roll:</Text>
            <Text className="text-lg">
              Rp {fabric.rollPrice.toLocaleString("id-ID") || "-"}
            </Text>
          </View>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FabricDetailModal
