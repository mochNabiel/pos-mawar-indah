import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Transaction, TransactionWithId } from "@/types/transaction" // Adjust the import based on your types

const transactionsRef = collection(db, "transactions")

// Create a new transaction
export const createTransaction = async (data: Transaction) => {
  return addDoc(transactionsRef, data)
}

// Get all transactions
export const getAllTransactions = async (): Promise<TransactionWithId[]> => {
  const snapshot = await getDocs(collection(db, "transactions"))
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to JavaScript Date
      createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
    }
  }) as TransactionWithId[]
}

// Get transaction by Invoice Code
export const getTransactionByInvCode = async (
  invCode: string
): Promise<TransactionWithId | null> => {
  const transactionsRef = collection(db, "transactions")
  const q = query(transactionsRef, where("invCode", "==", invCode))
  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0] // Get the first matching document
    const data = doc.data() as Omit<TransactionWithId, "id"> // Exclude 'id' from the data
    return { id: doc.id, ...data } // Now you can safely add the id
  } else {
    return null // No document found
  }
}

// Update a transaction by ID
export const updateTransactionInDb = async (
  id: string,
  data: Partial<Transaction>
) => {
  const docRef = doc(db, "transactions", id)
  return updateDoc(docRef, data)
}

// Delete a transaction by ID
export const deleteTransactionInDb = async (id: string) => {
  const docRef = doc(db, "transactions", id)
  return deleteDoc(docRef)
}
