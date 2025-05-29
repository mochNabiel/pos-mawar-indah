import React, { useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import "@/global.css"
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { Slot, useRouter, useSegments } from "expo-router"

import * as SplashScreen from "expo-splash-screen"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebase"

import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import SplashLoader from "@/components/SplashLoader"

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const [isReady, setIsReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<"admin" | "superadmin" | null>(null)

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
      setIsReady(true) // Mark ready after auth state is resolved
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isReady) return

    const group = segments[0]

    if (!isLoggedIn && group !== "(auth)") {
      router.replace("/(auth)/login")
    } else if (isLoggedIn && group === "(auth)") {
      router.replace("/(tabs)")
    } else if (isLoggedIn && group === "(protected)" && role !== "superadmin") {
      router.replace("/(tabs)")
    }
  }, [isLoggedIn, isReady, role, segments])

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync()
    }
  }, [isReady])

  // Prevent UI from rendering until redirect decision is complete
  const shouldBlockRender = () => {
    if (!isReady) return true

    const group = segments[0]

    if (!isLoggedIn && group !== "(auth)") return true
    if (isLoggedIn && group === "(auth)") return true
    if (isLoggedIn && group === "(protected)" && role !== "superadmin")
      return true

    return false
  }

  if (shouldBlockRender()) {
    return <SplashLoader />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <Slot />
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}
