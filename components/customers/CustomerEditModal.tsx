import React, { useEffect, useState } from "react"
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
import { Text } from "@/components/ui/text"
import { useForm, Controller } from "react-hook-form"
import { Customer } from "@/types/customer"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import useToastMessage from "@/lib/hooks/useToastMessage"
import { View } from "react-native"
import { Spinner } from "../ui/spinner"

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onUpdated?: () => void
}

interface FormValues {
  name: string
  phone: string
  company: string
}

const CustomerEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customer,
  onUpdated,
}) => {
  const { updateCustomer } = useCustomerStore()
  const { showToast } = useToastMessage()
  const [loading, setLoading] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      company: customer?.company || "",
    },
  })

  useEffect(() => {
    reset({
      name: customer?.name || "",
      phone: customer?.phone || "",
      company: customer?.company || "",
    })
  }, [customer, reset])

  const watchName = watch("name")
  const watchPhone = watch("phone")
  const watchCompany = watch("company")

  const isUnchanged =
    watchName === customer?.name &&
    watchPhone === customer?.phone &&
    watchCompany === customer?.company

  const onSubmit = async (data: FormValues) => {
    if (!customer) return
    setLoading(true)
    try {
      await updateCustomer(customer.name, {
        phone: data.phone,
        company: data.company,
      })
      showToast("Berhasil memperbarui data customer", "success")
      onUpdated && onUpdated()
      setLoading(false)
      onClose()
    } catch (error) {
      console.error("Gagal update customer:", error)
      showToast("Gagal memperbarui data customer", "error")
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="justify-center">
          <Heading size="xl">Edit Customer</Heading>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Nama
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  isDisabled
                >
                  <InputField
                    value={field.value}
                    editable={false}
                  />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Nomor Telepon
            </Text>
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Nomor telepon wajib diisi",
                pattern: {
                  value: /^[0-9()+-\s]+$/,
                  message: "Format nomor telepon tidak valid",
                },
              }}
              render={({ field }) => (
                <>
                  <Input variant="outline" size="lg" className="rounded-lg">
                    <InputField
                      placeholder="Masukkan nomor telepon"
                      value={field.value}
                      onChangeText={field.onChange}
                      keyboardType="phone-pad"
                    />
                  </Input>
                  {errors.phone && (
                    <Text className="text-red-500">{errors.phone.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Perusahaan / Apparel
            </Text>
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan Nama Perusahaan"
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="characters"
                  />
                </Input>
              )}
            />
          </View>
        </ModalBody>
        <ModalFooter className="space-x-3">
          <Button
            variant="outline"
            size="lg"
            onPress={onClose}
            className="flex-1 rounded-lg"
          >
            <ButtonText>Batal</ButtonText>
          </Button>
          <Button
            variant="solid"
            size="lg"
            action="primary"
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting || isUnchanged}
            className="flex-1 rounded-lg"
          >
            {loading ? (
              <View className="flex-row gap-1">
                <Spinner color="white" />
                <ButtonText>Menyimpan...</ButtonText>
              </View>
            ) : (
              <ButtonText>Simpan</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CustomerEditModal
