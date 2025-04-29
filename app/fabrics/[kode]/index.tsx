import { View, Text } from "react-native"
import React, { useState, useEffect } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

import { Button, ButtonText } from "@/components/ui/button"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"

import { Feather } from "@expo/vector-icons"
import { Heading } from "@/components/ui/heading"
import { CloseIcon, Icon } from "@/components/ui/icon"
import useToastMessage from "@/lib/hooks/useToastMessage"

const FabricDetailPage = () => {
  const router = useRouter()
  const { kode } = useLocalSearchParams()
  const { fabrics, fetchAllFabrics, deleteFabric } = useFabricStore()
  const {showToast} = useToastMessage()

  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const kodeParam = Array.isArray(kode) ? kode[0] : kode
  const fabric = fabrics.find((item) => item.kode === kodeParam)

  useEffect(() => {
    if (fabrics.length === 0) {
      fetchAllFabrics()
    }
  }, [])

  if (!fabric) return <Text>Data kain tidak ditemukan</Text>

  const handleDeleteFabric = async () => {
    setIsDeleting(true)
    try {
      await deleteFabric(kodeParam)
      setShowModal(false)
      showToast("Kain berhasil dihapus", "success")
      router.push("/fabrics")
    } catch (error) {
      console.error("Error deleting fabric:", error)
      showToast("Gagal menghapus kain", "error")
      setShowModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

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
          onPress={() => {
            setShowModal(true)
          }}
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
            router.push(`/fabrics/${kodeParam}/edit`)
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

      {/* Modal for delete confirmation */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-950">
              Beneran Hapus Kain Ini?
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text className="text-typography-500">
              Dengan menghapus kain ini, semua data yang terkait dengan kain ini
              akan dihapus secara permanen. Apakah Anda yakin ingin melanjutkan?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              size="xl"
              onPress={() => {
                setShowModal(false)
              }}
              className="flex-1 rounded-full"
            >
              <ButtonText>Kembali</ButtonText>
            </Button>
            <Button
              variant="solid"
              action="negative"
              size="xl"
              onPress={handleDeleteFabric} // Panggil fungsi handleDeleteFabric
              className="flex-1 rounded-full"
              isDisabled={isDeleting} // Nonaktifkan tombol saat sedang menghapus
            >
              <ButtonText>Hapus</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  )
}

export default FabricDetailPage
