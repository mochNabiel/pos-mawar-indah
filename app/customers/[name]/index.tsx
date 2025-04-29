import { View, Text } from "react-native"
import React, { useEffect } from "react"
import { useLocalSearchParams } from "expo-router"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Button, ButtonText } from "@/components/ui/button"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const FabricDetailPage = () => {
  const router = useRouter()
  const { kode } = useLocalSearchParams()
  const { fabrics, fetchAllFabrics } = useFabricStore()
  const fabric = fabrics.find((item) => item.kode === kode)

  useEffect(() => {
    if (fabrics.length === 0) {
      fetchAllFabrics()
    }
  }, [])

  if (!fabric) return <Text>Data kain tidak ditemukan</Text>

  return (
    <View className="flex-1 bg-white p-5">
      <View className="mb-5">
        <Text className="text-lg font-bold">Kode Kain</Text>
        <Text className="text-lg">{fabric.kode}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Nama Kain</Text>
        <Text className="text-lg">{fabric.nama}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Harga Ecer</Text>
        <Text className="text-lg">{fabric.hargaEcer}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Harga Grosir</Text>
        <Text className="text-lg">{fabric.hargaGrosir}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Harga Roll</Text>
        <Text className="text-lg">{fabric.hargaRoll}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Warna</Text>
        <Text className="text-lg">{fabric.warna}</Text>
      </View>
      <View className="flex flex-row justify-between items-center gap-5 mt-5">
        <Button
          onPress={() => {}}
          variant="solid"
          action="negative"
          size="xl"
          className="flex-1 rounded-full"
        >
          <Feather name="trash" size={24} color="white" />
          <ButtonText>Hapus Kain</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push(`/fabrics/${kode}/edit`)
          }}
          variant="solid"
          action="info"
          size="xl"
          className="flex-1 rounded-full"
        >
          <Feather name="edit" size={24} color="white" />
          <ButtonText>Edit Kain</ButtonText>
        </Button>
      </View>
    </View>
  )
}

export default FabricDetailPage
