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

// Get all transactions with infinite scroll
export const getPaginatedTransactions = async (page: number) => {
  // If page is 1, we need to reset the lastVisibleDoc
  if (page === 1) {
    resetPagination();
  }

  let q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );

  // If not the first page, start after the last visible document
  if (lastVisibleDoc) {
    q = query(q, startAfter(lastVisibleDoc));
  }

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  const data = snapshot.docs.map((doc) => {
    const t = doc.data();
    return {
      id: doc.id,
      ...t,
      createdAt: t.createdAt?.toDate?.() ?? new Date(t.createdAt),
    };
  }) as TransactionWithId[];

  return { data, lastDoc: lastVisibleDoc };
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
    const doc = querySnapshot.docs[0] 
    const data = doc.data() as Omit<TransactionWithId, "id">
    return { id: doc.id, ...data } 
  } else {
    return null 
  }
}

// Delete a transaction by ID
export const deleteTransactionInDb = async (id: string) => {
  const docRef = doc(db, "transactions", id)
  return deleteDoc(docRef)
}
