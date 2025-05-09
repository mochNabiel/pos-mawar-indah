import React from "react"
import { View, Text } from "react-native"

import { UseFormGetValues } from "react-hook-form"

import { Card } from "@/components/ui/card"

interface TransactionSummaryProps {
  getValues: UseFormGetValues<any>
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  getValues,
}) => {
  const subTotal = getValues("subTotal") || 0
  const totalDiscount = getValues("totalDiscount") || 0
  const totalTransaction = getValues("totalTransaction") || 0

  return (
    <Card variant="outline" size="lg" className="flex bg-secondary-100 mb-5 mt-5 gap-2">
      <View className="flex flex-row justify-between items-center">
        <Text className="font-semibold text-xl text-self-purple">Sub Total</Text>
        <Text className="font-semibold text-2xl text-self-purple">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(subTotal)}
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center">
        <Text className="font-semibold text-xl text-self-purple">Diskon Total</Text>
        <Text className="font-semibold text-2xl text-self-purple">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(totalDiscount)}
        </Text>
      </View>

      <View className="bg-secondary-500" style={{ height: 1 }}></View>

      <View className="flex flex-row justify-between items-center">
        <Text className="font-bold text-2xl">Total Transaksi</Text>
        <Text className="font-bold text-2xl">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(totalTransaction)}
        </Text>
      </View>
    </Card>
  )
}

export default TransactionSummary
