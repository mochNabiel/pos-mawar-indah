import { useEffect, useState } from "react"
import { getCurrentUserData, AppUser } from "@/lib/helper/getCurrentUserData"

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoadingCurrentUser(true)
      const data = await getCurrentUserData()
      setUser(data)
      setLoadingCurrentUser(false)
    }
    fetch()
  }, [])

  return { user, loadingCurrentUser }
}
