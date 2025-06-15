import React, { useEffect, useState } from "react"
import { Dimensions, ScrollView, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"
import SalesRecapContent from "@/components/SalesRecapContent"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import LoadingMessage from "@/components/LoadingMessage"
import MonthPicker from "@/components/MonthPicker"
import { Button, ButtonText } from "@/components/ui/button"
import { Center } from "@/components/ui/center"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { useRouter } from "expo-router"
import getMonthName from "@/lib/helper/getMonthName"

export default function Dashboard() {
  const { user } = useCurrentUser()
  const router = useRouter()
const {
    loading,
    fetchTransactions,
    getSalesRecap,
    getMonthlySalesChartData,
    getFabricsRecap,
    getCustomersRecap,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useDashboardStore();

  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleApply = (month: string | null, year: string | null) => {
    if (month) setSelectedMonth(month)
    if (year) setSelectedYear(year)
    setShowModal(false) // Tutup modal setelah menerapkan pilihan
  }

  const salesRecapData: TabItem[] = [
    {
      key: "daily",
      title: "Harian",
      content: (
        <SalesRecapContent
          data={getSalesRecap("daily", selectedMonth, selectedYear)}
        />
      ),
    },
    {
      key: "weekly",
      title: "Mingguan",
      content: (
        <SalesRecapContent
          data={getSalesRecap("weekly", selectedMonth, selectedYear)}
        />
      ),
    },
    {
      key: "monthly",
      title: "Bulanan",
      content: (
        <SalesRecapContent
          data={getSalesRecap("monthly", selectedMonth, selectedYear)}
        />
      ),
    },
  ]

  const screenWidth = Dimensions.get("window").width
  const chartWidth = screenWidth - 80

  const monthlySales = getMonthlySalesChartData(selectedYear)
  const topFabrics = getFabricsRecap(selectedMonth, selectedYear)
  const { byWeight, byTransaction } = getCustomersRecap(
    selectedMonth,
    selectedYear
  )

  if (loading) {
    return <LoadingMessage message="Memuat Data Dashboard..." />
  }

  return (
    <ScrollView className="p-5 bg-white flex-1">
      <View className="mb-6">
        <Heading size="2xl" className="mb-1 text-self-purple">
          Selamat datang, {user?.name ?? "Admin"}!
        </Heading>
        <View className="flex-row items-center gap-2">
          <Feather name="calendar" size={20} color="gray" />
          <Text className="text-lg font-medium">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      <Button
        variant="outline"
        className="rounded-lg mb-4"
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
          <ModalFooter className="flex gap-3 items-center">
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

      {/* Rekap Penjualan */}
      <View>
        <Heading className="text-2xl mb-2">
          Rekap Penjualan {getMonthName(selectedMonth)} {selectedYear}
        </Heading>
        <SegmentedTabs
          tabs={salesRecapData}
          activeTabColor="bg-self-purple"
          defaultTabKey="monthly"
        />
      </View>

      {/* Grafik Penjualan Kain Bulanan */}
      <Card variant="outline" size="lg" className="mb-6">
        <View className="flex-row items-center gap-3">
          <Feather name="trending-up" size={20} color="#BF40BF" />
          <Heading className="text-2xl">
            Penjualan Kain Tahun {selectedYear}
          </Heading>
        </View>
        {monthlySales.length === 0 ? (
          <Text className="text-center py-8">Tidak Ada Data</Text>
        ) : (
          <LineChart
            data={{
              labels: monthlySales.map((m) => m.month),
              datasets: [
                {
                  data: monthlySales.map((m) => m.totalWeight),
                  color: (opacity = 1) => `rgba(191, 64, 191, ${opacity})`,
                },
              ],
            }}
            width={chartWidth || 200}
            height={200}
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(191, 64, 191, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
          />
        )}
      </Card>

      {/* Top 5 Customers */}
      <Card variant="outline" size="lg" className="mb-6">
        <View className="flex-row gap-3 items-center mb-1">
          <Feather name="user" size={20} color="#BF40BF" />
          <Heading className="text-2xl">
            5 Customer Teratas {getMonthName(selectedMonth)} {selectedYear}
          </Heading>
        </View>
        <Text className="text-secondary-900 mb-4">
          Berdasarkan berat kain terjual dan total transaksi
        </Text>
        {byTransaction.length == 0 ? (
          <Center>
            <Text className="text-center text-self-purple mt-5">
              Belum ada transaksi terjadi pada bulan ini. Coba tambahkan
              transaksi baru.{" "}
            </Text>
          </Center>
        ) : (
          <SegmentedTabs
            defaultTabKey="berat"
            activeTabColor="bg-self-purple"
            tabs={[
              {
                key: "berat",
                title: "Berat Kain",
                content: (
                  <View className="gap-3 mt-2">
                    {byWeight.slice(0, 5).map((customer, index) => (
                      <Card
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex-row justify-between items-center rounded-lg"
                      >
                        <Text className="font-medium text-base">
                          {customer.name}
                        </Text>
                        <Text className="text-right font-semibold text-lg">
                          {parseFloat(customer.totalWeight.toFixed(2))} kg
                        </Text>
                      </Card>
                    ))}
                  </View>
                ),
              },
              {
                key: "transaksi",
                title: "Total Transaksi",
                content: (
                  <View className="gap-3 mt-2">
                    {byTransaction.slice(0, 5).map((customer, index) => (
                      <Card
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex-row justify-between items-center rounded-lg"
                      >
                        <Text className="font-medium text-base">
                          {customer.name}
                        </Text>
                        <Text className="text-right font-semibold text-lg">
                          Rp {customer.totalTransaction.toLocaleString("id-ID")}
                        </Text>
                      </Card>
                    ))}
                  </View>
                ),
              },
            ]}
          />
        )}
        {user?.role == "superadmin" && (
          <Button
            variant="link"
            onPress={() => {
              router.push("/(protected)/customer-recap" as any)
            }}
          >
            <ButtonText>Lihat Selengkapnya</ButtonText>
          </Button>
        )}
      </Card>

      {/* Top 5 Kain */}
      <Card variant="outline" size="lg" className="mb-20">
        <View className="flex-row gap-3 items-center mb-1">
          <Feather name="calendar" size={20} color="#BF40BF" />
          <Heading className="text-2xl">
            5 Kain Terlaris {getMonthName(selectedMonth)} {selectedYear}
          </Heading>
        </View>
        <Text className="text-secondary-900 mb-4">
          Berdasarkan kuantitas terjual bulanan
        </Text>
        {topFabrics.length == 0 ? (
          <Center>
            <Text className="text-center text-self-purple mt-5">
              Belum ada transaksi terjadi pada bulan ini. Coba tambahkan
              transaksi baru.{" "}
            </Text>
          </Center>
        ) : (
          <View className="gap-3">
            {topFabrics.slice(0, 5).map((fabric, index) => (
              <Card
                key={index}
                variant="outline"
                size="sm"
                className="flex-row justify-between items-center rounded-lg"
              >
                <Text className="font-medium text-base">
                  {fabric.fabricName}
                </Text>
                <Text className="text-right font-semibold text-lg">
                  {fabric.totalWeight.toFixed(2)} kg
                </Text>
              </Card>
            ))}
          </View>
        )}
        {user?.role == "superadmin" && (
          <Button
            variant="link"
            className="mt-3"
            onPress={() => {
              router.push("/(protected)/fabric-recap" as any)
            }}
          >
            <ButtonText>Lihat Selengkapnya</ButtonText>
          </Button>
        )}
      </Card>
    </ScrollView>
  )
}
