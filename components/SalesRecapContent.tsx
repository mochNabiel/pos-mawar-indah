import { View } from "react-native"
import { Feather } from "@expo/vector-icons"
import AnimatedNumbers from "react-native-animated-numbers"

import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"

const SalesRecapContent = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <View className="my-6">
        <Text className="text-center">Data tidak tersedia</Text>
      </View>
    )
  }
  return (
    <View className="flex gap-3 mb-2 mt-2">
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

export default SalesRecapContent