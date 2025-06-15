import React, { useState, useEffect } from "react"
import { FlatList, Text, View } from "react-native"
import { useRouter } from "expo-router"
import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import { SearchIcon } from "@/components/ui/icon"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Button, ButtonText } from "@/components/ui/button"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Feather } from "@expo/vector-icons"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import useTransactionStore from "@/lib/zustand/useTransactionStore"
import TransactionItem from "@/components/transactions/TransactionItem"
import LoadingMessage from "@/components/LoadingMessage"

export default function History() {
  const router = useRouter()
  const defaultClassNames = useDefaultClassNames()

  const {
    transactions,
    loading,
    hasMore,
    fetchInitial,
    fetchMore,
    setCustomerName,
    setDateRange,
    resetFilters,
  } = useTransactionStore()

  // Modal dan filter lokal sebelum diterapkan
  const [showDateModal, setShowDateModal] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null)

  // Search & debounce
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDebouncedValue(searchQuery, 500)

  // Fetch data awal saat pertama kali
  useEffect(() => {
    fetchInitial()
  }, [])

  // Fetch ulang ketika query nama customer berubah
  useEffect(() => {
    setCustomerName(debouncedQuery)
  }, [debouncedQuery])

  // Terapkan filter tanggal
  const applyDateFilter = () => {
    setDateRange(tempStartDate, tempEndDate)
    setShowDateModal(false)
  }

  // Reset semua filter dan input
  const resetAllFilters = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    setSearchQuery("")
    resetFilters()
    setShowDateModal(false)
  }

  return (
    <View className="flex-1 bg-white px-5">
      {loading && transactions.length === 0 ? (
        <LoadingMessage message="Memuat Data Transaksi..." />
      ) : (
        <>
          <Text className="text-2xl font-bold mx-auto text-center mb-4 mt-2">
            Riwayat Penjualan
          </Text>

          {/* MODAL TANGGAL */}
          <Modal
            isOpen={showDateModal}
            onClose={() => setShowDateModal(false)}
            size="lg"
          >
            <ModalBackdrop />
            <ModalContent>
              <ModalBody className="mb-0">
                <DateTimePicker
                  mode="range"
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  onChange={({ startDate, endDate }: any) => {
                    setTempStartDate(startDate)
                    setTempEndDate(endDate)
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
                <View className="flex w-full gap-3">
                  <Button
                    className="rounded-lg"
                    variant="outline"
                    size="lg"
                    onPress={resetAllFilters}
                  >
                    <ButtonText>Reset Filter</ButtonText>
                  </Button>
                  <Button
                    className="rounded-lg"
                    size="lg"
                    onPress={applyDateFilter}
                  >
                    <ButtonText>Pilih Tanggal</ButtonText>
                  </Button>
                </View>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* INPUT & TOMBOL */}
          <View className="flex flex-row items-center justify-between gap-3 mb-4">
            <Input className="flex-1 flex-row gap-1 rounded-lg" size="lg">
              <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} />
              </InputSlot>
              <InputField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari Nama Customer..."
              />
            </Input>
            <Button
              size="xl"
              className="rounded-lg p-3 px-4 bg-self-purple"
              onPress={() => setShowDateModal(true)}
            >
              <ButtonText>
                <Feather name="calendar" size={20} />
              </ButtonText>
            </Button>
          </View>

          {/* LIST TRANSAKSI */}
          {transactions.length === 0 ? (
            <Text className="text-center text-gray-400 mt-12">
              Tidak ada transaksi ditemukan
            </Text>
          ) : (
            <FlatList
              data={transactions}
              renderItem={({ item }) => (
                <TransactionItem
                  item={item}
                  onPress={() => router.push(`/transactions/${item.invCode}`)}
                />
              )}
              keyExtractor={(item) => item.invCode}
              contentContainerStyle={{ paddingBottom: 20 }}
              onEndReached={() => {
                if (hasMore && !loading) fetchMore()
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                hasMore ? (
                  <Text className="text-center text-gray-500 mb-4">
                    Menampilkan lebih banyak...
                  </Text>
                ) : (
                  <Text className="text-center text-gray-400 mb-4">
                    Semua data sudah dimuat
                  </Text>
                )
              }
            />
          )}
        </>
      )}
    </View>
  )
}
