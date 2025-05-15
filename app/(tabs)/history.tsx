import { Pressable, FlatList, Text, View } from "react-native"
import React, { useState, useEffect, useMemo } from "react"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"

import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import dayjs from "dayjs"
import "dayjs/locale/id"

import { DocumentData } from "firebase/firestore"

import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Card } from "@/components/ui/card"
import { Button, ButtonText } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input, InputField } from "@/components/ui/input"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useTransactionStore } from "@/lib/zustand/useTransactionStore"

dayjs.locale("id") // Set locale tanggal ke bahasa Indonesia

export default function History() {
  const router = useRouter()
  const defaultClassNames = useDefaultClassNames()

  const transactions = useTransactionStore((state) => state.transactions)
  const loading = useTransactionStore((state) => state.loading)
  const hasMore = useTransactionStore((state) => state.hasMore)
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions
  )
  const resetTransactions = useTransactionStore(
    (state) => state.resetTransactions
  )

  const [showModal, setShowModal] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedQuery = useDebouncedValue(searchQuery, 700)

  useEffect(() => {
    fetchTransactions(true)
  }, [])

  const filteredInvoices = useMemo(() => {
    let data = [...transactions]

    if (debouncedQuery) {
      data = data.filter((invoice) =>
        invoice.customerName
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      )
    }

    if (startDate && endDate) {
      data = data.filter((invoice) => {
        const date = new Date(invoice.createdAt)
        return date >= startDate && date <= endDate
      })
    } else if (startDate) {
      data = data.filter((invoice) => {
        const date = new Date(invoice.createdAt)
        return (
          date.getFullYear() === startDate.getFullYear() &&
          date.getMonth() === startDate.getMonth() &&
          date.getDate() === startDate.getDate()
        )
      })
    }

    data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return data
  }, [transactions, debouncedQuery, startDate, endDate])

  const getDateDifference = (invoiceDate: string | Date) => {
    const invoice = new Date(invoiceDate)
    const now = new Date()
    invoice.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffDays = Math.floor(
      (now.getTime() - invoice.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return "Hari Ini"
    if (diffDays === 1) return "Kemarin"
    if (diffDays <= 7) return "Minggu Lalu"
    return "Lebih Lama"
  }

  const groupedInvoices = useMemo(() => {
    const groups = filteredInvoices.reduce((acc, invoice) => {
      const group = getDateDifference(invoice.createdAt)
      if (!acc[group]) acc[group] = []
      acc[group].push(invoice)
      return acc
    }, {} as Record<string, DocumentData[]>)

    const allGroups = ["Hari Ini", "Kemarin", "Minggu Lalu", "Lebih Lama"]

    return allGroups
      .filter((group) => groups[group]?.length > 0)
      .map((group) => ({
        title: group,
        data: groups[group],
      }))
  }, [filteredInvoices])

  const resetFilter = () => {
    setStartDate(null)
    setEndDate(null)
    setSearchQuery("")
    resetTransactions()
    fetchTransactions(true)
  }

  const flatListData = useMemo(() => {
    const items: Array<{
      type: "header" | "item"
      id: string
      title?: string
      item?: DocumentData
    }> = []
    groupedInvoices.forEach((group) => {
      items.push({
        type: "header",
        id: `header-${group.title}`,
        title: group.title,
      })
      group.data.forEach((invoice) =>
        items.push({ type: "item", id: invoice.id, item: invoice })
      )
    })
    return items
  }, [groupedInvoices])

  const renderItem = ({ item }: { item: DocumentData }) => (
    <Pressable
      onPress={() => router.push(`/transactions/${item.invCode}`)}
      className="mb-4"
    >
      <Card
        size="sm"
        variant="outline"
        className="flex rounded-lg flex-row items-center justify-between"
      >
        <View>
          <Text className="text-xl font-semibold mb-1">
            {item.customerName}
          </Text>
          <Text>Faktur {item.invCode}</Text>
          <View className="flex flex-row gap-2">
            <Text className="text-sm">
              {dayjs(item.createdAt).format("DD MMMM YYYY")}
            </Text>
            <Text className="text-sm">
              {new Date(item.createdAt)
                .toLocaleTimeString("id-ID")
                .replace(/\./g, ":")}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={24} />
      </Card>
    </Pressable>
  )

  const flattenedRenderItem = ({
    item,
  }: {
    item: { type: string; id: string; title?: string; item?: DocumentData }
  }) => {
    if (item.type === "header") {
      return (
        <Text className="text-xl font-semibold mb-2 mt-4">{item.title}</Text>
      )
    }
    if (item.type === "item" && item.item) {
      return renderItem({ item: item.item })
    }
    return null
  }

  const keyExtractor = (item: { id: string }) => item.id

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchTransactions()
    }
  }

  return (
    <View className="flex-1 bg-white px-5">
      <Text className="text-2xl font-bold mx-auto text-center mb-4 mt-2">
        Riwayat Penjualan
      </Text>

      {loading && transactions.length === 0 ? (
        <View className="flex flex-row gap-1 items-center justify-center">
          <Spinner />
          <Text>Mendapatkan Data Invoice</Text>
        </View>
      ) : (
        <>
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            size="lg"
          >
            <ModalBackdrop />
            <ModalContent>
              <ModalBody className="mb-0">
                <DateTimePicker
                  mode="range"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={({
                    startDate,
                    endDate,
                  }: {
                    startDate: any
                    endDate: any
                  }) => {
                    setStartDate(startDate)
                    setEndDate(endDate)
                  }}
                  classNames={{
                    ...defaultClassNames,
                    today: "border-self-purple border-1",
                    selected: "bg-self-purple",
                    selected_label: "text-white",
                    range_end_label: "text-white",
                    range_start_label: "text-white",
                    range_fill: "bg-self-purple/20",
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  className="w-full rounded-lg"
                  size="lg"
                  onPress={() => {
                    setShowModal(false)
                  }}
                >
                  <ButtonText>Pilih Tanggal</ButtonText>
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Input className="mb-4 rounded-lg" size="lg">
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari invoice berdasarkan nama customer..."
            />
          </Input>

          <View className="flex flex-row items-center justify-between gap-4 mb-4">
            <Button
              onPress={() => {
                resetFilter()
              }}
              variant="outline"
              size="lg"
              className="flex-1 rounded-lg"
            >
              <ButtonText>Reset Filter</ButtonText>
            </Button>

            <Button
              onPress={() => setShowModal(true)}
              variant="solid"
              size="lg"
              className="flex-1 rounded-lg flex flex-row gap-2"
            >
              <Feather name="calendar" size={24} color="white" />
              <ButtonText>Rentang Tanggal</ButtonText>
            </Button>
          </View>

          <FlatList
            data={flatListData}
            renderItem={flattenedRenderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && transactions.length > 0 ? <Spinner /> : null
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}
    </View>
  )
}
