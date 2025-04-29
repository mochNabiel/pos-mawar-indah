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

import { isKodeKainUnique } from "@/lib/firestore/fabric"
import useToastMessage from "@/lib/hooks/useToastMessage"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

const NewFabricPage = () => {
  const router = useRouter()
  const {addFabric} = useFabricStore()

  const { showToast } = useToastMessage()
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingKode, setCheckingKode] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TFabricSchema>({
    resolver: zodResolver(fabricSchema),
  })

  const onSubmit = async (data: TFabricSchema) => {
    setLoading(true)

    // Cek apakah kode kain sudah ada di database
    const isUnique = await isKodeKainUnique(data.kode)
    if (!isUnique) {
      showToast("Kode kain sudah ada, coba gunakan kode lain", "error")
      setLoading(false)
      return
    }

    const finalData: Fabric = {
      ...data,
      // Ubah ke number sebelum masuk ke Firestore
      hargaEcer: Number(data.hargaEcer),
      hargaGrosir: Number(data.hargaGrosir),
      hargaRoll: Number(data.hargaRoll),
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

  const handleCheckKode = async (kode: string) => {
    if (!kode) {
      showToast("Masukkan kode kain terlebih dahulu", "error")
      return
    }

    try {
      setCheckingKode(true)
      const isUnique = await isKodeKainUnique(kode.trim())
      if (isUnique) {
        showToast("Kode tersedia dan dapat digunakan", "success")
      } else {
        showToast("Kode sudah dipakai, gunakan kode lain", "error")
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengecek kode", "error")
    } finally {
      setCheckingKode(false)
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
                onPress={() => handleCheckKode(field.value)}
                disabled={checkingKode}
                className="h-full rounded-full"
              >
                <ButtonText>
                  {checkingKode ? <Spinner /> : "Cek Kode"}
                </ButtonText>
              </Button>
            </View>
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
            <ButtonText>Tambah Kain</ButtonText>
          )}
        </Button>
      </View>
    </ScrollView>
  )
}

export default NewFabricPage
