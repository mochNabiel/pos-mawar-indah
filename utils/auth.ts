import { signOut } from "firebase/auth"
import { auth } from "@/utils/firebase"

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
  }
}
