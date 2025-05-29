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
import { addLog } from "@/lib/firestore/logs"
import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import { notifySuperadmins } from "@/lib/helper/notifySuperAdmins"

const transactionsRef = collection(db, "transactions")

let lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
const pageLimit = 10

// Reset pagination dengan mengatur lastVisibleDoc ke null
export const resetPagination = () => {
  lastVisibleDoc = null
}

// Fungsi untuk mengambil transaksi yang dipaginasikan dengan filter opsional
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
    const paginated = filteredTransactions.slice(
      startIndex,
      startIndex + pageLimit
    )

    return { data: paginated, lastDoc: null }
  }

  // Jika tidak ada searchQuery, lakukan query firestore dengan pagination dan filter tanggal
  let q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  )

  if (startDate && endDate) {
    q = query(
      q,
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    )
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
  const user = await getCurrentUserData()

  const docRef = await addDoc(transactionsRef, data)

  await addLog({
    adminName: user?.name,
    adminRole: user?.role,
    action: "tambah",
    target: "transaksi",
    targetId: docRef.id,
    description: `Transaksi baru "${data.invCode}" untuk customer "${data.customerName}" telah dibuat`,
  })

  await notifySuperadmins({
    title: "Data Transaksi Baru",
    body: `Admin ${user?.name} telah menambahkan data transaksi baru.`,
  })

  return docRef
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
    const data = doc.data()

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
    } as TransactionWithId
  } else {
    return null
  }
}

// Hapus transaksi berdasarkan InvCode
export const deleteTransaction = async (invCode: string) => {
  const user = await getCurrentUserData()

  const q = query(transactionsRef, where("invCode", "==", invCode))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan InvCode tersebut tidak ditemukan")
  }

  // Mengambil dokumen pertama dari hasil query dan menghapus berdasarkan ID
  const transactionDoc = snapshot.docs[0]

  const transactionData = transactionDoc.data() // Ambil datanya dulu

  // Kirim log sebelum data dihapus
  try {
    await addLog({
      adminName: user?.name,
      adminRole: user?.role,
      action: "hapus",
      target: "transaksi",
      targetId: transactionDoc.id,
      description: `Transaksi "${invCode}" untuk customer "${transactionData.customerName}" telah dihapus`,
    })

    await notifySuperadmins({
      title: "Data Transaksi Dihapus",
      body: `Admin ${user?.name} telah menghapus data transaksi.`,
    })
  } catch (err) {
    console.error("Gagal mencatat log sebelum hapus transaksi:", err)
  }

  const docRef = doc(db, "transactions", transactionDoc.id)
  await deleteDoc(docRef)
}
