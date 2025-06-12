import { View, FlatList, Pressable } from "react-native"
import React, { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"

import { getLogs, deleteLog, markAsRead } from "@/lib/firestore/logs"
import { Log } from "@/types/logs"

import LogItem from "@/components/logs/LogItem"
import LogDetailModal from "@/components/logs/LogDetailModal"

import { Center } from "@/components/ui/center"
import { Heading } from "@/components/ui/heading"
import { Button, ButtonText } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

import GradientCard from "@/components/GradientCard"
import LoadingMessage from "@/components/LoadingMessage"
import useToastMessage from "@/lib/hooks/useToastMessage"
import useBackHandler from "@/lib/hooks/useBackHandler"

const LogsScreen = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const { showToast } = useToastMessage()

  useBackHandler("(tabs)/data")

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
      setLogs((prev) => prev.map((log) => ({ ...log, read: true })))
      showToast("Semua log telah ditandai sebagai dibaca", "success")
    } catch (err) {
      showToast("Gagal menandai semua dibaca", "error")
    }
  }

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLog(id)
      setLogs((prev) => prev.filter((log) => log.id !== id))
      setShowModal(false)
      setSelectedLog(null)
      showToast("Berhasil menghapus log", "success")
    } catch (err) {
      showToast("Gagal menghapus log", "error")
    }
  }

  const handleSelectLog = async (log: Log) => {
    if (!log.read) {
      await markAsRead(log.id)
      setLogs((prev) =>
        prev.map((l) => (l.id === log.id ? { ...l, read: true } : l))
      )
    }
    setSelectedLog(log)
    setShowModal(true)
  }

  const renderItem = ({ item }: { item: Log }) => (
    <Pressable onPress={() => handleSelectLog(item)} className="mb-3">
      <LogItem log={item} onPress={() => handleSelectLog(item)} />
    </Pressable>
  )

  return (
    <View className="flex-1 bg-white p-5">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <LoadingMessage message="Memuat Data Log..." />
        </View>
      ) : (
        <>
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
            {logs.length === 0 ? (
              <Center className="flex-1">
                <Text className="text-gray-500">Log masih kosong</Text>
              </Center>
            ) : (
              <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </>
      )}

      <LogDetailModal
        log={selectedLog}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDeleteLog}
      />
    </View>
  )
}

export default LogsScreen
