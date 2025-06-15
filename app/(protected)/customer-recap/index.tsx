import React, { useEffect, useState } from "react"
import { FlatList, View } from "react-native"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import MonthPicker from "@/components/MonthPicker"
import LoadingMessage from "@/components/LoadingMessage"
import getMonthName from "@/lib/helper/getMonthName"
import { Feather } from "@expo/vector-icons"
import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"
import { Center } from "@/components/ui/center"

export default function CustomerRecap() {
  const {
    loading,
    getCustomersRecap,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useDashboardStore()

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

  const customerRecapData: TabItem[] = [
    {
      key: "berat",
      title: "Berat Kain",
      content: (
        <FlatList
          data={customersByWeight}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Card size="md" variant="outline" className="rounded-lg mb-2 mt-2">
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
            <Card size="md" variant="outline" className="rounded-lg mb-2 mt-2">
              <View className="gap-1">
                <Heading size="lg">{item.name}</Heading>
                <View className="flex-row items-center gap-2">
                  <Feather name="award" size={20} color="#BF40BF" />
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

  if (loading) {
    return <LoadingMessage message="Memuat Data Customer..." />
  }

  return (
    <View className="p-5 bg-white flex-1">
      <View>
        <Heading size="2xl" className="text-self-purple mb-3">
          Rekap Customer {getMonthName(selectedMonth)} {selectedYear}
        </Heading>
        <MonthPicker
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onApply={(month, year) => {
            if (month) setSelectedMonth(month)
            if (year) setSelectedYear(year)
          }}
        />
      </View>

      {/* Segmented Tabs for Customer Recap */}
      <SegmentedTabs
        tabs={customerRecapData}
        activeTabColor="bg-self-purple"
        defaultTabKey="berat"
      />

      {customersByTransaction.length== 0 && (
        <Center>
          <Text className="text-center text-self-purple mt-5">
            Tidak ada data customer untuk bulan ini.
          </Text>
        </Center>
      )}
    </View>
  )
}
