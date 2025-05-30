import React, { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Fabric } from "@/types/fabric"

import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import { Spinner } from "@/components/ui/spinner"
import LoadingMessage from "@/components/LoadingMessage"
import { Center } from "@/components/ui/center"
import GradientCard from "@/components/GradientCard"
import { Feather } from "@expo/vector-icons"
import { SearchIcon } from "@/components/ui/icon"

const FabricListScreen = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 700)

  const { fabrics, isLoading, fetchAllFabrics } = useFabricStore()
  const [filtered, setFiltered] = useState<Fabric[]>([])

  useEffect(() => {
    fetchAllFabrics()
  }, [])

  useEffect(() => {
    if (debouncedSearch) {
      const result = fabrics.filter((f) =>
        f.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      setFiltered(result)
    } else {
      setFiltered(fabrics)
    }
  }, [debouncedSearch, fabrics])

  const renderItem = ({ item }: { item: Fabric }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/fabrics/[code]",
          params: { code: item.code },
        })
      }
      className="mb-3"
    >
      <Card size="lg" variant="outline">
        <Heading size="lg">{item.name}</Heading>
        <Text>Kode: {item.code}</Text>
        <Text>Warna: {item.color}</Text>
      </Card>
    </Pressable>
  )

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <LoadingMessage message="Memuat Data Kain..." />
      ) : (
        <View className="gap-3">
          <Center className="flex-row items-center gap-2">
            <GradientCard>
              <Feather name="layers" size={24} color="white" />
            </GradientCard>
            <View>
              <Heading size="2xl">Data Kain</Heading>
              <Text>Kelola informasi dan detail kain</Text>
            </View>
          </Center>

          <Input size="lg" className="rounded-lg">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField
              placeholder="Cari nama kain..."
              value={search}
              onChangeText={(text) => setSearch(text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
    </View>
  )
}

export default FabricListScreen
