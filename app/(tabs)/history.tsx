import { Pressable, ScrollView, Text, View } from "react-native"
import React, { useState, useEffect, useMemo } from "react"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"

import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import dayjs from "dayjs"
import "dayjs/locale/id"

import { getAllTransactions } from "@/lib/firestore/transaction"
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

dayjs.locale("id") // Set locale tanggal ke bahasa Indonesia

export default function History() {
  const router = useRouter()

  const defaultClassNames = useDefaultClassNames()

  const [allInvoices, setAllInvoices] = useState<DocumentData[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<DocumentData[]>([])

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Menerapkan debounce pada pencarian
  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedQuery = useDebouncedValue(searchQuery, 1000)

  // Fetch semua data pertama kali halaman dimuat
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      try {
        const data = await getAllTransactions()
        console.log(data)
        setAllInvoices(data)
        setFilteredInvoices(data)
      } catch (error) {
        console.error("Error fetching invoices:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  // Update filteredInvoices saat query berubah
  useEffect(() => {
    applyFilters()
  }, [debouncedQuery, startDate, endDate])

  const applyFilters = () => {
    let data = [...allInvoices]

    // Filter by query
    if (debouncedQuery) {
      data = data.filter((invoice) =>
        invoice.customerName
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      )
    }

    // Filter by date
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

    // Urutkan berdasarkan tanggal terbaru
    data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setFilteredInvoices(data)
  }

  // Function untuk mereset filter tanggal
  const resetFilter = () => {
    setStartDate(null)
    setEndDate(null)
    setSearchQuery("")
    setFilteredInvoices(allInvoices)
  }

  // Function untuk menghitung selisih tanggal
  const getDateDifference = (invoiceDate: string) => {
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

  // Function untuk mengelompokkan invoice berdasarkan tanggal
  const groupedInvoices = useMemo(() => {
    return filteredInvoices.reduce((acc, invoice) => {
      const group = getDateDifference(invoice.createdAt)
      if (!acc[group]) acc[group] = []
      acc[group].push(invoice)
      return acc
    }, {} as Record<string, DocumentData[]>)
  }, [filteredInvoices])

  const allGroups = ["Hari Ini", "Kemarin", "Minggu Lalu", "Lebih Lama"]

  return (
    <ScrollView className="flex-1 px-5 bg-white">
      <Text className="text-2xl font-bold mx-auto text-center mb-4 mt-2">
        Riwayat Penjualan
      </Text>
      {loading ? (
        <View className="flex flex-row gap-1 items-center justify-center">
          <Spinner />
          <Text>Mendapatkan Data Invoice</Text>
        </View>
      ) : (
        <>
          {/* Modal Menampilkan Tanggal */}
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

          {/* Input Pencarian */}
          <Input className="mb-4 rounded-lg" size="lg">
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari invoice berdasarkan nama customer..."
            />
          </Input>

          {/* Button Reset dan Pilih Tanggal */}
          <View className="flex flex-row items-center justify-between gap-4 mb-4">
            <Button
              onPress={resetFilter}
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

          {/* Menampilkan Invoice */}
          <View className="mb-20">
            {allGroups.map((group) => (
              <View key={group} className="mb-4">
                <Text className="text-xl font-semibold mb-2">{group}</Text>
                {groupedInvoices[group]?.length > 0 ? (
                  groupedInvoices[group].map((invoice: DocumentData) => (
                    <Pressable
                      key={invoice.id}
                      onPress={() =>
                        router.push(`/transactions/${invoice.invCode}`)
                      }
                      className="mb-4"
                    >
                      <Card
                        size="sm"
                        variant="outline"
                        className="flex rounded-lg flex-row items-center justify-between"
                      >
                        <View>
                          <Text className="text-xl font-semibold mb-1">
                            {invoice.customerName}
                          </Text>
                          <Text>Faktur {invoice.invCode}</Text>
                          <View className="flex flex-row gap-2">
                            <Text className="text-sm">
                              {dayjs(invoice.createdAt).format("DD MMMM YYYY")}
                            </Text>
                            <Text className="text-sm">
                              {new Date(invoice.createdAt)
                                .toLocaleTimeString("id-ID")
                                .replace(/\./g, ":")}
                            </Text>
                          </View>
                        </View>
                        <Feather name="chevron-right" size={24} />
                      </Card>
                    </Pressable>
                  ))
                ) : (
                  <Text className="text-sm text-gray-500">
                    Tidak ada invoice
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}
