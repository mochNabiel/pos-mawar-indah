import React, { useEffect } from "react"
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native"

import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Button, ButtonText } from "@/components/ui/button"

import { Feather } from "@expo/vector-icons"

import DateTimeDisplay from "@/components/DateTimeDisplay"
import TransactionSummary from "@/components/TransactionSummary"
import TransactionCard from "@/components/TransactionCard"
import SearchDropdown from "@/components/SearchDropdown"

import { useCustomerStore } from "@/lib/zustand/useCustomerStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

import useToastMessage from "@/lib/hooks/useToastMessage"

const NewTransactionScreen = () => {
  const { user } = useCurrentUser()

  const { showToast } = useToastMessage()

  const { customers, fetchAllCustomers } = useCustomerStore()
  const { fabrics, fetchAllFabrics } = useFabricStore()

  useEffect(() => {
    fetchAllCustomers()
    fetchAllFabrics()
  }, [])

  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      adminName: user?.name,
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
    showToast(JSON.stringify(data), "success")
    console.log(data)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={95} // Tambahkan offset bila ada header
    >
      <ScrollView
        className="flex-1 bg-white p-5"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Section Info Admin dan Waktu */}
        <View>
          <Card
            variant="outline"
            className="flex flex-row items-center gap-3 mb-3"
          >
            <Feather name="user" size={24} color="#BF40BF" />
            <Text
              size="lg"
              className="flex-1 font-semibold"
              style={{ color: "#BF40BF" }}
            >
              Admin {user?.name}
            </Text>
          </Card>
          <DateTimeDisplay />
        </View>

        {/* Section Field Nama Customer */}
        <View className="mb-5 flex gap-1">
          <Text className="text-lg font-semibold" style={{ color: "#BF40BF" }}>
            Nama Customer
          </Text>
          <Controller
            control={control}
            name="customerName"
            rules={{ required: true }}
            render={({ field }) => (
              <SearchDropdown
                size="sm"
                data={customers.map((customer) => ({
                  label: customer.name,
                  value: customer.name,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Pilih Customer"
                searchPlaceholder="Cari Nama..."
                value={field.value}
                onChange={(item: any) => {
                  field.onChange(item.value)
                }}
              />
            )}
          />
        </View>

        {/* Section Card */}
        <View className="mb-1">
          <Text
            className="text-lg font-semibold mb-1"
            style={{ color: "#BF40BF" }}
          >
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
        </View>

        <Button
          onPress={handleAddCard}
          size="xl"
          variant="link"
          className="mb-5 rounded-lg"
        >
          <Feather name="plus" size={24} color="black" />
          <ButtonText>Tambah Item</ButtonText>
        </Button>

        <TransactionSummary getValues={getValues} />

        <Button
          onPress={handleSubmit(onSubmit)}
          size="xl"
          variant="solid"
          action="info"
          disabled={!isValid}
          className={`rounded-lg mb-5 ${
            !isValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ButtonText>Buat Transaksi</ButtonText>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default NewTransactionScreen
