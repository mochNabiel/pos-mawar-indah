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
import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import { notifySuperadmins } from "@/lib/helper/notifySuperAdmins"

const customersRef = collection(db, "customers")

export const createCustomer = async (data: Customer) => {
  const user = await getCurrentUserData()

  const docRef = await addDoc(customersRef, data)

  await addLog({
    adminName: user?.name,
    adminRole: user?.role,
    action: "tambah",
    target: "customer",
    targetId: docRef.id,
    description: `Customer baru ${data.name} telah ditambahkan`,
  })

  await notifySuperadmins({
    title: "Data Customer Baru",
    body: `Admin ${user?.name} telah menambahkan data customer baru.`,
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
  const user = await getCurrentUserData()

  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Customer dengan nama tersebut tidak ditemukan")
  }

  const customerDoc = snapshot.docs[0]
  const docRef = doc(db, "customers", customerDoc.id)

  await updateDoc(docRef, data)

  await addLog({
    adminName: user?.name,
    adminRole: user?.role,
    action: "update",
    target: "customer",
    targetId: customerDoc.id,
    description: `Data customer ${name} telah diupdate`,
  })

  await notifySuperadmins({
    title: "Data Customer Diupdate",
    body: `Admin ${user?.name} telah mengupdate data customer.`,
  })
}

export const deleteCustomerInDb = async (name: string) => {
  const user = await getCurrentUserData()

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
    adminName: user?.name,
    adminRole: user?.role,
    action: "hapus",
    target: "customer",
    targetId: customerDoc.id,
    description: `Data customer ${name} telah dihapus`,
  })

  await notifySuperadmins({
    title: "Data Customer Dihapus",
    body: `Admin ${user?.name} telah menghapus data customer.`,
  })
}

export const isCustomerNameUnique = async (name: string) => {
  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
