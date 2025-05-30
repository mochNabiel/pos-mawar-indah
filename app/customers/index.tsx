import React, { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { Customer } from "@/types/customer"

import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import LoadingMessage from "@/components/LoadingMessage"
import { Center } from "@/components/ui/center"
import GradientCard from "@/components/GradientCard"
import { Feather } from "@expo/vector-icons"
import { SearchIcon } from "@/components/ui/icon"
import useBackHandler from "@/lib/hooks/useBackHandler"

const CustomerListScreen = () => {
  const router = useRouter()

  useBackHandler("(tabs)/data")

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 700)

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
      onPress={() => router.push(`/customers/${item.name}`)}
      className="mb-3"
    >
      <Card size="lg" variant="outline">
        <Heading size="lg">{item.name}</Heading>
        <Text>{item.phone}</Text>
      </Card>
    </Pressable>
  )

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <LoadingMessage message="Memuat Data Customer..." />
      ) : (
        <View className="gap-3">
          <Center className="flex-row items-center gap-2">
            <GradientCard>
              <Feather name="users" size={24} color="white" />
            </GradientCard>
            <View>
              <Heading size="2xl">Data Customer</Heading>
              <Text>Kelola nama dan kontak pelanggan</Text>
            </View>
          </Center>
          <Input size="lg" className="rounded-lg">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField
              placeholder="Cari nama customer..."
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
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
    </View>
  )
}

export default CustomerListScreen
