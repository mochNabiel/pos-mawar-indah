import { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { Customer } from "@/types/customer"

import { Input, InputField } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import { Spinner } from "@/components/ui/spinner"

const CustomerListScreen = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)

  const { customers, isLoading, fetchAllCustomers } = useCustomerStore()
  const [filtered, setFiltered] = useState<Customer[]>([])

  useEffect(() => {
    fetchAllCustomers()
  }, [])

  useEffect(() => {
    if (debouncedSearch) {
      const result = customers.filter((c) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      setFiltered(result)
    } else {
      setFiltered(customers)
    }
  }, [debouncedSearch, customers])

  const renderItem = ({ item }: { item: Customer }) => (
    <Pressable
      onPress={() =>
        router.push(`/customers/${item.name}`)
      }
      className="mb-3"
    >
      <Card size="lg" variant="outline" className="shadow-md bg-white">
        <Heading size="lg">{item.name}</Heading>
        <Text>{item.phone}</Text>
      </Card>
    </Pressable>
  )

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <View className="flex flex-row gap-5 justify-center items-center">
          <Spinner />
          <Text size="lg">Mendapatkan data customer...</Text>
        </View>
      ) : (
        <>
          <Input className="rounded-xl mb-5">
            <InputField
              placeholder="Cari customer berdasarkan nama"
              value={search}
              onChangeText={(text) => setSearch(text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  )
}

export default CustomerListScreen
