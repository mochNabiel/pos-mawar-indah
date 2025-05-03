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

const customersRef = collection(db, "customers")

export const createCustomer = async (data: Customer) =>
  addDoc(customersRef, data)

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
  return updateDoc(docRef, data)
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
  return deleteDoc(docRef)
}

export const isCustomerNameUnique = async (name: string) => {
  const q = query(customersRef, where("name", "==", name))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
