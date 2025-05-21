import React, { useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import "@/global.css"
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { Slot, useRouter, useSegments } from "expo-router"

import * as SplashScreen from "expo-splash-screen"
import * as NavigationBar from "expo-navigation-bar"

import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebase"
import { getCurrentUserData } from "@/lib/firebase/user"
import { Platform } from "react-native"

// Cegah splash screen menghilang otomatis
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const [isReady, setIsReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<"admin" | "superadmin" | null>(null)

  // Hide bottom bar
  const hideNavBar = async () => {
    if (Platform.OS === 'android') {
       await NavigationBar.setPositionAsync("absolute");
       await NavigationBar.setVisibilityAsync("hidden");
       await NavigationBar.setBehaviorAsync("overlay-swipe");
     }
  }

  useEffect(() => {
    const initialize = async () => {
      await hideNavBar()
      setIsReady(true)
    }

    initialize()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getCurrentUserData()
        setRole(data?.role ?? null)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setRole(null)
      }
      setIsReady(true)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isReady) return

    const group = segments[0]

    if (!isLoggedIn) {
      if (group !== "(auth)") {
        router.replace("/(auth)/login")
      }
    } else {
      if (group === "(auth)") {
        router.replace("/(tabs)")
      }

      if (group === "(protected)" && role !== "superadmin") {
        router.replace("/(tabs)")
      }
    }
  }, [isLoggedIn, isReady, role, segments])

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync()
    }
  }, [isReady])

  if (!isReady) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <Slot />
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}
