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
  const { kode } = useLocalSearchParams()
  const { findFabricByKode, updateFabric } = useFabricStore()
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
  const kodeParam =  Array.isArray(kode) ? kode[0] : kode

  useEffect(() => {
    const fetchFabric = () => {
      if (!kode) return
      const fabric = findFabricByKode(kodeParam)
      if (fabric) {
        setInitialData(fabric)
        setValue("kode", fabric.kode)
        setValue("nama", fabric.nama)
        setValue("hargaEcer", String(fabric.hargaEcer))
        setValue("hargaGrosir", String(fabric.hargaGrosir))
        setValue("hargaRoll", String(fabric.hargaRoll))
        setValue("warna", fabric.warna)
      } else {
        showToast("Data kain tidak ditemukan", "error")
        router.back()
      }
    }
    fetchFabric()
  }, [kode])

  const onSubmit = async (data: TFabricSchema) => {
    setLoading(true)

    const finalData: Fabric = {
      ...data,
      // Ubah ke number sebelum masuk ke Firestore
      hargaEcer: Number(data.hargaEcer),
      hargaGrosir: Number(data.hargaGrosir),
      hargaRoll: Number(data.hargaRoll),
    }

    try {
      await updateFabric(kodeParam, finalData)
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
          name="kode"
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
        {errors.kode && (
          <Text className="text-red-500">{errors.kode.message}</Text>
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
          name="nama"
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
        {errors.nama && (
          <Text className="text-red-500">{errors.nama.message}</Text>
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
          name="hargaEcer"
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
        {errors.hargaEcer && (
          <Text className="text-red-500">{errors.hargaEcer.message}</Text>
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
          name="hargaGrosir"
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
        {errors.hargaGrosir && (
          <Text className="text-red-500">{errors.hargaGrosir.message}</Text>
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
          name="hargaRoll"
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
        {errors.hargaRoll && (
          <Text className="text-red-500">{errors.hargaRoll.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">Warna</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="warna"
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
        {errors.warna && (
          <Text className="text-red-500">{errors.warna.message}</Text>
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
