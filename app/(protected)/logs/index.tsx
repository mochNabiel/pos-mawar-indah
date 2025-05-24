import { View, Text } from "react-native"
import React from "react"

const LogsScreen = () => {
  return (
    <View className="flex-1 bg-white p-5">
      <Text>Halaman Logs dan hanya superadmin yg bisa akses</Text>
    </View>
  )
}

export default LogsScreen
