import React, { useEffect, useRef } from "react"
import { Tabs, useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { LogBox, Pressable } from "react-native"
import * as Notifications from "expo-notifications"
import { useQuickActions } from "@/components/QuickActionSheet"
import { registerForPushNotificationsAsync } from "@/lib/helper/notification"
import { saveExpoPushToken } from "@/lib/helper/saveExpoPushToken"

// Notification handler terbaru wajib me return semua properti ini
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function TabsLayout() {
  const { openSheet, sheet } = useQuickActions()
  const router = useRouter()

  // Bug Pada pick bulan dan tahun di dashboard (Warning: useInsertionEffect must not schedule updates.)
  // Dibawah adalah perintah untuk menghilangkan dialog warning
  LogBox.ignoreLogs(["Warning: useInsertionEffect must not schedule updates"])

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  )
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) saveExpoPushToken(token)
        else console.warn("Token push notification kosong")
      })
      .catch((err) => {
        console.warn("Gagal register push notification:", err)
      })

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification)
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User interacted with notification:", response)
        const screen = response.notification.request.content.data.screen
        if (screen === "logs") {
          router.push("/(protected)/logs")
        }
      })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "semibold",
          },
          tabBarActiveTintColor: "#BF40BF",
          tabBarStyle: {
            height: 70,
            paddingTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Beranda",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color, size }) => (
              <Feather name="clock" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quick"
          options={{
            tabBarButton: () => (
              <Pressable
                onPress={openSheet}
                style={{
                  top: -35,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#BF40BF",
                  width: 65,
                  height: 65,
                  borderRadius: 35,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 8,
                }}
              >
                <Feather name="plus" size={28} color="white" />
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="data"
          options={{
            title: "Data",
            tabBarIcon: ({ color, size }) => (
              <Feather name="folder" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Pengaturan",
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {sheet}
    </>
  )
}
