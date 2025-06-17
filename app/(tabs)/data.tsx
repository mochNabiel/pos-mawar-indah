import React from "react"
import { useRouter } from "expo-router"
import { View } from "react-native"

import { Heading } from "@/components/ui/heading"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Pressable } from "@/components/ui/pressable"

import { Feather } from "@expo/vector-icons"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"
import LoadingMessage from "@/components/LoadingMessage"
import GradientCard from "@/components/GradientCard"

const Data = () => {
  const router = useRouter()
  const { user, loadingCurrentUser } = useCurrentUser()

  if (loadingCurrentUser) {
    return <LoadingMessage message="Memuat Data..." />
  }

  return (
    <View className="flex-1 bg-white p-5 justify-center">
      <Pressable onPress={() => router.push("/fabrics")} className="w-full">
        <Card
          size="lg"
          variant="outline"
          className="flex flex-row items-center gap-5 mb-3"
        >
          <Feather name="layers" size={32} color="#BF40BF" />
          <View>
            <Heading size="lg" className="mb-1">
              Data Kain
            </Heading>
            <Text size="lg">Klik untuk melihat data kain</Text>
          </View>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push("/customers")} className="w-full">
        <Card
          size="lg"
          variant="outline"
          className="flex flex-row items-center gap-5 mb-3"
        >
          <Feather name="users" size={32} color="#40BFBF" />
          <View>
            <Heading size="lg" className="mb-1">
              Data Customer
            </Heading>
            <Text size="lg">Klik untuk melihat data customer</Text>
          </View>
        </Card>
      </Pressable>

      {user && user.role == "superadmin" && (
        <>
          <Pressable
            onPress={() => router.push("/(protected)/logs" as any)}
            className="w-full"
          >
            <Card
              size="lg"
              variant="outline"
              className="flex-row items-center gap-5 mb-3"
            >
              <Feather name="bell" size={32} color="#FFB740" />
              <View>
                <Heading size="lg" className="mb-1">
                  Data Logs
                </Heading>
                <Text size="lg">Klik untuk melihat log aktivitas</Text>
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
              className="flex-row items-center gap-5 mb-3"
            >
              <Feather name="lock" size={32} color="#3D8B37" />
              <View>
                <Heading size="lg" className="mb-1">
                  Data Admin
                </Heading>
                <Text size="lg">Klik untuk melihat daftar admin</Text>
              </View>
            </Card>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push("/(protected)/fabric-recap/forecast-fabric" as any)
            }
            className="w-full"
          >
            <Card size="lg" className="p-0">
              <GradientCard>
                <View className="flex-row items-center gap-5 p-5 py-3">
                  <Feather name="trending-up" size={32} color="white" />
                  <View className="flex-1">
                    <Heading size="lg" className="mb-1 text-secondary-50">
                      Prediksi Penjualan Kain
                    </Heading>
                    <Text size="lg" className="text-secondary-100">
                      Klik untuk prediksi penjualan 
                    </Text>
                  </View>
                </View>
              </GradientCard>
            </Card>
          </Pressable>
        </>
      )}
    </View>
  )
}

export default Data
