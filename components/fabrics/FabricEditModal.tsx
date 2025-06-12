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
import { Fabric } from "@/types/fabric"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import useToastMessage from "@/lib/hooks/useToastMessage"
import { View } from "react-native"
import { Spinner } from "../ui/spinner"
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select"
import { ChevronDownIcon } from "../ui/icon"

interface Props {
  isOpen: boolean
  onClose: () => void
  fabric: Fabric | null
  onUpdated?: () => void
}

interface FormValues {
  code: string
  name: string
  color: "PUTIH" | "HITAM" | "WARNA LAIN" | undefined
  retailPrice: number
  wholesalePrice: number
  rollPrice: number
}

const FabricEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fabric,
  onUpdated,
}) => {
  const { updateFabric } = useFabricStore()
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
      code: fabric?.code || "",
      name: fabric?.name || "",
      color: fabric?.color || undefined,
      retailPrice: fabric?.retailPrice || 0,
      wholesalePrice: fabric?.wholesalePrice || 0,
      rollPrice: fabric?.rollPrice || 0,
    },
  })

  useEffect(() => {
    reset({
      code: fabric?.code || "",
      name: fabric?.name || "",
      color: fabric?.color || undefined,
      retailPrice: fabric?.retailPrice || 0,
      wholesalePrice: fabric?.wholesalePrice || 0,
      rollPrice: fabric?.rollPrice || 0,
    })
  }, [fabric, reset])

  const watchCode = watch("code")
  const watchName = watch("name")
  const watchColor = watch("color")
  const watchRetailPrice = watch("retailPrice")
  const watchWholesalePrice = watch("wholesalePrice")
  const watchRollPrice = watch("rollPrice")

  const isUnchanged =
    watchCode === fabric?.code &&
    watchName === fabric?.name &&
    watchColor === fabric?.color &&
    watchRetailPrice === fabric?.retailPrice &&
    watchWholesalePrice === fabric?.wholesalePrice &&
    watchRollPrice === fabric?.rollPrice

  const onSubmit = async (data: FormValues) => {
    if (!fabric) return
    setLoading(true)
    try {
      await updateFabric(fabric.code, {
        name: data.name,
        color: data.color,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        rollPrice: data.rollPrice,
      })
      showToast("Berhasil memperbarui data kain", "success")
      onUpdated && onUpdated()
      setLoading(false)
      onClose()
    } catch (error) {
      console.error("Gagal update kain:", error)
      showToast("Gagal memperbarui data kain", "error")
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="justify-center">
          <Heading size="xl">Edit Kain</Heading>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Kode
            </Text>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <Input
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  isDisabled
                >
                  <InputField value={field.value} editable={false} />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Nama Kain
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan nama kain"
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="characters"
                  />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Warna
            </Text>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Select
                  selectedValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    size="lg"
                    variant="outline"
                    className="rounded-lg"
                  >
                    <SelectInput placeholder="Pilih warna" />
                    <SelectIcon className="ml-auto mr-2" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="PUTIH" value="PUTIH" />
                      <SelectItem label="HITAM" value="HITAM" />
                      <SelectItem label="WARNA LAIN" value="WARNA LAIN" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Harga Ecer
            </Text>
            <Controller
              control={control}
              name="retailPrice"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan harga ecer"
                    value={field.value.toString()}
                    onChangeText={(value) => field.onChange(Number(value))}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Harga Grosir
            </Text>
            <Controller
              control={control}
              name="wholesalePrice"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan harga grosir"
                    value={field.value.toString()}
                    onChangeText={(value) => field.onChange(Number(value))}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            />
          </View>

          <View className="mb-3">
            <Text className="text-lg text-self-cyan font-medium mb-1">
              Harga Roll
            </Text>
            <Controller
              control={control}
              name="rollPrice"
              render={({ field }) => (
                <Input variant="outline" size="lg" className="rounded-lg">
                  <InputField
                    placeholder="Masukkan harga roll"
                    value={field.value.toString()}
                    onChangeText={(value) => field.onChange(Number(value))}
                    keyboardType="numeric"
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

export default FabricEditModal
