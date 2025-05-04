import { View, ScrollView } from "react-native"
import SelectDropdown from "react-native-select-dropdown"
import React, { useEffect } from "react"

import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"

import { Feather } from "@expo/vector-icons"

import { DateTimeDisplay } from "@/components/DateTimeDisplay"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

const NewTransactionScreen = () => {
  const { user } = useCurrentUser()
  const { customers, fetchAllCustomers } = useCustomerStore()
  const { fabrics, fetchAllFabrics } = useFabricStore()

  useEffect(() => {
    fetchAllCustomers()
    fetchAllFabrics()
  }, [])

  const { control, watch, setValue, getValues, handleSubmit, reset } = useForm({
    defaultValues: {
      adminName: user?.name || "",
      customerName: "",
      cards: [
        {
          id: Date.now(),
          fabricName: undefined,
          quantityType: undefined,
          weight: "",
          pricePerKg: 0,
          discountPerKg: 0,
          discount: 0,
          totalPrice: 0,
          useDiscount: false,
        },
      ],
      subTotal: 0,
      totalDiscount: 0,
      totalTransaction: 0,
      createdAt: new Date(),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cards",
  })

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Section Info Admin dan Waktu */}
      <View>
        <Card variant="outline" className="flex flex-row gap-3 mb-4">
          <Feather name="user" size={24} color="black" />
          <Text size="md" className="flex-1 font-semibold">
            {user?.name}
          </Text>
        </Card>
        <DateTimeDisplay />
      </View>

      {/* Section Field Nama Customer */}
      <Card variant="outline" className="mb-4">
        <Text className="mb-3">Nama Customer</Text>
        <Controller
          control={control}
          name="customerName"
          rules={{ required: true }}
          render={({ field }) => (
            <SelectDropdown
              data={customers}
              search={true}
              searchPlaceHolder="Cari customer"
              defaultValue={customers.find((c) => c.name === field.value)}
              onSelect={(selected) => field.onChange(selected.name)}
              renderButton={(selectedItem) => (
                <View className="border rounded-xl p-2 px-3 bg-white flex-row justify-between items-center">
                  <Text className="text-md">
                    {selectedItem ? selectedItem.name : "Pilih Customer"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="gray" />
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View
                  key={index}
                  className={`p-3 border-b ${
                    isSelected ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  <Text className="text-md">{item.name}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              disableAutoScroll={true}
              dropdownStyle={{ width: "100%", marginTop: 4 }}
            />
          )}
        />
      </Card>

      
    </ScrollView>
  )
}

export default NewTransactionScreen
