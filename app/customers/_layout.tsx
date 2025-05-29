import React from "react"
import BackButton from "@/components/BackButton"
import { Stack } from "expo-router"

export default function CustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          title: "Tambah Customer Baru",
          headerLeft: () => <BackButton path="/" />,
        }}
      />
      <Stack.Screen
        name="[name]/index"
        options={{
          title: "Detail Customer",
          headerLeft: () => <BackButton path="/customers" />,
        }}
      />
      <Stack.Screen
        name="[name]/edit"
        options={{
          title: "Edit Customer",
          headerLeft: () => <BackButton path="/customers" />,
        }}
      />
    </Stack>
  )
}
