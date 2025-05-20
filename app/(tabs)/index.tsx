import React, { useEffect } from "react"
import { Dimensions, ScrollView, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"
import { useSalesRecapStore } from "@/lib/zustand/useSalesRecapStore"

import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import SegmentedTabs, { TabItem } from "@/components/SegmentedTabs"
import { Spinner } from "@/components/ui/spinner"
import { useTopCustomersStore } from "@/lib/zustand/useTopCustomersStore"

const fabricReportMonthly = [
  { month: "Jan", weightTotal: 1432 },
  { month: "Feb", weightTotal: 2034 },
  { month: "Mar", weightTotal: 1922 },
  { month: "Apr", weightTotal: 845 },
  { month: "May", weightTotal: 500 },
]

const topCustomers = {
  byWeight: [
    { name: "Budi Santoso", value: 210.5 },
    { name: "Siti Aminah", value: 198.2 },
    { name: "Agus Salim", value: 175.8 },
    { name: "Maria Yosephine", value: 160.4 },
    { name: "Rudi Hartono", value: 150.0 },
  ],
  byTransaction: [
    { name: "Budi Santoso", value: 35300000 },
    { name: "Siti Aminah", value: 21500000 },
    { name: "Rudi Hartono", value: 12730000 },
    { name: "Agus Salim", value: 8920000 },
    { name: "Maria Yosephine", value: 6390000 },
  ],
}

const topFabrics = [
  { name: "Katun Hitam", value: 540.0 },
  { name: "Sutra Merah", value: 489.5 },
  { name: "Denim Biru", value: 455.2 },
  { name: "Linen Putih", value: 410.7 },
  { name: "Wol Abu", value: 398.4 },
]

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

  useEffect(() => {
    fetchSalesRecap()
    fetchTopCustomers()
  }, [])

  const salesRecapData: TabItem[] = [
    {
      key: "daily",
      title: "Hari ini",
      content: (
        <SalesRecapContent
          data={daily}
          isLoadingSalesRecap={loadingSalesRecap}
        />
      ),
    },
    {
      key: "weekly",
      title: "7 Hari Terakhir",
      content: (
        <SalesRecapContent
          data={weekly}
          isLoadingSalesRecap={loadingSalesRecap}
        />
      ),
    },
    {
      key: "monthly",
      title: "Bulan ini",
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
      <Heading className="text-2xl mb-2">Rekap Penjualan</Heading>
      <SegmentedTabs tabs={salesRecapData} defaultTabKey="monthly" />

      {/* Grafik Penjualan Kain Bulanan */}
      <Card variant="outline" size="lg" className="mb-6">
        <Heading className="text-2xl mb-4">Penjualan Kain Bulanan</Heading>
        <LineChart
          data={{
            labels: fabricReportMonthly.map((item) => item.month),
            datasets: [
              {
                data: fabricReportMonthly.map((item) => item.weightTotal),
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
            style: {
              borderRadius: 16,
            },
          }}
          bezier
        />
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
        <FabricTopList data={topFabrics} />
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
    <View className="flex gap-3 mb-6">
      <Card
        variant="outline"
        size="lg"
        className="flex-row justify-between items-start"
      >
        <View>
          <Text className="text-self-cyan text-xl font-semibold mb-3">
            Jumlah Transaksi
          </Text>
          <Heading size="3xl" className="text-self-cyan">
            {data.transactions}
          </Heading>
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
          <Heading size="3xl" className="text-self-orange">
            {data.totalFabricSold}
          </Heading>
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
          <Heading size="3xl" className="text-self-army">
            {data.totalRevenue.toLocaleString("id-ID")}
          </Heading>
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

// Komponen Daftar Kain Terlaris
const FabricTopList = ({
  data,
}: {
  data: { name: string; value: number }[]
}) => {
  return (
    <View className="gap-3">
      {data.map((fabric, index) => (
        <Card
          key={index}
          variant="outline"
          className="flex-row justify-between items-center px-4 py-3"
        >
          <Text className="font-medium text-base">{fabric.name}</Text>
          <Text className="text-right font-semibold text-lg">
            {fabric.value} kg
          </Text>
        </Card>
      ))}
    </View>
  )
}
