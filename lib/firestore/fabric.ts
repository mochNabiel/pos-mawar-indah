import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Fabric, FabricWithId } from "@/types/fabric"

const fabricsRef = collection(db, "fabrics")

export const createFabric = async (data: Fabric) => addDoc(fabricsRef, data)

export const getAllFabrics = async (): Promise<FabricWithId[]> => {
  const snapshot = await getDocs(fabricsRef)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Fabric),
  }))
}

export const updateFabricInDb = async (code: string, data: Partial<Fabric>) => {
  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan kode tersebut tidak ditemukan")
  }

  const fabricDoc = snapshot.docs[0]
  const docRef = doc(db, "fabrics", fabricDoc.id)
  return updateDoc(docRef, data)
}

export const deleteFabricInDb = async (code: string) => {
  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan kode tersebut tidak ditemukan")
  }

  // Mengambil dokumen pertama dari hasil query dan menghapus berdasarkan ID
  const fabricDoc = snapshot.docs[0]
  const docRef = doc(db, "fabrics", fabricDoc.id)
  return deleteDoc(docRef)
}

export const isFabricCodeUnique = async (code: string) => {
  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
