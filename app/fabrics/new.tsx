import { useRouter } from "expo-router"
import { ScrollView, View } from "react-native"
import React, { useState } from "react"

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectIcon,
} from "@/components/ui/select"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"
import { ChevronDownIcon } from "@/components/ui/icon"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import fabricSchema, { TFabricSchema } from "@/schema/fabricSchema"
import { Fabric } from "@/types/fabric"

import { isFabricCodeUnique } from "@/lib/firestore/fabric"
import useToastMessage from "@/lib/hooks/useToastMessage"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

const NewFabricPage = () => {
  const router = useRouter()
  const { addFabric } = useFabricStore()

  const { showToast } = useToastMessage()
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingCode, setCheckingCode] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TFabricSchema>({
    resolver: zodResolver(fabricSchema),
  })

  const onSubmit = async (data: TFabricSchema) => {
    setLoading(true)

    // Cek apakah code kain sudah ada di database
    const isUnique = await isFabricCodeUnique(data.code)
    if (!isUnique) {
      showToast("code kain sudah ada, coba gunakan code lain", "error")
      setLoading(false)
      return
    }

    const finalData: Fabric = {
      ...data,
      // Ubah ke number sebelum masuk ke Firestore
      retailPrice: Number(data.retailPrice),
      wholesalePrice: Number(data.wholesalePrice),
      rollPrice: Number(data.rollPrice),
    }

    try {
      await addFabric(finalData)
      showToast("Data kain berhasil ditambahkan", "success")
      router.back()
      setLoading(false)
    } catch (error) {
      showToast("Gagal menambahkan data kain", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckCode = async (code: string) => {
    if (!code) {
      showToast("Masukkan code kain terlebih dahulu", "error")
      return
    }

    try {
      setCheckingCode(true)
      const isUnique = await isFabricCodeUnique(code.trim())
      if (isUnique) {
        showToast("code tersedia dan dapat digunakan", "success")
      } else {
        showToast("code sudah dipakai, gunakan code lain", "error")
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengecek code", "error")
    } finally {
      setCheckingCode(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Kode Kain
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <View className="flex flex-row justify-between items-center gap-5 w-full">
              <Input size="lg" variant="underlined" className="flex-1 mr-2">
                <InputField
                  placeholder="Contoh: MLN-PUTIH"
                  autoCapitalize="characters"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
              <Button
                onPress={() => handleCheckCode(field.value)}
                disabled={checkingCode}
                className="h-full rounded-full"
              >
                <ButtonText>
                  {checkingCode ? <Spinner /> : "Cek kode"}
                </ButtonText>
              </Button>
            </View>
          )}
        />
        {errors.code && (
          <Text className="text-red-500">{errors.code.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Nama Kain
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                placeholder="Contoh: MILANO PUTIH 160BR"
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
        {errors.name && (
          <Text className="text-red-500">{errors.name.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Harga Ecer
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="retailPrice"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Masukkan harga ecer"
              />
            </Input>
          )}
        />
        {errors.retailPrice && (
          <Text className="text-red-500">{errors.retailPrice.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Harga Grosir
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="wholesalePrice"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Masukkan harga grosir"
              />
            </Input>
          )}
        />
        {errors.wholesalePrice && (
          <Text className="text-red-500">{errors.wholesalePrice.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Harga Roll
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="rollPrice"
          render={({ field }) => (
            <Input size="lg" variant="underlined">
              <InputField
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Masukkan harga roll"
              />
            </Input>
          )}
        />
        {errors.rollPrice && (
          <Text className="text-red-500">{errors.rollPrice.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">Warna</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="color"
          render={({ field: { value, onChange } }) => (
            <Select selectedValue={value} onValueChange={onChange}>
              <SelectTrigger size="lg" variant="underlined">
                <SelectInput placeholder="Pilih warna" />
                <SelectIcon className="ml-auto" as={ChevronDownIcon} />
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
        {errors.color && (
          <Text className="text-red-500">{errors.color.message}</Text>
        )}
      </FormControl>

      <View className="flex flex-row justify-between items-center gap-5 w-full">
        <Button
          onPress={() => router.back()}
          size="xl"
          variant="link"
          action="secondary"
          className="flex-1 rounded-full"
        >
          <ButtonText>Kembali</ButtonText>
        </Button>

        <Button
          onPress={handleSubmit(onSubmit)}
          size="xl"
          variant="solid"
          action="info"
          disabled={loading}
          className="flex-1 rounded-full"
        >
          {loading ? (
            <ButtonText>
              <Spinner />
            </ButtonText>
          ) : (
            <ButtonText>Tambah Kain</ButtonText>
          )}
        </Button>
      </View>
    </ScrollView>
  )
}

export default NewFabricPage
