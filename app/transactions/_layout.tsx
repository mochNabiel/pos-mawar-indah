import React from "react"
import BackButton from "@/components/BackButton"
import { Stack } from "expo-router"

export default function TransactionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          title: "Transaksi Baru",
          headerLeft: () => <BackButton path="/" />,
        }}
      />
      <Stack.Screen
        name="[invCode]/index"
        options={{
          title: "Detail Transaksi",
          headerLeft: () => <BackButton path="/(tabs)/history" />,
        }}
      />
    </Stack>
  )
}
