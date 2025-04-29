import "@/global.css"
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { Slot, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import * as SplashScreen from "expo-splash-screen"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebase"
import { View } from "react-native"

// Cegah splash screen menghilang otomatis
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Cek apakah pengguna sedang login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setIsAuthChecked(true)
    })

    return () => unsubscribe()
  }, [])

  // Redirect user jika belum login
  useEffect(() => {
    if (!isAuthChecked) return

    const inAuthGroup = segments[0] === "(auth)"
    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login")
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [isLoggedIn, isAuthChecked, segments])

  // Sembunyikan splash screen setelah auth check selesai
  useEffect(() => {
    if (isAuthChecked) {
      SplashScreen.hideAsync()
    }
  }, [isAuthChecked])

  if (!isAuthChecked) {
    return null
  }

  return (
    <GluestackUIProvider mode="light">
      <Slot />
    </GluestackUIProvider>
  )
}
