import { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Fabric } from "@/types/fabric"

import { Input, InputField } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import { Spinner } from "@/components/ui/spinner"

const FabricListScreen = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)

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
      <Card size="lg" variant="outline" className="shadow-md bg-white">
        <Heading size="lg">{item.name}</Heading>
        <Text>Kode: {item.code}</Text>
        <Text>Warna: {item.color}</Text>
      </Card>
    </Pressable>
  )

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <View className="flex flex-row gap-5 justify-center items-center">
          <Spinner />
          <Text size="lg">Mendapatkan data kain...</Text>
        </View>
      ) : (
        <>
          <Input className="rounded-xl mb-5">
            <InputField
              placeholder="Cari kain berdasarkan nama"
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
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  )
}

export default FabricListScreen
