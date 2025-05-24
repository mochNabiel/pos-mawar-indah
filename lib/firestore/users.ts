import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/utils/firebase"
import { User, UserWithId } from "@/types/user"
import { createUserWithEmailAndPassword } from "firebase/auth"

const usersRef = collection(db, "users")


export const createUser = async (data: User & { password: string }) => {
  try {
    // Buat user di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    )

    const uid = userCredential.user.uid

    // Simpan data user ke Firestore
    await setDoc(doc(db, "users", uid), {
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt
    })

    return { success: true, uid }
  } catch (err) {
    console.error("Gagal membuat user:", err)
    throw err
  }
}

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersRef)
  const allUsers = snapshot.docs.map((doc) => {
    const t = doc.data()
    return {
      id: doc.id,
      ...t,
      createdAt: t.createdAt?.toDate?.() ?? new Date(t.createdAt),
    } as UserWithId
  })
  return allUsers
}

export const getUserByEmail = async (email: string): Promise<UserWithId | null> => {
  const q = query(collection(db, "users"), where("email", "==", email))
  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as UserWithId
  }

  return null
}

export const updateUser = async (
  id: string,
  data: Partial<{
    name: string
    role: "admin" | "superadmin"
  }>
) => {
  const userRef = doc(db, "users", id)
  await updateDoc(userRef, data)
}

export const deleteUser = async (email: string) => {
  const q = query(usersRef, where("email", "==", email))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("User dengan email tersebut tidak ditemukan")
  }

  const docId = snapshot.docs[0].id
  const docRef = doc(db, "users", docId)
  return deleteDoc(docRef)
}

export const isUserEmailUnique = async (email: string) => {
  const q = query(usersRef, where("email", "==", email))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
