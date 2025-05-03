import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/utils/firebase"

export type AppUser = {
  name: string
  role: "admin" | "superadmin"
  email: string
}

export async function registerNewUser(
  email: string,
  password: string,
  name: string,
  role: "admin" | "superadmin"
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, "users", cred.user.uid), { name, role, email })
  return cred.user
}

export async function getCurrentUserData(): Promise<AppUser | null> {
  const user = auth.currentUser
  if (!user) return null

  try {
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
