import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/utils/firebase"

export async function registerSuperAdminOnce() {
  const email = "mawarindahtex@gmail.com"
  const password = "ghaghigha99"
  const name = "Mawar Indah"

  const { user } = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(user, { displayName: name })

  // Simpan data tambahan ke Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    role: "superadmin",
    email,
  })

  return user
}
