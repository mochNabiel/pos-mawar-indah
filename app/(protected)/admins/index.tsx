import React, { useState, useEffect } from "react"
import { FlatList, View, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

import { deleteUser, getAllUsers, getUserByEmail } from "@/lib/firestore/users"

import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Center } from "@/components/ui/center"

import GradientCard from "@/components/GradientCard"
import EditUserModal from "@/components/EditUserModal"

import AdminItem from "@/components/admin/AdminItem"
import AdminDeleteModal from "@/components/admin/AdminDeleteModal"

import useToastMessage from "@/lib/hooks/useToastMessage"
import { UserWithId } from "@/types/user"
import LoadingMessage from "@/components/LoadingMessage"
import useBackHandler from "@/lib/hooks/useBackHandler"

const AdminScreen = () => {
  const router = useRouter()
  useBackHandler("(tabs)/data")

  const [users, setUsers] = useState<UserWithId[]>([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsDeleting(true)
    try {
      await deleteUser(selectedUser.email)
      showToast("Data User Tersebut Berhasil Dihapus", "success")
      setUsers((prev) => prev.filter((user) => user.email !== selectedUser.email))
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      showToast("Data User Tersebut Gagal Dihapus", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const renderItem = ({ item }: { item: UserWithId }) => (
    <AdminItem
      user={item}
      onEdit={handleOpenEdit}
      onShowDelete={() => {
        setSelectedUser(item)
        setShowDeleteModal(true)
      }}
    />
  )

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
                  <Text className="text-white font-semibold">Register Admin</Text>
                </View>
              </GradientCard>
            </Pressable>
          </View>

          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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

          <AdminDeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={handleDeleteUser}
            isDeleting={isDeleting}
          />
        </>
      )}
    </View>
  )
}

export default AdminScreen
