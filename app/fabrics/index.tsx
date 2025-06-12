import React, { useEffect, useState } from "react"
import { View, FlatList } from "react-native"
import { useRouter } from "expo-router"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Fabric } from "@/types/fabric"

import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Pressable } from "@/components/ui/pressable"
import { Center } from "@/components/ui/center"
import { SearchIcon } from "@/components/ui/icon"

import GradientCard from "@/components/GradientCard"
import LoadingMessage from "@/components/LoadingMessage"

import useBackHandler from "@/lib/hooks/useBackHandler"
import { Feather } from "@expo/vector-icons"

import FabricItem from "@/components/fabrics/FabricItem"
import FabricDetailModal from "@/components/fabrics/FabricDetailModal"
import FabricEditModal from "@/components/fabrics/FabricEditModal"
import FabricDeleteModal from "@/components/fabrics/FabricDeleteModal"

import { deleteFabricInDb } from "@/lib/firestore/fabric"

const FabricListScreen = () => {
  const router = useRouter()

  useBackHandler("(tabs)/data")

  const [search, setSearch] = useState<string>("")
  const debouncedSearch = useDebouncedValue(search, 700)

  const { fabrics, isLoading, fetchAllFabrics } = useFabricStore()
  const [filtered, setFiltered] = useState<Fabric[]>([])

  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(
    null
  )
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  useEffect(() => {
    fetchAllFabrics()
  }, [])

  useEffect(() => {
    if (debouncedSearch) {
      const result = fabrics.filter((c) =>
        c.code.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      setFiltered(result)
    } else {
      setFiltered(fabrics)
    }
  }, [debouncedSearch, fabrics])

  const openDetail = (fabric: Fabric) => {
    setSelectedFabric(fabric)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setSelectedFabric(null)
    setIsDetailOpen(false)
  }

  const openEdit = (fabric: Fabric) => {
    setSelectedFabric(fabric)
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setSelectedFabric(null)
    setIsEditOpen(false)
  }

  const openDelete = (fabric: Fabric) => {
    setSelectedFabric(fabric)
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setSelectedFabric(null)
    setIsDeleteOpen(false)
  }

  const closeAllModals = () => {
    setSelectedFabric(null)
    setIsDetailOpen(false)
    setIsEditOpen(false)
    setIsDeleteOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedFabric) return
    try {
      setIsDeleting(true)
      await deleteFabricInDb(selectedFabric.code)
      setIsDeleting(false)
      closeAllModals()
      fetchAllFabrics()
    } catch (error) {
      setIsDeleting(false)
      console.error("Gagal menghapus kain", error)
    }
  }

  const renderItem = ({ item }: { item: Fabric }) => (
    <FabricItem
      fabric={item}
      onPress={() => openDetail(item)}
      onEdit={() => openEdit(item)}
      onDelete={() => openDelete(item)}
    />
  )

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <LoadingMessage message="Memuat Data Kain..." />
      ) : (
        <>
          <View className="gap-3 mb-3">
            <Center className="flex-row items-center gap-2">
              <GradientCard>
                <Feather name="layers" size={24} color="white" />
              </GradientCard>
              <View>
                <Heading size="2xl">Data Kain</Heading>
                <Text>Kelola informasi dan detail kain</Text>
              </View>
            </Center>
            <Pressable
              onPress={() => router.push("/fabrics/new")}
              className="mb-3"
            >
              <GradientCard>
                <View className="flex-row items-center justify-center gap-2">
                  <Feather name="plus" size={16} color="white" />
                  <Text className="text-white font-semibold">
                    Tambah Data Kain
                  </Text>
                </View>
              </GradientCard>
            </Pressable>
            <Input size="lg" className="rounded-lg">
              <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} />
              </InputSlot>
              <InputField
                placeholder="Cari nama kain..."
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
          </View>

          {filtered.length > 0 ? (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.name}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingBottom: 40,
                flexGrow: 1,
              }}
            />
          ) : (
            <Center>
              {debouncedSearch ? (
                <Text>
                  Kain dengan nama "{debouncedSearch}" tidak ditemukan
                </Text>
              ) : (
                <Text>Data Kain Kosong</Text>
              )}
            </Center>
          )}

          {/* Modals */}
          <FabricDetailModal
            fabric={selectedFabric}
            isOpen={isDetailOpen}
            onClose={closeDetail}
          />
          <FabricEditModal
            fabric={selectedFabric}
            isOpen={isEditOpen}
            onClose={closeEdit}
          />
          <FabricDeleteModal
            isOpen={isDeleteOpen}
            onClose={closeDelete}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </>
      )}
    </View>
  )
}

export default FabricListScreen
