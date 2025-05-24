import React, { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { Controller, useForm } from "react-hook-form"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Heading } from "@/components/ui/heading"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import DropdownSelector from "@/components/DropdownSelector"

import { UserWithId } from "@/types/user"
import { updateUser } from "@/lib/firestore/users"
import useToastMessage from "@/lib/hooks/useToastMessage"

type FormValues = {
  name: string
  email: string
  role: "admin" | "superadmin" | ""
}

const EditUserModal = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}: {
  isOpen: boolean
  onClose: () => void
  user: UserWithId | null
  onUpdated?: () => void
}) => {
  const { showToast } = useToastMessage()
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  })

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
      })
    }
  }, [user, reset])

  const watchName = watch("name")
  const watchRole = watch("role")

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) return
    setLoading(true)
    try {
      await updateUser(user.id, {
        name: values.name,
        role: values.role === "" ? undefined : values.role,
      })
      showToast("Data admin berhasil diperbarui", "success")
      onClose()
      onUpdated?.()
    } catch (err) {
      showToast("Gagal memperbarui admin", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="justify-center">
          <Heading size="xl">Edit Admin</Heading>
        </ModalHeader>
        <ModalBody>
          <View className="mb-3">
            <Text className="text-lg text-self-army font-medium mb-1">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  isDisabled
                >
                  <InputField
                    placeholder="Email admin"
                    value={field.value}
                    editable={false}
                  />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-army font-medium mb-1">
              Nama Admin
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan nama admin"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                </Input>
              )}
            />
          </View>

          <View>
            <Text className="text-lg text-self-army font-medium mb-1">
              Role
            </Text>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <DropdownSelector
                  label="Role"
                  options={["admin", "superadmin"]}
                  placeholder="Pilih Role"
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(value as "admin" | "superadmin")
                  }
                />
              )}
            />
          </View>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onPress={onClose} className="rounded-lg">
            <ButtonText>Batal</ButtonText>
          </Button>
          <Button
            onPress={handleSubmit(onSubmit)}
            className="rounded-lg"
            isDisabled={!watchName || !watchRole || loading}
          >
            {loading ? (
              <>
                <Spinner size="small" color="#fff" />
                <ButtonText className="ml-2">Menyimpan...</ButtonText>
              </>
            ) : (
              <ButtonText>Simpan</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditUserModal
