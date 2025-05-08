import { ScrollView, Text, View } from "react-native"
import React, { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"

import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form"

import { Fabric } from "@/types/fabric"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, InputField } from "./ui/input"

export interface TransactionCardData {
  id: number
  fabricName: string | undefined
  quantityType: "Ecer" | "Grosir" | "Roll" | undefined
  weight: string
  pricePerKg: number
  discountPerKg: number
  discount: number
  totalPrice: number
  useDiscount: boolean
}

interface TransactionCardProps {
  index: number
  control: Control<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  getValues: UseFormGetValues<any>
  cardData: TransactionCardData
  fabrics: Fabric[]
  onRemove: () => void
  isRemovable: boolean
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  index,
  control,
  watch,
  setValue,
  getValues,
  fabrics,
  onRemove,
  isRemovable,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>(fabrics)
  const [showFabricDropdown, setShowFabricDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const fabricName = watch(`cards.${index}.fabricName`)
  const quantityType = watch(`cards.${index}.quantityType`)
  const weight = watch(`cards.${index}.weight`)
  const useDiscount = watch(`cards.${index}.useDiscount`)
  const discountPerKg = watch(`cards.${index}.discountPerKg`)

  // Filter fabrics based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFabrics(fabrics)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      setFilteredFabrics(
        fabrics.filter((fabric) =>
          fabric.name.toLowerCase().includes(lowercasedSearch)
        )
      )
    }
  }, [searchTerm, fabrics])

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
      (sum: number, card: TransactionCardData) => sum + (card.totalPrice || 0),
      0
    )
    setValue("subTotal", subTotal)

    // Calculate total discount (sum of all discounts)
    const totalDiscount = cards.reduce(
      (sum: number, card: TransactionCardData) => sum + (card.discount || 0),
      0
    )
    setValue("totalDiscount", totalDiscount)

    // Calculate total transaction
    setValue("totalTransaction", subTotal - totalDiscount)
  }

  const quantityTypes = ["Ecer", "Grosir", "Roll"]

  return (
    <Card variant="outline" className="mb-4">
      <Text className="text-center text-2xl font-semibold">Item {index + 1}</Text>
      {isRemovable && (
        <Button
          onPress={onRemove}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="trash" size={18} color="#BF40BF" />
        </Button>
      )}

      <View>
        <Text className="mb-1">Nama Kain</Text>
        <Controller
          name={`cards.${index}.fabricName`}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <View className="relative">
              <Button
                onPress={() => {
                  setShowFabricDropdown(!showFabricDropdown)
                  setShowTypeDropdown(false)
                }}
                size="lg"
                className="bg-white border border-secondary-200 rounded-xl p-3 flex-row justify-between items-center"
              >
                <Text className="text-neutral-800">
                  {field.value || "Select fabric"}
                </Text>
                <Feather name="chevron-down" size={16} color="#888" />
              </Button>

              {showFabricDropdown && (
                <View className="absolute top-12 left-0 right-0 z-10 shadow-md bg-white border border-neutral-200 rounded-xl">
                  <View className="p-2">
                    <Input variant="outline" size="lg" className="bg-white">
                      <InputField
                        placeholder="Search fabrics..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="text-sm"
                      />
                      <Feather name="search" size={16} color="#888" />
                    </Input>
                  </View>
                  <ScrollView className="max-h-60">
                    {filteredFabrics.map((fabric) => (
                      <Button
                        key={fabric.code}
                        size="lg"
                        className="bg-white py-2 px-3 border-b border-neutral-100"
                        onPress={() => {
                          field.onChange(fabric.name)
                          setShowFabricDropdown(false)
                        }}
                      >
                        <Text className="text-neutral-800">{fabric.name}</Text>
                      </Button>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </Card>
  )
}

export default TransactionCard
