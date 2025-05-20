import React, { useEffect } from "react"
import { Dimensions, ScrollView, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import AnimatedNumbers from "react-native-animated-numbers"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"

import { useSalesRecapStore } from "@/lib/zustand/useSalesRecapStore"
import { useTopCustomersStore } from "@/lib/zustand/useTopCustomersStore"
import { useTopFabricStore } from "@/lib/zustand/useTopFabricsStore"
import { useMonthlySalesStore } from "@/lib/zustand/useMonthlySalesStore"

export default function Dashboard() {
  const { user } = useCurrentUser()
  const {
    daily,
    weekly,
    monthly,
    loading: loadingSalesRecap,
    fetchSalesRecap,
  } = useSalesRecapStore()

  const {
    byWeight,
    byTransaction,
    loading: loadingTopCustomers,
    fetchTopCustomers,
  } = useTopCustomersStore()

  const {
    topFabrics,
    loading: loadingTopFabrics,
    fetchTopFabrics,
  } = useTopFabricStore()

  const {
    monthlySales,
    loading: loadingMonthlySales,
    fetchMonthlySales,
  } = useMonthlySalesStore()

  useEffect(() => {
    fetchSalesRecap()
    fetchTopCustomers()
    fetchTopFabrics()
    fetchMonthlySales()
  }, [])

  const salesRecapData: TabItem[] = [
    {
      key: "daily",
      title: "Harian",
      content: (
        <SalesRecapContent
          data={daily}
          isLoadingSalesRecap={loadingSalesRecap}
        />
      ),
    },
    {
      key: "weekly",
      title: "Mingguan",
      content: (
        <SalesRecapContent
          data={weekly}
          isLoadingSalesRecap={loadingSalesRecap}
        />
      ),
    },
    {
      key: "monthly",
      title: "Bulanan",
      content: (
        <SalesRecapContent
          data={monthly}
          isLoadingSalesRecap={loadingSalesRecap}
        />
      ),
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

      {/* Rekap Penjualan */}
      <View>
        <Heading className="text-2xl mb-2">Rekap Penjualan</Heading>
        <SegmentedTabs tabs={salesRecapData} activeTabColor="bg-self-purple" defaultTabKey="monthly" />
      </View>

      {/* Grafik Penjualan Kain Bulanan */}
      <Card variant="outline" size="lg" className="mb-6">
        <Heading className="text-2xl mb-4">Penjualan Kain Bulanan</Heading>
        {loadingMonthlySales ? (
          <View className="items-center py-8">
            <Spinner size="large" color="#bf40bf" />
          </View>
        ) : monthlySales.length === 0 ? (
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
        {loadingTopCustomers ? (
          <View className="items-center py-8">
            <Spinner size="large" color="#bf40bf" />
          </View>
        ) : (
          <SegmentedTabs
            defaultTabKey="berat"
            activeTabColor="bg-self-purple"
            tabs={[
              {
                key: "berat",
                title: "Berat Kain",
                content: (
                  <CustomerTopList
                    data={byWeight.map((c) => ({
                      name: c.name,
                      value: parseFloat(c.totalWeight.toFixed(2)),
                    }))}
                    metric="kg"
                  />
                ),
              },
              {
                key: "transaksi",
                title: "Total Transaksi",
                content: (
                  <CustomerTopList
                    data={byTransaction.map((c) => ({
                      name: c.name,
                      value: c.totalTransaction,
                    }))}
                    metric="rupiah"
                  />
                ),
              },
            ]}
          />
        )}
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
        {loadingTopFabrics ? (
          <View className="items-center py-8">
            <Spinner size="large" color="#bf40bf" />
          </View>
        ) : (
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
        )}
      </Card>
    </ScrollView>
  )
}

// TabContent untuk Rekap Penjualan
const SalesRecapContent = ({
  data,
  isLoadingSalesRecap,
}: {
  data: any
  isLoadingSalesRecap: boolean
}) => {
  if (isLoadingSalesRecap || !data) {
    return (
      <View className="my-6">
        <Spinner size="large" color="#bf40bf" />
      </View>
    )
  }

  return (
    <View className="flex gap-3 mb-2">
      <Card
        variant="outline"
        size="lg"
        className="flex-row justify-between items-start"
      >
        <View>
          <Text className="text-self-cyan text-xl font-semibold mb-3">
            Jumlah Transaksi
          </Text>
          <AnimatedNumbers
            includeComma
            animationDuration={700}
            animateToNumber={data.transactions}
            fontStyle={{ fontSize: 42, fontWeight: "800", color: "#00BFFF" }}
          />
          <Text>transaksi</Text>
        </View>
        <Feather name="shopping-bag" size={24} color="gray" />
      </Card>

      <Card
        variant="outline"
        size="lg"
        className="flex-row justify-between items-start"
      >
        <View>
          <Text className="text-self-orange text-xl font-semibold mb-3">
            Total Kain Terjual (kg)
          </Text>
          <AnimatedNumbers
            includeComma
            animationDuration={700}
            animateToNumber={data.totalFabricSold}
            fontStyle={{ fontSize: 42, fontWeight: "800", color: "#FFA500" }}
            />
          <Text>kilogram</Text>
        </View>
        <Feather name="trending-up" size={24} color="gray" />
      </Card>

      <Card
        variant="outline"
        size="lg"
        className="flex-row justify-between items-start"
      >
        <View>
          <Text className="text-self-army text-xl font-semibold mb-3">
            Total Omset (Rp)
          </Text>
          <AnimatedNumbers
            includeComma
            animationDuration={700}
            animateToNumber={data.totalRevenue}
            fontStyle={{ fontSize: 42, fontWeight: "800", color: "#228B22" }}
          />
          <Text>rupiah</Text>
        </View>
        <Feather name="award" size={24} color="gray" />
      </Card>
    </View>
  )
}

// Komponen Daftar Customer Teratas
const CustomerTopList = ({
  data,
  metric,
}: {
  data: { name: string; value: number }[]
  metric: "kg" | "rupiah"
}) => {
  return (
    <View className="gap-3">
      {data.map((customer, index) => (
        <Card
          key={index}
          variant="outline"
          className="flex-row justify-between items-center px-4 py-3"
        >
          <Text className="font-medium text-base">{customer.name}</Text>
          {metric === "kg" ? (
            <Text className="text-right font-semibold text-lg">
              {customer.value} {metric}
            </Text>
          ) : (
            <Text className="text-right font-semibold text-lg">
              Rp {customer.value.toLocaleString("id-ID")}
            </Text>
          )}
        </Card>
      ))}
    </View>
  )
}
