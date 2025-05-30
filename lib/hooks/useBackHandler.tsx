import { useFocusEffect } from "expo-router"
import { BackHandler } from "react-native"
import { useRouter } from "expo-router"
import { useCallback } from "react"

export default function useBackHandler(targetPath: string) {
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace(targetPath as any)
        return true
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)

      return () => subscription.remove()
    }, [router, targetPath])
  )
}
