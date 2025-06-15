import { useEffect, useState } from "react"
import { getCurrentUserData, AppUser } from "@/lib/helper/getCurrentUserData"

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const data = await getCurrentUserData()
      setUser(data)
      setLoadingCurrentUser(false)
    }
    fetch()
  }, [])

  return { user, loadingCurrentUser }
}
