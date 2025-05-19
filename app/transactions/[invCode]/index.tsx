import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { TransactionWithId } from "@/types/transaction"
import { getTransactionByInvCode } from "@/lib/firestore/transaction"
import * as Print from "expo-print"
import { Button, ButtonText } from "@/components/ui/button"
import ReceiptPrintTemplate from "@/components/ReceiptPrintTemplate"
import { Card } from "@/components/ui/card"

export default function TransactionDetail() {
  const { invCode } = useLocalSearchParams<{ invCode: string }>()
  const [transaction, setTransaction] = useState<TransactionWithId | null>(null)

  // Ambil data transaksi berdasarkan invCode saat komponen dimount
  useEffect(() => {
    const fetchDetail = async () => {
      if (!invCode) return
      try {
        const data = await getTransactionByInvCode(invCode)
        setTransaction(data)
      } catch (error) {
        Alert.alert("Error", "Gagal mengambil data transaksi")
      }
    }
    fetchDetail()
  }, [invCode])

  // Fungsi handle print PDF
  const handlePrint = async () => {
    if (!transaction) return
    try {
      const html = ReceiptPrintTemplate({ transaction })
      await Print.printAsync({ html })
    } catch (error) {
      Alert.alert("Error", "Gagal mencetak struk")
    }
  }

  if (!transaction) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Memuat data transaksi...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <View className="mb-4">
        <Text className="text-2xl font-semibold">Toko Kain Mawar Indah</Text>
        <Text>Jl. Duren No.18 Gedangan</Text>
        <Text>Kec. Grogol, Kab. Sukoharjo, Jawa Tengah</Text>
      </View>

      {/* Invoice Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <View className="mb-3">
            <Text className="font-semibold text-secondary-800 mb-1">
              Invoice
            </Text>
            <Text className="font-semibold">#{transaction.invCode}</Text>
          </View>

          <View className="mb-3">
            <Text className="font-semibold text-secondary-800 mb-1">
              Customer
            </Text>
            <Text className="font-semibold">{transaction.customerName}</Text>
          </View>
        </View>
        <View>
          <View className="flex items-end mb-3">
            <Text className="font-semibold text-secondary-800 mb-1">
              Tanggal
            </Text>
            <Text className="font-semibold">
              {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <View className="flex items-end mb-3">
            <Text className="font-semibold text-secondary-800 mb-1">Waktu</Text>
            <Text className="font-semibold">
              {new Date(transaction.createdAt).toLocaleTimeString("id-ID", {
                second: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Invoice Body */}
      <View className="flex-row items-center bg-secondary-100 border-b border-gray-300 p-2 py-3">
        <Text className="flex-1 font-semibold text-left">Nama</Text>
        <Text className="flex-1 font-semibold text-center">Harga</Text>
        <Text className="flex-1 font-semibold text-center">Qty (kg)</Text>
        <Text className="flex-1 font-semibold text-right">Total</Text>
      </View>

      {transaction.cards.map((card, idx) => (
        <View key={idx}>
          <View className="flex-row items-center border-b border-gray-300 p-2">
            <Text className="flex-1 text-left">{card.fabricName}</Text>
            <Text className="flex-1 text-center">
              {card.pricePerKg.toLocaleString("id-ID")}
            </Text>
            <Text className="flex-1 text-center">{card.weight}</Text>
            <Text className="flex-1 text-right">
              {card.totalPrice.toLocaleString("id-ID")}
            </Text>
          </View>
          {card.useDiscount && (
            <View className="flex-row items-center border-b border-gray-300 p-2">
              <Text className="flex-1 text-left">Diskon</Text>
              <Text className="flex-1 text-center">
                -{(card.discountPerKg ?? 0).toLocaleString("id-ID")}
              </Text>
              <Text className="flex-1 text-center"></Text>
              <Text className="flex-1 text-right">
                -{card.discount.toLocaleString("id-ID")}
              </Text>
            </View>
          )}
        </View>
      ))}

      {/* Invoice Footer */}
      <Card variant="ghost" className="p-0 py-2 mt-4">
        {transaction.totalDiscount > 0 && (
          <>
            {/* Sub Total transaksi */}
            <View className="p-2 py-0 flex-row items-center justify-between">
              <Text>Sub Total</Text>
              <Text>{transaction.subTotal.toLocaleString("id-ID")}</Text>
            </View>

            {/* Diskon transaksi */}
            <View className="p-2 py-0 flex-row items-center justify-between">
              <Text>Total Diskon</Text>
              <Text>-{transaction.totalDiscount.toLocaleString("id-ID")}</Text>
            </View>
          </>
        )}

        {/* Total transaksi */}
        <View className="p-2 py-0 flex-row items-center justify-between">
          <Text className="text-xl font-semibold">Total Transaksi</Text>
          <Text className="text-xl font-semibold">
            {transaction.totalTransaction.toLocaleString("id-ID")}
          </Text>
        </View>
      </Card>

      {/* Tombol Cetak PDF */}
      <Button onPress={handlePrint} className="rounded-lg mt-4">
        <ButtonText>Cetak PDF</ButtonText>
      </Button>
    </ScrollView>
  )
}
