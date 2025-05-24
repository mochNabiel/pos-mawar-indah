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
import { Customer, CustomerWithId } from "@/types/customer"
import { addLog } from "@/lib/firestore/logs"
import { getCurrentAdmin } from "@/lib/hooks/getCurrentAdmin"

// Mengambil data admin yang login untuk membuat logs
const { id: adminId, name: adminName } = getCurrentAdmin()

const customersRef = collection(db, "customers")

export const createCustomer = async (data: Customer) => {
  const docRef = await addDoc(customersRef, data)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: 'create',
    target: 'customer',
    targetId: docRef.id,
    description: `Menambahkan customer baru dengan nama ${data.name}`,
  })

  return docRef
}
  

export const getAllCustomers = async (): Promise<CustomerWithId[]> => {
  const snapshot = await getDocs(customersRef)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Customer),
  }))
}

export const updateCustomerInDb = async (
  name: string,
  data: Partial<Customer>
) => {
  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan nama tersebut tidak ditemukan")
  }

  const customerDoc = snapshot.docs[0]
  const docRef = doc(db, "customers", customerDoc.id)
  await updateDoc(docRef, data)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: 'update',
    target: 'customer',
    targetId: customerDoc.id,
    description: `Memperbarui data customer ${name}`,
  })
}

export const deleteCustomerInDb = async (name: string) => {
  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan nama tersebut tidak ditemukan")
  }

  // Mengambil dokumen pertama dari hasil query dan menghapus berdasarkan ID
  const customerDoc = snapshot.docs[0]
  const docRef = doc(db, "customers", customerDoc.id)
  await deleteDoc(docRef)

  await addLog({
    adminId: adminId,
    adminName: adminName,
    action: 'delete',
    target: 'customer',
    targetId: customerDoc.id,
    description: `Menghapus customer dengan nama ${name}`,
  })
}

export const isCustomerNameUnique = async (name: string) => {
  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
