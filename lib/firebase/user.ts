import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/utils/firebase"

export type AppUser = {
  name: string
  role: "admin" | "superadmin"
  email: string
}

export async function getCurrentUserData(): Promise<AppUser | null> {
  try {
    const user = auth.currentUser
    if (!user) return null

    const snap = await getDoc(doc(db, "users", user.uid))
    if (!snap.exists()) return null

    const data = snap.data()
    return {
      name: data.name,
      role: data.role,
      email: data.email,
    }
  } catch (error) {
    console.error("Gagal ambil data user:", error)
    return null
  }
}
