import React, { useEffect, useState } from "react"
import { FlatList, ScrollView, View } from "react-native"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import MonthPicker from "@/components/MonthPicker"
import { Button, ButtonText } from "@/components/ui/button"
import LoadingMessage from "@/components/LoadingMessage"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import getMonthName from "@/lib/helper/getMonthName"
import { Feather } from "@expo/vector-icons"
import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"

export default function CustomerRecap() {
  const { loading, getCustomersRecap } = useDashboardStore()

  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    (new Date().getMonth() + 1).toString()
  )
  const [selectedYear, setSelectedYear] = useState<string | null>(
    new Date().getFullYear().toString()
  )
  const [showModal, setShowModal] = useState<boolean>(false)
  const [customersByWeight, setCustomersByWeight] = useState<any[]>([])
  const [customersByTransaction, setCustomersByTransaction] = useState<any[]>(
    []
  )

  useEffect(() => {
    fetchCustomersRecap()
  }, [selectedMonth, selectedYear])

  const fetchCustomersRecap = () => {
    const { byWeight, byTransaction } = getCustomersRecap(
      selectedMonth,
      selectedYear
    )
    setCustomersByWeight(byWeight || [])
    setCustomersByTransaction(byTransaction || [])
  }

  const handleApply = (month: string | null, year: string | null) => {
    if (month) setSelectedMonth(month)
    if (year) setSelectedYear(year)
    setShowModal(false)
  }

  if (loading) {
    return <LoadingMessage message="Memuat Data Customer..." />
  }

  const customerRecapData: TabItem[] = [
    {
      key: "berat",
      title: "Berat Kain",
      content: (
        <FlatList
          data={customersByWeight}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Card size="md" variant="outline" className="rounded-lg mb-3 mt-2">
              <View className="gap-1">
                <Heading size="lg">{item.name}</Heading>
                <View className="flex-row items-center gap-2">
                  <Feather name="package" size={20} color="#BF40BF" />
                  <Text className="text-self-purple text-lg font-semibold">
                    {parseFloat(item.totalWeight.toFixed(2))} kg
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      ),
    },
    {
      key: "transaksi",
      title: "Total Transaksi",
      content: (
        <FlatList
          data={customersByTransaction}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Card size="md" variant="outline" className="rounded-lg mb-3 mt-2">
              <View className="gap-1">
                <Heading size="lg">{item.name}</Heading>
                <View className="flex-row items-center gap-2">
                  <Feather name="award" size={24} color="#BF40BF" />
                  <Text className="text-self-purple text-lg font-semibold">
                    Rp {item.totalTransaction.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      ),
    },
  ]

  return (
    <ScrollView className="p-5 bg-white flex-1">
      <View className="mb-6">
        <Heading size="2xl" className="text-self-purple mb-3">
          Rekap Customer {getMonthName(selectedMonth)} {selectedYear}
        </Heading>
        <Button
          variant="outline"
          className="rounded-lg"
          onPress={() => setShowModal(true)}
        >
          <ButtonText>Pilih Bulan dan Tahun</ButtonText>
        </Button>

        {/* Modal untuk memilih bulan dan tahun */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
          <ModalBackdrop />
          <ModalContent>
            <ModalBody>
              <MonthPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                onApply={() => handleApply(selectedMonth, selectedYear)}
              />
            </ModalBody>
            <ModalFooter className="flex-row gap-3 items-center">
              <Button
                variant="outline"
                action="secondary"
                className="rounded-lg flex-1"
                onPress={() => setShowModal(false)}
              >
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button
                className="rounded-lg flex-1"
                onPress={() => handleApply(selectedMonth, selectedYear)}
              >
                <ButtonText>Terapkan</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>

      {/* Segmented Tabs for Customer Recap */}
      <SegmentedTabs
        tabs={customerRecapData}
        activeTabColor="bg-self-purple"
        defaultTabKey="berat"
      />
    </ScrollView>
  )
}
