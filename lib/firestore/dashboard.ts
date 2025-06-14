import { TransactionWithId } from "@/types/transaction"
import { db } from "@/utils/firebase"
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"

// Fungsi untuk mengambil semua transaksi dari Firestore
export const getAllTransactions = async (): Promise<TransactionWithId[]> => {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  const transactions: TransactionWithId[] = snapshot.docs.map((doc) => {
    const data = doc.data()
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt)

    return {
      id: doc.id,
      ...data,
      createdAt,
    } as TransactionWithId
  })

  return transactions
}