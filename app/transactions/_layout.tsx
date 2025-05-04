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
    </Stack>
  )
}
