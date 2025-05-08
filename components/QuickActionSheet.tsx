import { useRouter } from "expo-router"
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
} from "@/components/ui/actionsheet"
import React, { useState } from "react"
import { Feather } from "@expo/vector-icons"
import { View, Text } from "react-native"

export function useQuickActions() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return {
    open,
    openSheet: () => setOpen(true),
    closeSheet: () => setOpen(false),
    sheet: (
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {/* Tambah Transaksi */}
          <ActionsheetItem onPress={() => router.push("/transactions/new")}>
            <View className="flex-row items-center bg-white p-4 py-8 border border-gray-200 rounded-xl w-full">
              <Feather name="file-plus" size={32} color="#f97316" />
              <Text className="ml-3 text-xl font-semibold text-gray-900">
                Transaksi Baru
              </Text>
            </View>
          </ActionsheetItem>

          {/* Tambah Kain */}
          <ActionsheetItem onPress={() => router.push("/fabrics/new")}>
            <View className="flex-row items-center bg-white p-4 py-8 border border-gray-200 rounded-xl w-full">
              <Feather name="layers" size={32} color="#3b82f6" />
              <Text className="ml-3 text-xl font-semibold text-gray-900">
                Tambah Data Kain
              </Text>
            </View>
          </ActionsheetItem>

          {/* Tambah Pelanggan */}
          <ActionsheetItem onPress={() => router.push("/customers/new")}>
            <View className="flex-row items-center bg-white p-4 py-8 border border-gray-200 rounded-xl w-full">
              <Feather name="user-plus" size={32} color="#8b5cf6" />
              <Text className="ml-3 text-xl font-semibold text-gray-900">
                Tambah Data Customer
              </Text>
            </View>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    ),
  }
}
