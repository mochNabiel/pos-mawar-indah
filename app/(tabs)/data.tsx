import { useRouter } from "expo-router"
import { View } from "react-native"
import React from "react"

import { Heading } from "@/components/ui/heading"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Pressable } from "@/components/ui/pressable"

import { Feather } from "@expo/vector-icons"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

const Data = () => {
  const router = useRouter()
  const { user, loading } = useCurrentUser()

  if (loading) return null

  return (
    <View className="flex-1 bg-white p-5">
      <Pressable onPress={() => router.push("/fabrics")} className="w-full">
        <Card
          size="lg"
          variant="outline"
          className="flex flex-row items-center gap-5 m-3"
        >
          <Feather name="file-text" size={24} color="black" />
          <View>
            <Heading size="lg" className="mb-1">
              Data Kain
            </Heading>
            <Text size="sm">Klik untuk melihat data kain</Text>
          </View>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push("/customers")} className="w-full">
        <Card
          size="lg"
          variant="outline"
          className="flex flex-row items-center gap-5 m-3"
        >
          <Feather name="user" size={24} color="black" />
          <View>
            <Heading size="lg" className="mb-1">
              Data Customer
            </Heading>
            <Text size="sm">Klik untuk melihat data customer</Text>
          </View>
        </Card>
      </Pressable>

      {user?.role === "superadmin" && (
        <>
          <Pressable
            onPress={() => router.push("/(protected)/logs" as any)}
            className="w-full"
          >
            <Card
              size="lg"
              variant="outline"
              className="flex-row items-center gap-5 m-3"
            >
              <Feather name="list" size={24} color="black" />
              <View>
                <Heading size="lg" className="mb-1">
                  Data Logs
                </Heading>
                <Text size="sm">Klik untuk melihat log aktivitas</Text>
              </View>
            </Card>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(protected)/admins" as any)}
            className="w-full"
          >
            <Card
              size="lg"
              variant="outline"
              className="flex-row items-center gap-5 m-3"
            >
              <Feather name="key" size={24} color="black" />
              <View>
                <Heading size="lg" className="mb-1">
                  Data Admin
                </Heading>
                <Text size="sm">Klik untuk melihat daftar admin</Text>
              </View>
            </Card>
          </Pressable>
        </>
      )}
    </View>
  )
}

export default Data
