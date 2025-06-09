import React, { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { Customer } from "@/types/customer"

import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import LoadingMessage from "@/components/LoadingMessage"
import { Center } from "@/components/ui/center"
import GradientCard from "@/components/GradientCard"
import { Feather } from "@expo/vector-icons"
import { SearchIcon } from "@/components/ui/icon"
import useBackHandler from "@/lib/hooks/useBackHandler"

import CustomerItem from "@/components/customers/CustomerItem"
import CustomerDetailModal from "@/components/customers/CustomerDetailModal"
import CustomerEditModal from "@/components/customers/CustomerEditModal"
import CustomerDeleteModal from "@/components/customers/CustomerDeleteModal"

import { deleteCustomerInDb } from "@/lib/firestore/customer"

const CustomerListScreen = () => {
  const router = useRouter()

  useBackHandler("(tabs)/data")

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 700)

  const { customers, isLoading, fetchAllCustomers } = useCustomerStore()
  const [filtered, setFiltered] = useState<Customer[]>([])

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setSelectedCustomer(null)
    setIsDetailOpen(false)
  }

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setSelectedCustomer(null)
    setIsEditOpen(false)
  }

  const openDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setSelectedCustomer(null)
    setIsDeleteOpen(false)
  }

  const closeAllModals = () => {
    setSelectedCustomer(null)
    setIsDetailOpen(false)
    setIsEditOpen(false)
    setIsDeleteOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    try {
      setIsDeleting(true)
      await deleteCustomerInDb(selectedCustomer.name)
      setIsDeleting(false)
      closeAllModals()
      fetchAllCustomers()
    } catch (error) {
      setIsDeleting(false)
      console.error("Gagal menghapus customer", error)
    }
  }

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerItem
      customer={item}
      onPress={() => openDetail(item)}
      onEdit={() => openEdit(item)}
      onDelete={() => openDelete(item)}
    />
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
          <Pressable onPress={() => router.push("/customers/new")} className="mb-3">
            <GradientCard>
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="plus" size={16} color="white" />
                <Text className="text-white font-semibold">Tambah Data Customer</Text>
              </View>
            </GradientCard>
          </Pressable>
          <Input size="lg" className="rounded-lg">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField
              placeholder="Cari nama customer..."
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>

          {filtered.length > 0 ? (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.name}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={true}
            />
          ) : (
            <Center>
              {debouncedSearch ? (
                <Text>Customer dengan nama "{debouncedSearch}" tidak ditemukan</Text>
              ) : (
                <Text>Data Customer Kosong</Text>
              )}
            </Center>
          )}

          {/* Modals */}
          <CustomerDetailModal
            customer={selectedCustomer}
            isOpen={isDetailOpen}
            onClose={closeDetail}
          />
          <CustomerEditModal
            customer={selectedCustomer}
            isOpen={isEditOpen}
            onClose={closeEdit}
          />
          <CustomerDeleteModal
            isOpen={isDeleteOpen}
            onClose={closeDelete}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </View>
      )}
    </View>
  )
}

export default CustomerListScreen
