import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  where,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Transaction, TransactionWithId } from "@/types/transaction"

const transactionsRef = collection(db, "transactions")

let lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
const pageLimit = 10

// Reset pagination dengan mengatur lastVisibleDoc ke null
export const resetPagination = () => {
  lastVisibleDoc = null
}

// Ambil transaksi yang dipaginasikan dengan filter opsional
export const getPaginatedTransactions = async (
  page: number,
  searchQuery?: string,
  startDate?: Date,
  endDate?: Date
) => {
  // Jika halaman pertama, reset pagination
  if (page === 1) {
    resetPagination()
  }

  // Jika ada filter pencarian dengan searchQuery, kita ambil semua transaksi dulu lalu filter di client side
  if (searchQuery) {
    const snapshot = await getDocs(
      query(collection(db, "transactions"), orderBy("createdAt", "desc"))
    )

    // Map seluruh data lengkap dari dokumen
    const allTransactions = snapshot.docs.map((doc) => {
      const t = doc.data()
      return {
        id: doc.id,
        ...t,
        createdAt: t.createdAt?.toDate?.() ?? new Date(t.createdAt),
      } as TransactionWithId
    })

    // Filter dengan pencarian case-insensitive pada customerName
    let filteredTransactions = allTransactions.filter((transaction) =>
      transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter tanggal jika ada startDate dan/atau endDate
    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          transaction.createdAt >= startDate && transaction.createdAt <= endDate
      )
    } else if (startDate) {
      filteredTransactions = filteredTransactions.filter((transaction) => {
        const d = transaction.createdAt
        return (
          d.getFullYear() === startDate.getFullYear() &&
          d.getMonth() === startDate.getMonth() &&
          d.getDate() === startDate.getDate()
        )
      })
    }

    // Pagination client side
    const startIndex = (page - 1) * pageLimit
    const paginated = filteredTransactions.slice(startIndex, startIndex + pageLimit)

    return { data: paginated, lastDoc: null }
  }

  // Jika tidak ada searchQuery, lakukan query firestore dengan pagination dan filter tanggal
  let q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  )

  if (startDate && endDate) {
    q = query(q, where("createdAt", ">=", startDate), where("createdAt", "<=", endDate))
  }

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
    } as TransactionWithId
  })

  return { data, lastDoc: lastVisibleDoc }
}



// Buat transaksi baru
export const createTransaction = async (data: Transaction) => {
  return addDoc(transactionsRef, data)
}

// Ambil transaksi berdasarkan kode faktur
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

// Hapus transaksi berdasarkan ID
export const deleteTransactionInDb = async (id: string) => {
  const docRef = doc(db, "transactions", id)
  return deleteDoc(docRef)
}
