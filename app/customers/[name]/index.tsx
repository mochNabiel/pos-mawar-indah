import React, { useState, useEffect } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"

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

const CustomerDetailScreen = () => {
  const router = useRouter()
  const { name } = useLocalSearchParams()
  const { customers, fetchAllCustomers, deleteCustomer } = useCustomerStore()
  const {showToast} = useToastMessage()

  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const nameParam = Array.isArray(name) ? name[0] : name
  const customer = customers.find((item) => item.name === nameParam)

  useEffect(() => {
    if (customers.length === 0) {
      fetchAllCustomers()
    }
  }, [])

  if (!customer) return <Text>Data customer tidak ditemukan</Text>

  const handleDeleteCustomer = async () => {
    setIsDeleting(true)
    try {
      await deleteCustomer(nameParam)
      setShowModal(false)
      showToast("Data Customer berhasil dihapus", "success")
      router.push("/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      showToast("Gagal menghapus data customer", "error")
      setShowModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <View className="flex-1 bg-white p-5">
      <View className="mb-5">
        <Text className="text-lg font-bold">Nama Customer</Text>
        <Text className="text-lg">{customer.name}</Text>
      </View>
      <View className="mb-5">
        <Text className="text-lg font-bold">Nomor Telepon</Text>
        <Text className="text-lg">{customer.phone}</Text>
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
          <ButtonText>Hapus</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push(`/customers/${nameParam}/edit`)
          }}
          variant="solid"
          action="info"
          size="xl"
          className="flex-1 rounded-full"
        >
          <Feather name="edit" size={24} color="white" />
          <ButtonText>Edit</ButtonText>
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
              Yakin ingin menghapus Data Customer ini?
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
              Dengan menghapus data customer ini, semua data yang terkait dengan customer ini
              akan dihapus secara permanen.
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
              onPress={handleDeleteCustomer} 
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

export default CustomerDetailScreen
