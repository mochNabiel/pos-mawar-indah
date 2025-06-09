import React, { useEffect } from "react"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui/modal"
import { Heading } from "@/components/ui/heading"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useForm, Controller } from "react-hook-form"
import { Customer } from "@/types/customer"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"

import useToastMessage from "@/lib/hooks/useToastMessage"

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onUpdated?: () => void
}

interface FormValues {
  name: string
  phone: string
}

const CustomerEditModal: React.FC<Props> = ({ isOpen, onClose, customer, onUpdated }) => {
  const { updateCustomer } = useCustomerStore()
  const { showToast } = useToastMessage()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
    },
  })

  useEffect(() => {
    reset({
      name: customer?.name || "",
      phone: customer?.phone || "",
    })
  }, [customer, reset])

  const onSubmit = async (data: FormValues) => {
    if (!customer) return

    try {
      await updateCustomer(customer.name, { phone: data.phone })
      showToast("Berhasil memperbarui data customer", "success")
      onUpdated && onUpdated()
    } catch (error) {
      console.error("Gagal update customer:", error)
      showToast("Gagal memperbarui data customer", "error")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Edit Customer</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { value } }) => (
              <>
                <Text className="mb-1 font-semibold">Nama</Text>
                <Input>
                  <InputField
                    value={value}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </Input>
              </>
            )}
          />
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
            render={({ field: { onChange, value } }) => (
              <>
                <Text className="mb-1 font-semibold">Nomor Telepon</Text>
                <Input>
                  <InputField
                    placeholder="Masukkan nomor telepon"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                  />
                </Input>
                {errors.phone && <Text className="text-red-500">{errors.phone.message}</Text>}
              </>
            )}
          />
        </ModalBody>
        <ModalFooter className="space-x-3">
          <Button variant="outline" onPress={onClose} className="flex-1 rounded-lg">
            <ButtonText>Batal</ButtonText>
          </Button>
          <Button
            variant="solid"
            action="primary"
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
            className="flex-1 rounded-lg"
          >
            <ButtonText>Simpan</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CustomerEditModal
