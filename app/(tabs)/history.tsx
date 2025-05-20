import React, { useState, useEffect, useMemo } from "react"
import { Pressable, FlatList, Text, View } from "react-native"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import "dayjs/locale/id"
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
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Feather } from "@expo/vector-icons"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useTransactionStore } from "@/lib/zustand/useTransactionStore"
import { PaginationFooter } from "@/components/PaginationFooter"

dayjs.locale("id")

export default function History() {
  const router = useRouter()
  const defaultClassNames = useDefaultClassNames()

  // Ambil state dari store
  const {
    transactions,
    loading,
    hasMore,
    currentPage,
    fetchTransactions,
    resetTransactions,
  } = useTransactionStore()

  // State untuk modal pilih tanggal dan penyimpanan sementara tanggal
  const [showDateModal, setShowDateModal] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null)

  // State input pencarian nama customer
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDebouncedValue(searchQuery, 700) // Debounce untuk menghindari fetch berlebihan

  // Ambil data transaksi saat komponen dimuat dan saat filter berubah
  useEffect(() => {
    fetchTransactions(
      1,
      debouncedQuery,
      startDate ?? undefined,
      endDate ?? undefined
    )
  }, [debouncedQuery, startDate, endDate])

  // Render item transaksi
  const renderItem = ({ item }: { item: (typeof transactions)[0] }) => (
    <Pressable
      onPress={() => router.push(`/transactions/${item.invCode}`)}
      className="mb-4"
    >
      <Card
        size="sm"
        variant="outline"
        className="grid grid-cols-1 md:grid-cols-[1fr_auto] rounded-lg"
      >
        <View>
          <Text className="text-xl font-semibold">{item.invCode}</Text>
          <Text className="text-lg text-typography-700">
            {item.customerName}
          </Text>
        </View>
        <View className="flex items-end justify-end">
          <Text className="text-xl font-semibold">
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="text-lg text-typography-700">
            {new Date(item.createdAt).toLocaleTimeString("id-ID", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Card>
    </Pressable>
  )

  // Key extractor untuk FlatList
  const keyExtractor = (item: (typeof transactions)[0]) => item.id

  // Reset semua filter dan data
  const resetFilter = () => {
    setStartDate(null)
    setEndDate(null)
    setSearchQuery("")
    resetTransactions()
    fetchTransactions(1)
  }

  // Handle tombol prev page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchTransactions(
        currentPage - 1,
        debouncedQuery,
        startDate ?? undefined,
        endDate ?? undefined
      )
    }
  }

  // Handle tombol next page
  const handleNextPage = () => {
    if (hasMore) {
      fetchTransactions(
        currentPage + 1,
        debouncedQuery,
        startDate ?? undefined,
        endDate ?? undefined
      )
    }
  }

  return (
    <View className="flex-1 bg-white px-5">
      <Text className="text-2xl font-bold mx-auto text-center mb-4 mt-2">
        Riwayat Penjualan
      </Text>

      {/* Tampilkan spinner jika loading dan belum ada data */}
      {loading && transactions.length === 0 ? (
        <View className="flex flex-row gap-1 items-center justify-center">
          <Spinner />
          <Text>Mendapatkan Data Invoice</Text>
        </View>
      ) : (
        <>
          {/* Modal pilih tanggal */}
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
                  onChange={({
                    startDate,
                    endDate,
                  }: {
                    startDate: any
                    endDate: any
                  }) => {
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
                  {/* Tombol reset filter */}
                  <Button
                    className="rounded-lg"
                    variant="outline"
                    size="lg"
                    onPress={() => {
                      resetFilter()
                      setShowDateModal(false)
                      setTempStartDate(null)
                      setTempEndDate(null)
                    }}
                  >
                    <ButtonText>Reset Filter</ButtonText>
                  </Button>
                  {/* Tombol pilih tanggal */}
                  <Button
                    className="rounded-lg"
                    size="lg"
                    onPress={() => {
                      setStartDate(tempStartDate)
                      setEndDate(tempEndDate)
                      setShowDateModal(false)
                    }}
                  >
                    <ButtonText>Pilih Tanggal</ButtonText>
                  </Button>
                </View>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Bar pencarian dan tombol buka modal tanggal */}
          <View className="flex flex-row items-center justify-between gap-3 mb-4">
            <Input className="flex-1 flex-row gap-1 rounded-lg" size="xl">
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

          {/* Daftar transaksi */}
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListFooterComponent={
              <PaginationFooter
                currentPage={currentPage}
                hasMore={hasMore}
                loading={loading}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}
    </View>
  )
}
