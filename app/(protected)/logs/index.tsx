import { View, FlatList, Pressable } from "react-native"
import React, { useEffect, useState } from "react"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"

import { getLogs, deleteLog, markAsRead } from "@/lib/firestore/logs"
import { Log } from "@/types/logs"

import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Center } from "@/components/ui/center"
import { Heading } from "@/components/ui/heading"
import { Button, ButtonText } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge, BadgeText } from "@/components/ui/badge"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import GradientCard from "@/components/GradientCard"
import { CloseIcon, Icon } from "@/components/ui/icon"
import useToastMessage from "@/lib/hooks/useToastMessage"

const LogsScreen = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showLogModal, setShowLogModal] = useState<boolean>(false)

  const { showToast } = useToastMessage()

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await getLogs()
      setLogs(data)
    } catch (err) {
      console.error("Gagal mengambil logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleMarkAllAsRead = async () => {
    try {
      const unreadLogs = logs.filter((log) => !log.read)

      await Promise.all(unreadLogs.map((log) => markAsRead(log.id)))

      setLogs((prev) =>
        prev.map((log) => ({
          ...log,
          read: true,
        }))
      )

      showToast("Semua log telah ditandai sebagai dibaca", "success")
    } catch (err) {
      showToast("Gagal menandai semua dibaca", "error")
    }
  }

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLog(id)
      setLogs((prev) => prev.filter((log) => log.id !== id))
      setShowLogModal(false)
      showToast("Berhasil menghapus log", "success")
    } catch (err) {
      showToast("Gagal menghapus log", "error")
    }
  }

  const renderItem = ({ item }: { item: Log }) => {
    const isUnread = item.read === false

    return (
      <>
        <Pressable
          onPress={() => {
            // Open detail logs modal
            setShowLogModal(true)

            // Mark as read
            if (item.read === false) {
              markAsRead(item.id).then(() => {
                setLogs((prev) =>
                  prev.map((log) =>
                    log.id === item.id ? { ...log, read: true } : log
                  )
                )
              })
            }
          }}
          className="mb-3"
        >
          <Card
            size="md"
            variant="outline"
            className={`rounded-lg flex-row items-center gap-2 ${
              isUnread ? "bg-self-orange/10 border-self-orange" : ""
            }`}
          >
            {isUnread ? (
              <MaterialCommunityIcons name="bell-badge" size={24} />
            ) : (
              <MaterialCommunityIcons name="bell" size={24} />
            )}
            <View className="flex-1 gap-2">
              <View className="flex-row gap-2">
                <Heading>{item.adminName}</Heading>
                <Badge
                  variant="outline"
                  action="success"
                  className="rounded-full"
                >
                  <BadgeText>
                    {item.action} {item.target}
                  </BadgeText>
                </Badge>
              </View>
              <Text>{item.description}</Text>
              <Text className="text-sm">
                {new Date(item.timestamp).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit"
                })}
                {" "}
                pukul
                {" "}
                {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </Card>
        </Pressable>
        <Modal
          isOpen={showLogModal}
          onClose={() => {
            setShowLogModal(false)
          }}
          size="md"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size="xl">Detail Log</Heading>
              <ModalCloseButton>
                <Icon
                  as={CloseIcon}
                  size="md"
                />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold">Admin:</Text>
                <Text>{item.adminName}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold">Role:</Text>
                <Text>{item.adminRole}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold">Aksi:</Text>
                <Badge
                  variant="outline"
                  action="success"
                  className="rounded-full"
                >
                  <BadgeText>
                    {item.action} {item.target}
                  </BadgeText>
                </Badge>
              </View>
              <View className="mb-2">
                <Text className="font-semibold mb-1">Detail:</Text>
                <Card variant="filled" className="rounded-lg">
                  <Text>{item.description}</Text>
                </Card>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold">Waktu:</Text>
                <Text>
                  {new Date(item.timestamp).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                  {" "}
                  pukul
                  {" "}
                  {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="solid"
                action="negative"
                size="md"
                onPress={() => handleDeleteLog(item.id)}
                className="w-full rounded-lg flex-row gap-3 items-center justify-center"
              >
                <Feather name="trash" size={24} color="white" />
                <ButtonText>Hapus Log</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

  return (
    <View className="flex-1 bg-white p-5">
      <View className="gap-3">
        <Center className="flex-row items-center gap-2">
          <GradientCard>
            <Feather name="bell" size={24} color="white" />
          </GradientCard>
          <View>
            <Heading size="2xl">Data Logs</Heading>
            <Text>Monitor aktivitas admin sistem</Text>
          </View>
        </Center>
        <Button
          variant="outline"
          size="lg"
          className="flex-row gap-2 items-center rounded-lg"
          onPress={handleMarkAllAsRead}
        >
          <Feather name="check-circle" size={16} />
          <ButtonText>Tandai Semua Dibaca</ButtonText>
        </Button>
      </View>

      <View className="mt-6 flex-1">
        {loading ? (
          <Center className="flex-1">
            <Spinner size="large" color="#BF40BF" />
            <Text className="text-gray-500">Memuat data log...</Text>
          </Center>
        ) : logs.length === 0 ? (
          <Center className="flex-1">
            <Text className="text-gray-500">Log masih kosong</Text>
          </Center>
        ) : (
          <FlatList
            data={logs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

export default LogsScreen
