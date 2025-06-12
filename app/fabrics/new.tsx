import React, { useState } from "react"
import { useRouter } from "expo-router"
import { ScrollView, View } from "react-native"

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
import { Center } from "@/components/ui/center"
import { Heading } from "@/components/ui/heading"

const NewFabricScreen = () => {
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
    setCheckingCode(true)
    if (!code) {
      showToast("Masukkan code kain terlebih dahulu", "error")
      setCheckingCode(false)
      return
    }

    try {
      const isUnique = await isFabricCodeUnique(code.trim())
      if (isUnique) {
        showToast("Code tersedia dan dapat digunakan", "success")
      } else {
        showToast("Code sudah dipakai, gunakan code lain", "error")
      }
      setCheckingCode(false)
    } catch (err) {
      showToast("Terjadi kesalahan saat mengecek code", "error")
      setCheckingCode(false)
    } finally {
      setCheckingCode(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Center>
        <Heading size="xl" className="mb-3">
          Tambah Data Kain
        </Heading>
      </Center>
      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg text-self-purple">
            Kode Kain
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <View className="flex flex-row justify-between items-center gap-1 w-full">
              <Input
                size="lg"
                variant="outline"
                className="flex-1 mr-2 rounded-lg"
              >
                <InputField
                  placeholder="cth: MLN-PUTIH"
                  autoCapitalize="characters"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
              <Button
                onPress={() => handleCheckCode(field.value)}
                disabled={checkingCode}
                size="lg"
                className="h-full rounded-lg"
              >
                {checkingCode ? (
                  <View className="flex-row">
                    <Spinner color="white" />
                    <ButtonText>Mengecek...</ButtonText>
                  </View>
                ) : (
                  <ButtonText>Cek kode</ButtonText>
                )}
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
          <FormControlLabelText className="text-lg text-self-purple">
            Nama Kain
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input size="lg" variant="outline" className="rounded-lg">
              <InputField
                placeholder="cth: MILANO PUTIH 160BR"
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
          <FormControlLabelText className="text-lg text-self-purple">
            Harga Ecer
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="retailPrice"
          render={({ field }) => (
            <Input size="lg" variant="outline" className="rounded-lg">
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
          <FormControlLabelText className="text-lg text-self-purple">
            Harga Grosir
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="wholesalePrice"
          render={({ field }) => (
            <Input size="lg" variant="outline" className="rounded-lg">
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
          <FormControlLabelText className="text-lg text-self-purple">
            Harga Roll
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="rollPrice"
          render={({ field }) => (
            <Input size="lg" variant="outline" className="rounded-lg">
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
          <FormControlLabelText className="text-lg text-self-purple">
            Warna
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="color"
          render={({ field: { value, onChange } }) => (
            <Select selectedValue={value} onValueChange={onChange}>
              <SelectTrigger size="lg" variant="outline" className="rounded-lg">
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
        {errors.color && (
          <Text className="text-red-500">{errors.color.message}</Text>
        )}
      </FormControl>

      <View className="flex flex-row justify-between items-center gap-3 w-full">
        <Button
          onPress={() => router.back()}
          size="lg"
          variant="outline"
          action="secondary"
          className="flex-1 rounded-lg"
        >
          <ButtonText>Kembali</ButtonText>
        </Button>

        <Button
          onPress={handleSubmit(onSubmit)}
          size="lg"
          variant="solid"
          disabled={loading}
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
      </View>
    </ScrollView>
  )
}

export default NewFabricScreen
