import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Transaction, TransactionWithId } from "@/types/transaction"

const transactionsRef = collection(db, "transactions")

let lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
const pageLimit = 10

export const resetPagination = () => {
  lastVisibleDoc = null
}

export const getPaginatedTransactions = async () => {
  let q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  )

  if (lastVisibleDoc) {
    q = query(q, startAfter(lastVisibleDoc))
  }

  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1]
  }

  const data = snapshot.docs.map((doc) => {
    const t = doc.data()
    return {
      id: doc.id,
      ...t,
      createdAt: t.createdAt?.toDate?.() ?? new Date(t.createdAt),
    }
  }) as TransactionWithId[]

  return { data, lastDoc: lastVisibleDoc }
}

// Create a new transaction
export const createTransaction = async (data: Transaction) => {
  return addDoc(transactionsRef, data)
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
