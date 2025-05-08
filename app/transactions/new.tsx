import React, { useEffect } from "react"
import { View, ScrollView } from "react-native"
import SelectDropdown from "react-native-select-dropdown"
import { Dropdown } from "react-native-element-dropdown"

import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"

import { Feather } from "@expo/vector-icons"

import { DateTimeDisplay } from "@/components/DateTimeDisplay"
import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import useToastMessage from "@/lib/hooks/useToastMessage"
import TransactionCard from "@/components/TransactionCard"

const NewTransactionScreen = () => {
  const { user } = useCurrentUser()

  const { showToast } = useToastMessage()

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

  const handleAddCard = () => {
    append({
      id: Date.now(),
      fabricName: undefined,
      quantityType: undefined,
      weight: "",
      pricePerKg: 0,
      discountPerKg: 0,
      discount: 0,
      totalPrice: 0,
      useDiscount: false,
    })
  }

  // Function to update transaction totals whenever card values change
  const updateTransactionTotals = () => {
    const cards = getValues("cards")

    // Calculate sub total (sum of all total prices)
    const subTotal = cards.reduce(
      (sum, card) => sum + (card.totalPrice || 0),
      0
    )
    setValue("subTotal", subTotal)

    // Calculate total discount (sum of all discounts)
    const totalDiscount = cards.reduce(
      (sum, card) => sum + (card.discount || 0),
      0
    )
    setValue("totalDiscount", totalDiscount)

    // Calculate total transaction
    setValue("totalTransaction", subTotal - totalDiscount)
  }

  // Watch for changes in cards array to update totals
  const watchedCards = watch("cards")

  useEffect(() => {
    updateTransactionTotals()
  }, [watchedCards])

  const onSubmit = (data: any) => {
    showToast(data, "success")
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Section Info Admin dan Waktu */}
      <View>
        <Card
          variant="outline"
          className="flex flex-row items-center gap-3 mb-4"
        >
          <Feather name="user" size={24} color="#BF40BF" />
          <Text
            size="md"
            className="flex-1 font-semibold"
            style={{ color: "#BF40BF" }}
          >
            Admin {user?.name}
          </Text>
        </Card>
        <DateTimeDisplay />
      </View>

      {/* Section Field Nama Customer */}
      <View className="mb-3 flex gap-1">
        <Text className="font-semibold" style={{ color: "#BF40BF" }}>
          Nama Customer
        </Text>
        <Controller
          control={control}
          name="customerName"
          rules={{ required: true }}
          render={({ field }) => (
            <Dropdown
              data={customers.map((customer) => ({
                label: customer.name,
                value: customer.name,
              }))}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select customer"
              searchPlaceholder="Search..."
              value={field.value}
              onChange={(item) => {
                field.onChange(item.value)
              }}
            />
          )}
        />
      </View>

      {/* Section Card */}
      <Text className="font-semibold mb-1" style={{ color: "#BF40BF" }}>
        Item Transaksi
      </Text>
      {fields.map((field, index) => (
        <TransactionCard
          key={field.id}
          index={index}
          control={control}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
          cardData={field}
          fabrics={fabrics}
          onRemove={() => remove(index)}
          isRemovable={fields.length > 1}
        />
      ))}
    </ScrollView>
  )
}

export default NewTransactionScreen
