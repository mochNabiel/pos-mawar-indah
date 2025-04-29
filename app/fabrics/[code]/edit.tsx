import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, View } from "react-native"
import React, { useEffect, useState } from "react"

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

import useToastMessage from "@/lib/hooks/useToastMessage"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

const EditFabricPage = () => {
  const router = useRouter()
  const { code } = useLocalSearchParams()
  const { findFabricByCode, updateFabric } = useFabricStore()
  const { showToast } = useToastMessage()

  const [loading, setLoading] = useState<boolean>(false)
  const [initialData, setInitialData] = useState<Fabric | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TFabricSchema>({
    resolver: zodResolver(fabricSchema),
    defaultValues: undefined,
  })

  // Masalah Ambiguitas tipe data string | string[]
  const codeParam =  Array.isArray(code) ? code[0] : code

  useEffect(() => {
    const fetchFabric = () => {
      if (!code) return
      const fabric = findFabricByCode(codeParam)
      if (fabric) {
        setInitialData(fabric)
        setValue("code", fabric.code)
        setValue("name", fabric.name)
        setValue("retailPrice", String(fabric.retailPrice))
        setValue("wholesalePrice", String(fabric.wholesalePrice))
        setValue("rollPrice", String(fabric.rollPrice))
        setValue("color", fabric.color)
      } else {
        showToast("Data kain tidak ditemukan", "error")
        router.back()
      }
    }
    fetchFabric()
  }, [code])

  const onSubmit = async (data: TFabricSchema) => {
    setLoading(true)

    const finalData: Fabric = {
      ...data,
      // Ubah ke number sebelum masuk ke Firestore
      retailPrice: Number(data.retailPrice),
      wholesalePrice: Number(data.wholesalePrice),
      rollPrice: Number(data.rollPrice),
    }

    try {
      await updateFabric(codeParam, finalData)
      showToast("Data kain berhasil diupdate", "success")
      router.back()
      setLoading(false)
    } catch (error) {
      showToast("Gagal mengupdate data kain", "error")
    } finally {
      setLoading(false)
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
              <Input size="lg" variant="underlined" className="flex-1 mr-2" isDisabled={true}>
                <InputField
                  placeholder="Contoh: MLN-PUTIH"
                  autoCapitalize="characters"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
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
          <FormControlLabelText className="text-lg">color</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="color"
          render={({ field: { value, onChange } }) => (
            <Select selectedValue={value} onValueChange={onChange}>
              <SelectTrigger size="lg" variant="underlined">
                <SelectInput placeholder="Pilih Warna" />
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
            <ButtonText>Edit Data</ButtonText>
          )}
        </Button>
      </View>
    </ScrollView>
  )
}

export default EditFabricPage
