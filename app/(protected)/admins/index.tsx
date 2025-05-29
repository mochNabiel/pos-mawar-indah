import React, { useState, useEffect } from "react"
import { FlatList, Pressable, View } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

import { deleteUser, getAllUsers, getUserByEmail } from "@/lib/firestore/users"

import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Center } from "@/components/ui/center"
import { Card } from "@/components/ui/card"
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge"
import { CloseIcon, Icon, LockIcon, StarIcon } from "@/components/ui/icon"
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

import GradientCard from "@/components/GradientCard"
import EditUserModal from "@/components/EditUserModal"

import useToastMessage from "@/lib/hooks/useToastMessage"
import { UserWithId } from "@/types/user"
import LoadingMessage from "@/components/LoadingMessage"

const AdminScreen = () => {
  const router = useRouter()

  const [users, setUsers] = useState<UserWithId[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  const [selectedUser, setSelectedUser] = useState<UserWithId | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const { showToast } = useToastMessage()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      showToast("Error Fetch Data User, Hubungi Developer", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenEdit = async (email: string) => {
    try {
      const user = await getUserByEmail(email)
      if (user) {
        setSelectedUser(user)
        setShowEditModal(true)
      }
    } catch (error) {
      showToast("Gagal mengambil data user", "error")
    }
  }

  const handleDeleteUser = async (email: string) => {
    setIsDeleting(true)
    try {
      await deleteUser(email)
      showToast("Data User Tersebut Berhasil Dihapus", "success")
      setUsers((prev) => prev.filter((user) => user.email !== email))
      setIsDeleting(false)
      setShowDeleteModal(false)
    } catch (error) {
      showToast("Data User Tersebut Gagal Dihapus", "error")
      setIsDeleting(false)
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const renderItem = ({ item }: { item: (typeof users)[0] }) => (
    <>
      <Card size="sm" variant="outline" className="rounded-lg mb-5">
        <View>
          <View className="flex-row items-start justify-between">
            <View className="flex-row gap-2 items-center mb-3">
              <Card
                variant="filled"
                size="sm"
                className="bg-secondary-400 rounded-lg"
              >
                <Feather name="user" size={16} color="black" />
              </Card>
              <Heading size="xl">{item.name}</Heading>
            </View>
            {item.role == "admin" ? (
              <Badge
                size="md"
                variant="outline"
                action="success"
                className="flex-row gap-2 rounded-full"
              >
                <BadgeText>Admin</BadgeText>
                <BadgeIcon as={LockIcon} />
              </Badge>
            ) : (
              <Badge
                size="md"
                variant="outline"
                action="info"
                className="flex-row gap-2 rounded-full"
              >
                <BadgeText>Superadmin</BadgeText>
                <BadgeIcon as={StarIcon} />
              </Badge>
            )}
          </View>
          <Text className="text-lg text-typography-700">
            Email: {item.email}
          </Text>
          <Text className="text-lg text-typography-700">Role: {item.role}</Text>
          <Text className="text-lg text-typography-700 mb-3">
            Terdaftar:{" "}
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <View className="flex-row items-center gap-3 mt-3">
            <Button
              onPress={() => handleOpenEdit(item.email)}
              className="flex-1 rounded-lg"
            >
              <Feather name="edit" color="white" />
              <ButtonText>Edit</ButtonText>
            </Button>
            <Button
              variant="outline"
              action="negative"
              className="flex-1 rounded-lg"
              onPress={() => {
                setShowDeleteModal(true)
              }}
            >
              <Feather name="trash" color="red" />
              <ButtonText className="text-red-500">Hapus</ButtonText>
            </Button>
          </View>
        </View>
      </Card>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-950">
              Yakin ingin menghapus Data User ini?
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
            <Text size="sm" className="text-typography-500">
              Dengan menghapus data user ini, semua data yang terkait dengan
              user ini akan dihapus secara permanen.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              size="lg"
              onPress={() => {
                setShowDeleteModal(false)
              }}
              className="flex-1 rounded-lg"
            >
              <ButtonText>Kembali</ButtonText>
            </Button>
            <Button
              variant="solid"
              action="negative"
              size="lg"
              onPress={() => handleDeleteUser(item.email)}
              className="flex-1 rounded-lg"
              isDisabled={isDeleting}
            >
              <ButtonText>Hapus</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )

  // Key extractor untuk FlatList
  const keyExtractor = (item: (typeof users)[0]) => item.id

  return (
    <View className="flex-1 bg-white p-5">
      {loading ? (
        <LoadingMessage message="Memuat Data Admin..." />
      ) : (
        <>
          <View className="gap-3">
            <Center className="flex-row items-center gap-2">
              <GradientCard>
                <Feather name="lock" size={24} color="white" />
              </GradientCard>
              <View>
                <Heading size="2xl">Data Admin</Heading>
                <Text>Kelola akun admin sistem</Text>
              </View>
            </Center>
            <Pressable onPress={() => router.push("/(protected)/admins/new")} className="mb-5">
              <GradientCard>
                <View className="flex-row items-center justify-center gap-2">
                  <Feather name="plus" size={16} color="white" />
                  <Text className="text-white font-semibold">
                    Register Admin
                  </Text>
                </View>
              </GradientCard>
            </Pressable>
          </View>

          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          />

          {selectedUser && (
            <EditUserModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              user={selectedUser}
              onUpdated={fetchUsers}
            />
          )}
        </>
      )}
    </View>
  )
}

export default AdminScreen
