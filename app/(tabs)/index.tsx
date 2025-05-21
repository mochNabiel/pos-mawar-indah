import React, { useEffect } from "react"
import { Dimensions, ScrollView, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"
import SalesRecapContent from "@/components/SalesRecapContent"

import { useDashboardStore } from "@/lib/zustand/useDashboardStore"

export default function Dashboard() {
  const { user } = useCurrentUser()

  const {
    daily,
    weekly,
    monthly,
    byWeight,
    byTransaction,
    topFabrics,
    monthlySales,
    loading,
    fetchDashboardData,
  } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const salesRecapData: TabItem[] = [
    {
      key: "daily",
      title: "Harian",
      content: <SalesRecapContent data={daily} />,
    },
    {
      key: "weekly",
      title: "Mingguan",
      content: <SalesRecapContent data={weekly} />,
    },
    {
      key: "monthly",
      title: "Bulanan",
      content: <SalesRecapContent data={monthly} />,
    },
  ]

  const screenWidth = Dimensions.get("window").width
  const chartWidth = screenWidth - 80

  return (
    <ScrollView className="p-5 bg-white flex-1">
      {/* Greeting */}
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

      {/* Loading Spinner */}
      {loading ? (
        <View className="items-center gap-3 py-8">
          <Spinner size="large" color="#bf40bf" />
          <Text className="text-self-purple">Memuat Data Dashboard...</Text>
        </View>
      ) : (
        <>
          {/* Rekap Penjualan */}
          <View>
            <Heading className="text-2xl mb-2">Rekap Penjualan</Heading>
            <SegmentedTabs
              tabs={salesRecapData}
              activeTabColor="bg-self-purple"
              defaultTabKey="monthly"
            />
          </View>

          {/* Grafik Penjualan Kain Bulanan */}
          <Card variant="outline" size="lg" className="mb-6">
            <Heading className="text-2xl mb-4">Penjualan Kain Bulanan</Heading>
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
                bezier
              />
            )}
          </Card>

          {/* Top 5 Customers */}
          <Card variant="outline" size="lg" className="mb-6">
            <View className="flex-row gap-3 items-center mb-1">
              <Feather name="user" size={20} />
              <Heading className="text-2xl">5 Customer Teratas</Heading>
            </View>
            <Text className="text-secondary-900 mb-4">
              Berdasarkan berat kain terjual dan total transaksi
            </Text>
            <SegmentedTabs
              defaultTabKey="berat"
              activeTabColor="bg-self-purple"
              tabs={[
                {
                  key: "berat",
                  title: "Berat Kain",
                  content: (
                    <View className="gap-3">
                      {byWeight.map((customer, index) => (
                        <Card
                          key={index}
                          variant="outline"
                          className="flex-row justify-between items-center px-4 py-3"
                        >
                          <Text className="font-medium text-base">{customer.name}</Text>
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
                    <View className="gap-3">
                      {byTransaction.map((customer, index) => (
                        <Card
                          key={index}
                          variant="outline"
                          className="flex-row justify-between items-center px-4 py-3"
                        >
                          <Text className="font-medium text-base">{customer.name}</Text>
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
          </Card>

          {/* Top 5 Kain */}
          <Card variant="outline" size="lg" className="mb-20">
            <View className="flex-row gap-3 items-center mb-1">
              <Feather name="calendar" size={20} />
              <Heading className="text-2xl">5 Kain Terlaris</Heading>
            </View>
            <Text className="text-secondary-900 mb-4">
              Berdasarkan kuantitas terjual bulanan
            </Text>
            <View className="gap-3">
              {topFabrics.map((fabric, index) => (
                <Card
                  key={index}
                  variant="outline"
                  className="flex-row justify-between items-center px-4 py-3"
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
          </Card>
        </>
      )}
    </ScrollView>
  )
}
