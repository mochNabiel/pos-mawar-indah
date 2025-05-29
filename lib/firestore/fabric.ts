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
import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import { notifySuperadmins } from "@/lib/helper/notifySuperAdmins"

const fabricsRef = collection(db, "fabrics")

export const createFabric = async (data: Fabric) => {
  const docRef = await addDoc(fabricsRef, data)

  const user = await getCurrentUserData()

  await addLog({
    adminName: user?.name,
    adminRole: user?.role,
    action: "tambah",
    target: "kain",
    targetId: docRef.id,
    description: `Kain baru ${data.code} dengan nama ${data.name} telah ditambahkan`,
  })

  await notifySuperadmins({
    title: "Data Kain Baru",
    body: `Admin ${user?.name} telah menambahkan data kain baru.`,
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
  const user = await getCurrentUserData()

  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan kode tersebut tidak ditemukan")
  }

  const fabricDoc = snapshot.docs[0]

  const fabricData = fabricDoc.data() // Ambil Datanya sebelum di update

  try {
    await addLog({
      adminName: user?.name,
      adminRole: user?.role,
      action: "update",
      target: "kain",
      targetId: fabricDoc.id,
      description: `Data Kain ${data.code} dengan nama ${fabricData.name} telah diupdate`,
    })

    await notifySuperadmins({
      title: "Data Kain Diupdate",
      body: `Admin ${user?.name} telah mengupdate data kain.`,
    })
  } catch (err) {
    console.error("Gagal mencatat log sebelum update data kain:", err)
  }

  const docRef = doc(db, "fabrics", fabricDoc.id)
  await updateDoc(docRef, data)
}

export const deleteFabricInDb = async (code: string) => {
  const user = await getCurrentUserData()

  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan kode tersebut tidak ditemukan")
  }

  // Mengambil dokumen pertama dari hasil query dan menghapus berdasarkan ID
  const fabricDoc = snapshot.docs[0]

  const fabricData = fabricDoc.data() // Ambil data sebelum dihapus

  try {
    await addLog({
      adminName: user?.name,
      adminRole: user?.role,
      action: "hapus",
      target: "kain",
      targetId: fabricDoc.id,
      description: `Data Kain ${code} dengan nama ${fabricData.name} telah dihapus`,
    })

    await notifySuperadmins({
      title: "Data Kain Dihapus",
      body: `Admin ${user?.name} telah menghapus data kain.`,
    })

  } catch (err) {
    console.error("Gagal mencatat log sebelum hapus data kain:", err)
  }

  const docRef = doc(db, "fabrics", fabricDoc.id)
  await deleteDoc(docRef)
}

export const isFabricCodeUnique = async (code: string) => {
  const q = query(fabricsRef, where("code", "==", code))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
