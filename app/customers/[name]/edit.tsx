import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, View, Dimensions } from "react-native"
import React, { useEffect, useState } from "react"

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"

import SelectDropdown from "react-native-select-dropdown"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import customerSchema, { TCustomerSchema } from "@/schema/customerSchema"

import useToastMessage from "@/lib/hooks/useToastMessage"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"

import { countryCodes } from "@/constants/countryCodes"
import { Feather } from "@expo/vector-icons"
import { isCustomerNameUnique } from "@/lib/firestore/customer"

const EditCustomerScreen = () => {
  const router = useRouter()
  const { name } = useLocalSearchParams()
  const { findCustomerByName, updateCustomer } = useCustomerStore()
  const { showToast } = useToastMessage()

  const [loading, setLoading] = useState<boolean>(false)
  const [checkingName, setCheckingName] = useState(false)

  const screenWidth = Dimensions.get("window").width

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TCustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: undefined,
  })

  // Masalah Ambiguitas tipe data string | string[]
  const nameParam = Array.isArray(name) ? name[0] : name

  useEffect(() => {
    const fetchCustomer = () => {
      if (!name) return
      const customer = findCustomerByName(nameParam)
      if (customer) {
        setValue("name", customer.name)
        setValue("countryCode", customer.phone.slice(0, 3))
        setValue("phoneNumber", customer.phone.slice(3))
      } else {
        showToast("Data customer tidak ditemukan", "error")
        router.back()
      }
    }
    fetchCustomer()
  }, [name])

  const handleCheckName = async (name: string) => {
    if (!name) {
      showToast("Masukkan nama customer terlebih dahulu", "error")
      return
    }

    try {
      setCheckingName(true)
      const isUnique = await isCustomerNameUnique(name.trim())
      if (isUnique) {
        showToast("Nama tersedia dan dapat digunakan", "success")
      } else {
        showToast("Nama sudah dipakai, gunakan nama lain", "error")
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengecek nama", "error")
    } finally {
      setCheckingName(false)
    }
  }

  const onSubmit = async (data: TCustomerSchema) => {
    setLoading(true)

    // Cek apakah code kain sudah ada di database
    const isUnique = await isCustomerNameUnique(data.name)
    if (!isUnique) {
      showToast(
        "Nama customer tersebut sudah ada, coba gunakan nama lain",
        "error"
      )
      setLoading(false)
      return
    }

    const finalData = {
      name: data.name,
      phone: `${data.countryCode}${data.phoneNumber}`,
    }

    try {
      await updateCustomer(nameParam, finalData)
      showToast("Data customer berhasil diupdate", "success")
      router.push("/customers")
      setLoading(false)
    } catch (error) {
      showToast("Gagal mengupdate data customer", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg">
            Nama Customer
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <View className="flex flex-row justify-between items-center gap-5 w-full">
              <Input size="lg" variant="underlined" className="flex-1 mr-2">
                <InputField
                  placeholder="cth: BUDI PRASETYA"
                  autoCapitalize="characters"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
              <Button
                onPress={() => handleCheckName(field.value)}
                disabled={checkingName}
                className="h-full rounded-full"
              >
                <ButtonText>
                  {checkingName ? <Spinner /> : "Cek Nama"}
                </ButtonText>
              </Button>
            </View>
          )}
        />
        {errors.name && (
          <Text className="text-red-500">{errors.name.message}</Text>
        )}
      </FormControl>

      <FormControl className="mb-5">
        <FormControlLabel>
          <FormControlLabelText className="text-lg mb-3">
            Nomor Telepon
          </FormControlLabelText>
        </FormControlLabel>
        <View className="flex flex-row items-center gap-3">
          <Controller
            control={control}
            name="countryCode"
            render={({ field }) => (
              <SelectDropdown
                data={countryCodes}
                search={true}
                searchPlaceHolder="Cari kode negara"
                searchInputStyle={{
                  width: screenWidth,
                }}
                defaultValue={countryCodes.find(
                  (cc) => cc.dial_code === field.value
                )}
                onSelect={(selectedItem) =>
                  field.onChange(selectedItem.dial_code)
                }
                renderButton={(selectedItem, isOpened) => (
                  <View className="border rounded-xl border-secondary-500 p-2 px-3 bg-white flex flex-row gap-2 items-center justify-between">
                    <Text className="text-gray-900 text-lg font-semibold">
                      {selectedItem ? selectedItem.dial_code : "+62"}
                    </Text>
                    <Feather name="chevron-down" size={12} color="gray" />
                  </View>
                )}
                renderItem={(item, index, isSelected) => (
                  <View
                    key={index}
                    className={`p-3 border-b border-secondary-300 ${
                      isSelected ? "bg-gray-200" : "bg-white"
                    }`}
                  >
                    <Text className="text-lg text-gray-900">{`${item.name} (${item.dial_code})`}</Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                disableAutoScroll={true}
                dropdownStyle={{
                  width: "100%",
                  marginTop: 4,
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <Input className="flex-1" size="lg" variant="underlined">
                <InputField
                  placeholder="cth: 81234567890"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
            )}
          />
        </View>
        {(errors.countryCode || errors.phoneNumber) && (
          <Text className="text-red-500">
            {errors.countryCode?.message || errors.phoneNumber?.message}
          </Text>
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
            <ButtonText>Edit</ButtonText>
          )}
        </Button>
      </View>
    </ScrollView>
  )
}

export default EditCustomerScreen
