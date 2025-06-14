import React, { useEffect, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Print from "expo-print"

import { deleteTransaction } from "@/lib/firestore/transaction"
import useTransactionStore from "@/lib/zustand/useTransactionStore"
import useToastMessage from "@/lib/hooks/useToastMessage"

import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"

import ReceiptPrintTemplate from "@/components/ReceiptPrintTemplate"
import LoadingMessage from "@/components/LoadingMessage"
import { Image } from "react-native"
import { Center } from "@/components/ui/center"

export default function TransactionDetail() {
  const { invCode } = useLocalSearchParams<{ invCode: string }>()
  const router = useRouter()
  const { showToast } = useToastMessage()

  const { transaction, getTransactionDetail } = useTransactionStore()

  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    if (invCode) {
      getTransactionDetail(invCode)
    }
  }, [invCode])

  const handlePrint = async () => {
    if (!transaction) return
    try {
      const html = ReceiptPrintTemplate({ transaction })
      await Print.printAsync({ html })
    } catch (error) {
      showToast("Gagal mencetak transaksi", "error")
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    try {
      await deleteTransaction(invCode!)
      showToast("Transaksi berhasil dihapus", "success")
      router.push("/(tabs)/history")
    } catch (error) {
      showToast("Gagal menghapus transaksi", "error")
    } finally {
      setShowModal(false)
    }
  }

  if (!transaction) {
    return <LoadingMessage message="Memuat Data Transaksi..." />
  }

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Perusahaan */}
      <Center>
        <View className="flex-row gap-2 items-start mb-5">
          <Image
            source={require("@/assets/images/mawarindah.png")}
            style={{ width: 60, height: 60 }}
          />
          <View>
            <Text className="text-2xl font-semibold">
              Toko Kain Mawar Indah
            </Text>
            <Text>Jl. Duren No.18 Gedangan</Text>
            <Text>Kec. Grogol, Kab. Sukoharjo, Jawa Tengah</Text>
          </View>
        </View>
      </Center>

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
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <View className="flex items-end mb-3">
            <Text className="font-semibold text-secondary-800 mb-1">Waktu</Text>
            <Text className="font-semibold">
              {new Date(transaction.createdAt).toLocaleTimeString("id-ID", {
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
            <View className="p-2 py-0 flex-row items-center justify-between">
              <Text>Sub Total</Text>
              <Text>{transaction.subTotal.toLocaleString("id-ID")}</Text>
            </View>
            <View className="p-2 py-0 flex-row items-center justify-between">
              <Text>Total Diskon</Text>
              <Text>-{transaction.totalDiscount.toLocaleString("id-ID")}</Text>
            </View>
          </>
        )}
        <View className="p-2 py-0 flex-row items-center justify-between">
          <Text className="text-xl font-semibold">Total Transaksi</Text>
          <Text className="text-xl font-semibold">
            {transaction.totalTransaction.toLocaleString("id-ID")}
          </Text>
        </View>
      </Card>

      {/* Print PDF Button */}
      <Button onPress={handlePrint} size="lg" className="rounded-lg mt-4">
        <ButtonText>Cetak PDF</ButtonText>
      </Button>

      {/* Delete Transaction Button */}
      <Button
        onPress={() => setShowModal(true)}
        size="lg"
        variant="outline"
        action="negative"
        className="rounded-lg mt-4"
      >
        <ButtonText className="text-red-500">Hapus Transaksi</ButtonText>
      </Button>

      {/* Confirmation Modal for Deletion */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <Text className="text-center text-lg">
              Apakah Anda yakin ingin menghapus transaksi ini?
            </Text>
          </ModalBody>
          <ModalFooter className="flex-row gap-3 justify-between">
            <Button
              onPress={() => setShowModal(false)}
              size="lg"
              className="flex-1 rounded-lg"
            >
              <ButtonText>Batal</ButtonText>
            </Button>
            <Button
              onPress={handleDelete}
              variant="outline"
              action="negative"
              size="lg"
              className="flex-1 rounded-lg"
            >
              <ButtonText className="text-red-500">Hapus</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollView>
  )
}
