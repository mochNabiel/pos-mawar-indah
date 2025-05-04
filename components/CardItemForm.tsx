import { View, Text, TextInput, Switch } from "react-native"
import SelectDropdown from "react-native-select-dropdown"
import { Picker } from "@react-native-picker/picker"

import { TransactionCard } from "@/types/transaction"
import { SelectFabricDropdown } from "./SelectFabricDropdown"
import { SelectQuantityType } from "./SelectQuantityTypes"

type Props = {
  card: TransactionCard
  onChange: (id: number, updated: Partial<TransactionCard>) => void
  onDelete: (id: number) => void
}

export default function CardItemForm({ card, onChange, onDelete }: Props) {
  const handleQuantityTypeChange = (type: "ecer" | "grosir" | "roll") => {
    onChange(card.id, { quantityType: type })
    // Reset fabricName to recalculate price
    if (card.fabricName) {
      onChange(card.id, { fabricName: undefined, pricePerKg: 0, totalPrice: 0 })
    }
  }

  const handleWeightChange = (text: string) => {
    const weight = parseFloat(text) || 0
    const totalPrice = weight * card.pricePerKg
    const discount = card.useDiscount ? weight * (card.discountPerKg || 0) : 0
    onChange(card.id, { weight: text, totalPrice, discount })
  }

  const handleDiscountChange = (text: string) => {
    const discountPerKg = parseFloat(text) || 0
    const discount = parseFloat(card.weight) * discountPerKg
    onChange(card.id, { discountPerKg, discount })
  }

  return (
    <View className="border border-gray-300 rounded-xl p-4 my-2 bg-white">
      <Text className="text-base font-semibold mb-1">Kain</Text>
      <SelectFabricDropdown
        control={control}
        name={`cards[${index}].fabricName`}
      />

      <Text className="mt-4 mb-1 text-base font-semibold">Tipe Kuantitas</Text>
      <SelectQuantityType
        control={control}
        name={`cards[${index}].quantityType`}
      />

      <Text className="mt-4 mb-1 text-base font-semibold">Berat (kg)</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 bg-white"
        keyboardType="numeric"
        placeholder="Masukkan berat"
        value={card.weight}
        onChangeText={handleWeightChange}
      />

      <Text className="mt-4 text-base">
        Harga/kg: Rp {card.pricePerKg.toLocaleString()}
      </Text>

      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-base font-semibold">Gunakan Diskon?</Text>
        <Switch
          value={card.useDiscount}
          onValueChange={(val) => {
            onChange(card.id, {
              useDiscount: val,
              discountPerKg: val ? 0 : undefined,
              discount: val ? 0 : 0,
            })
          }}
        />
      </View>

      {card.useDiscount && (
        <>
          <Text className="mt-4 mb-1 text-base font-semibold">Diskon/kg</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 bg-white"
            keyboardType="numeric"
            placeholder="Masukkan diskon/kg"
            value={card.discountPerKg?.toString() || ""}
            onChangeText={handleDiscountChange}
          />
        </>
      )}

      <View className="mt-4">
        <Text className="text-base font-semibold text-gray-900">
          Total Harga: Rp {card.totalPrice.toLocaleString()}
        </Text>
        {card.useDiscount && (
          <Text className="text-base text-gray-600">
            Diskon: Rp {card.discount.toLocaleString()}
          </Text>
        )}
      </View>

      <View className="mt-4">
        <Text
          onPress={() => onDelete(card.id)}
          className="text-red-600 font-semibold text-center"
        >
          Hapus
        </Text>
      </View>
    </View>
  )
}
