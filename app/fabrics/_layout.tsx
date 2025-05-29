import React from "react"
import BackButton from "@/components/BackButton"
import { Stack } from "expo-router"

export default function FabricsLayout() {
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
          title: "Tambah Kain Baru",
          headerLeft: () => <BackButton path="/" />,
        }}
      />
      <Stack.Screen
        name="[code]/index"
        options={{
          title: "Detail Kain",
          headerLeft: () => <BackButton path="/fabrics" />,
        }}
      />
      <Stack.Screen
        name="[code]/edit"
        options={{
          title: "Edit Kain",
          headerLeft: () => <BackButton path="/fabrics" />,
        }}
      />
    </Stack>
  )
}
