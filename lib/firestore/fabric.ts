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
import { addLog } from "@/lib/firestore/logs"
import { getCurrentAdmin } from "@/lib/hooks/getCurrentAdmin"

// Mengambil data admin yang login untuk membuat logs
const { id: adminId, name: adminName } = getCurrentAdmin()

const fabricsRef = collection(db, "fabrics")

export const createFabric = async (data: Fabric) => {
  const docRef = await addDoc(fabricsRef, data)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: "create",
    target: "fabric",
    targetId: docRef.id,
    description: `Menambahkan kain baru dengan kode ${data.code}`,
  })

  return docRef
}

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
  await updateDoc(docRef, data)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: "update",
    target: "fabric",
    targetId: fabricDoc.id,
    description: `Memperbarui data kain dengan kode ${code}`,
  })
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
  await deleteDoc(docRef)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: "delete",
    target: "fabric",
    targetId: fabricDoc.id,
    description: `Menghapus kain dengan kode ${code}`,
  })
}

export const isFabricCodeUnique = async (code: string) => {
  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
