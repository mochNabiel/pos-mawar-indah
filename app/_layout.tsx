import "@/global.css"
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import { Slot, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import * as SplashScreen from "expo-splash-screen"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebase"
import { getCurrentUserData } from "@/lib/firebase/user"

// Cegah splash screen menghilang otomatis
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
      setIsReady(true)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isReady) return

    const group = segments[0] // contoh: "(auth)", "(protected)", "customers", etc.

    if (!isLoggedIn) {
      // Belum login, hanya boleh akses (auth)
      if (group !== "(auth)") {
        router.replace("/(auth)/login")
      }
    } else {
      // Sudah login, tidak boleh kembali ke login
      if (group === "(auth)") {
        router.replace("/(tabs)")
      }

      // Jika admin akses (protected), tolak
      if (group === "(protected)" && role !== "superadmin") {
        router.replace("/(tabs)")
      }
    }
  }, [isLoggedIn, isReady, role, segments])

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])

  if (!isReady) return null

  return (
    <GluestackUIProvider mode="light">
      <Slot />
    </GluestackUIProvider>
  )
}
