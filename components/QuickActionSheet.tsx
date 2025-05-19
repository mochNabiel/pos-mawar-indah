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
import { Text } from "react-native"

import { Card } from "@/components/ui/card"

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
            <Card size="lg" variant="outline" className="w-full flex-row items-center rounded-xl gap-3">
              <Feather name="file-plus" size={32} color="#BF40BF" />
              <Text className="text-xl font-semibold text-gray-900">
                Transaksi Baru
              </Text>
            </Card>
          </ActionsheetItem>

          {/* Tambah Kain */}
          <ActionsheetItem onPress={() => router.push("/fabrics/new")}>
            <Card size="lg" variant="outline" className="w-full flex-row items-center rounded-xl gap-3">
              <Feather name="layers" size={32} color="#40BFBF" />
              <Text className="text-xl font-semibold text-gray-900">
                Tambah Data Kain
              </Text>
            </Card>
          </ActionsheetItem>

          {/* Tambah Pelanggan */}
          <ActionsheetItem onPress={() => router.push("/customers/new")} className="mb-6">
            <Card size="lg" variant="outline" className="w-full flex-row items-center rounded-xl gap-3">
              <Feather name="user-plus" size={32} color="#FFB740" />
              <Text className="text-xl font-semibold text-gray-900">
                Tambah Data Customer
              </Text>
            </Card>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    ),
  }
}
