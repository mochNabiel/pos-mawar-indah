import { useEffect, useState } from "react"
import { getCurrentUserData, AppUser } from "@/lib/firebase/user"

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const data = await getCurrentUserData()
      setUser(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return { user, loading }
}
