import React, { useEffect, useState } from "react"
import { FlatList, View, Pressable } from "react-native"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import MonthPicker from "@/components/MonthPicker"
import { Center } from "@/components/ui/center"
import LoadingMessage from "@/components/LoadingMessage"
import getMonthName from "@/lib/helper/getMonthName"
import { Feather } from "@expo/vector-icons"
import GradientCard from "@/components/GradientCard"
import { useRouter } from "expo-router"

export default function FabricRecap() {
  const router = useRouter()
  const {
    loading,
    getFabricsRecap,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useDashboardStore()
  const [fabricsData, setFabricsData] = useState<any[]>([])

  useEffect(() => {
    fetchFabricsRecap()
  }, [selectedMonth, selectedYear])

  const fetchFabricsRecap = () => {
    const data = getFabricsRecap(selectedMonth, selectedYear)
    setFabricsData(data || [])
  }

  const handleApply = (month: string | null, year: string | null) => {
    if (month) setSelectedMonth(month) // Update global store
    if (year) setSelectedYear(year) // Update global store
  }

  if (loading) {
    return <LoadingMessage message="Memuat Data Kain..." />
  }

  return (
    <View className="p-5 bg-white flex-1">
      <View>
        <Heading size="2xl" className="text-self-purple mb-3">
          Rekap Kain {getMonthName(selectedMonth)} {selectedYear}
        </Heading>
        <Pressable
          onPress={() => router.push("/fabric-recap/forecast-fabric")}
          className="mb-3"
        >
          <GradientCard>
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-white font-semibold">
                Prediksi Data Penjualan Kain
              </Text>
            </View>
          </GradientCard>
        </Pressable>
      </View>
      <MonthPicker
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onApply={handleApply}
      />

      {/* List Penjualan Kain */}
      {fabricsData.length === 0 ? (
        <Center>
          <Text className="text-center text-self-purple mt-5">
            Tidak ada data kain untuk bulan ini.
          </Text>
        </Center>
      ) : (
        <FlatList
          data={fabricsData}
          keyExtractor={(item) => item.fabricName}
          renderItem={({ item }) => (
            <Card size="md" variant="outline" className="rounded-lg mb-3">
              <View className="gap-1">
                <Heading size="lg">{item.fabricName}</Heading>
                <View className="flex-row items-center gap-2">
                  <Feather name="package" size={20} color="#BF40BF" />
                  <Text className="text-self-purple text-lg font-semibold">
                    {item.totalWeight.toFixed(2)} kg
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  )
}
