import { Text, View } from "react-native"
import React, { useEffect } from "react"

import { Controller } from "react-hook-form"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input, InputField } from "@/components/ui/input"
import { Center } from "@/components/ui/center"

import DropdownSelector from "@/components/DropdownSelector"
import { Feather } from "@expo/vector-icons"
import { TransactionCard, TransactionCardProps } from "@/types/transaction"

const TransactionCardItem: React.FC<TransactionCardProps> = ({
  index,
  control,
  watch,
  setValue,
  getValues,
  fabrics,
  onRemove,
  isRemovable,
}) => {
  const fabricName = watch(`cards.${index}.fabricName`)
  const quantityType = watch(`cards.${index}.quantityType`)
  const weight = watch(`cards.${index}.weight`)
  const useDiscount = watch(`cards.${index}.useDiscount`)
  const discountPerKg = watch(`cards.${index}.discountPerKg`)

  // Update price per kg when fabric name or quantity type changes
  useEffect(() => {
    if (fabricName && quantityType) {
      const selectedFabric = fabrics.find((f) => f.name === fabricName)
      if (selectedFabric) {
        let pricePerKg = 0

        switch (quantityType) {
          case "Ecer":
            pricePerKg = selectedFabric.retailPrice
            break
          case "Grosir":
            pricePerKg = selectedFabric.wholesalePrice
            break
          case "Roll":
            pricePerKg = selectedFabric.rollPrice
            break
        }

        setValue(`cards.${index}.pricePerKg`, pricePerKg)
        updateCalculations()
      }
    }
  }, [fabricName, quantityType, fabrics, index, setValue])

  // Update calculations when relevant values change
  useEffect(() => {
    updateCalculations()
  }, [weight, useDiscount, discountPerKg])

  const updateCalculations = () => {
    const currentWeight = parseFloat(weight) || 0
    const currentPricePerKg = getValues(`cards.${index}.pricePerKg`) || 0
    const currentUseDiscount = useDiscount
    const currentDiscountPerKg = currentUseDiscount
      ? parseFloat(discountPerKg) || 0
      : 0

    // Calculate discount total
    const discountTotal = currentWeight * currentDiscountPerKg
    setValue(`cards.${index}.discount`, discountTotal)

    // Calculate total price
    const totalPrice = currentWeight * currentPricePerKg
    setValue(`cards.${index}.totalPrice`, totalPrice)

    // Update transaction totals
    updateTransactionTotals()
  }

  const updateTransactionTotals = () => {
    const cards = getValues("cards")

    // Calculate sub total (sum of all total prices)
    const subTotal = cards.reduce(
      (sum: number, card: TransactionCard) => sum + (card.totalPrice || 0),
      0
    )
    setValue("subTotal", subTotal)

    // Calculate total discount (sum of all discounts)
    const totalDiscount = cards.reduce(
      (sum: number, card: TransactionCard) => sum + (card.discount || 0),
      0
    )
    setValue("totalDiscount", totalDiscount)

    // Calculate total transaction
    setValue("totalTransaction", subTotal - totalDiscount)
  }

  const quantityTypes = ["Ecer", "Grosir", "Roll"]

  return (
    <Card variant="outline" className="mb-4 flex gap-3">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-2xl font-semibold">Item {index + 1}</Text>

        {isRemovable && (
          <Button
            onPress={onRemove}
            variant="solid"
            action="negative"
            className="p-2 rounded-full"
          >
            <Feather name="x" size={20} color="white" />
          </Button>
        )}
      </View>

      <View>
        <Text className="mb-1 text-lg font-semibold">Nama Kain</Text>
        <Controller
          name={`cards.${index}.fabricName`}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <DropdownSelector
              label="Nama Kain"
              options={fabrics.map((f) => f.name)}
              searchable={true}
              placeholder="Pilih Kain"
              searchPlaceholder="Cari nama kain..."
              value={field.value || ""}
              addDataLink="/fabrics/new"
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </View>

      <View>
        <Text className="mb-1 text-lg font-semibold">Tipe Kuantitas</Text>
        <Controller
          name={`cards.${index}.quantityType`}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <DropdownSelector
              label="Tipe Kuantitas"
              options={quantityTypes}
              placeholder="Pilih Kuantitas"
              searchPlaceholder="Cari kuantitas..."
              value={field.value || ""}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </View>

      <View className="flex flex-row gap-3 items-center">
        <Text>Harga/Kg :</Text>
        <Text className="font-semibold text-lg">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(getValues(`cards.${index}.pricePerKg`) || 0)}
        </Text>
      </View>

      <View>
        <Text className="mb-1 text-lg font-semibold">Berat Kain</Text>
        <Controller
          name={`cards.${index}.weight`}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input variant="outline" size="lg" className="rounded-lg">
              <InputField
                keyboardType="numeric"
                placeholder="0.00"
                value={field.value}
                onChangeText={field.onChange}
              />
            </Input>
          )}
        />
      </View>

      <Center className="flex flex-row items-center gap-2">
        <Text className="mb-1 text-lg">Pakai Diskon?</Text>
        <Controller
          name={`cards.${index}.useDiscount`}
          control={control}
          render={({ field }) => (
            <Switch
              size="md"
              value={field.value}
              onValueChange={(checked) => {
                field.onChange(checked)
                if (!checked) {
                  setValue(`cards.${index}.discountPerKg`, 0)
                }
              }}
            />
          )}
        />
      </Center>

      {useDiscount && (
        <View>
          <Text className="mb-1 text-lg font-semibold">Diskon per Kg</Text>
          <Controller
            name={`cards.${index}.discountPerKg`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input variant="outline" size="lg" className="rounded-lg">
                <InputField
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={field.value}
                  onChangeText={field.onChange}
                />
              </Input>
            )}
          />
        </View>
      )}

      <View className="flex flex-row justify-between items-center">
        <Text className="font-semibold">Total Harga</Text>
        <Text className="font-semibold text-xl text-self-purple">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(getValues(`cards.${index}.totalPrice`) || 0)}
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center">
        <Text className="font-semibold">Diskon</Text>
        <Text className="font-semibold text-xl text-self-purple">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(getValues(`cards.${index}.discount`) || 0)}
        </Text>
      </View>
    </Card>
  )
}

export default TransactionCardItem
