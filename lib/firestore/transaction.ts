import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  startAfter,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Transaction, TransactionWithId } from "@/types/transaction"
import { addLog } from "@/lib/firestore/logs"
import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import { notifySuperadmins } from "@/lib/helper/notifySuperAdmins"

const PAGE_SIZE = 5
const transactionsRef = collection(db, "transactions")

type GetTransactionsOptions = {
  customerName?: string
  startDate?: Date | null
  endDate?: Date | null
  lastDoc?: any
  pageSize?: number
}

export const getTransactions = async ({
  customerName,
  startDate,
  endDate,
  lastDoc,
  pageSize = PAGE_SIZE,
}: GetTransactionsOptions): Promise<{
  data: TransactionWithId[]
  lastDoc: any
  isLastPage: boolean
}> => {
  try {
    const hasCustomerFilter = customerName && customerName.trim() !== ""
    const hasDateFilter = !!startDate

    const constraints: any[] = []

    // Filter customerName (case-insensitive)
    if (hasCustomerFilter) {
      constraints.push(
        where("customerName", ">=", customerName!.toUpperCase()),
        where("customerName", "<=", customerName!.toUpperCase() + "\uf8ff")
      )
    }

    // Filter tanggal
    if (hasDateFilter) {
      const start = new Date(startDate!)
      const end = endDate
        ? new Date(endDate)
        : new Date(
            startDate!.getFullYear(),
            startDate!.getMonth(),
            startDate!.getDate() + 1
          )
      constraints.push(where("createdAt", ">=", start))
      constraints.push(where("createdAt", "<", end))
    }

    // Susun orderBy sesuai kebutuhan
    if (hasCustomerFilter) {
      constraints.unshift(orderBy("customerName"))
    }

    constraints.push(orderBy("createdAt", "desc"))

    if (lastDoc) {
      constraints.push(startAfter(lastDoc))
    }

    constraints.push(limit(pageSize))

    const q = query(transactionsRef, ...constraints)
    const snapshot = await getDocs(q)

    const data: TransactionWithId[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt:
        doc.data().createdAt?.toDate?.() ?? new Date(doc.data().createdAt),
    })) as TransactionWithId[]

    return {
      data,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      isLastPage: snapshot.empty || snapshot.size < pageSize,
    }
  } catch (error) {
    console.error("Error getTransactions:", error)
    return { data: [], lastDoc: null, isLastPage: true }
  }
}

// Ambil transaksi berdasarkan invCode
export const getTransactionByInvCode = async (
  invCode: string
): Promise<TransactionWithId | undefined> => {
  try {
    const q = query(transactionsRef, where("invCode", "==", invCode))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      console.error("Transaksi tidak ditemukan untuk invCode:", invCode)
      return undefined
    }

    const transactionDoc = snapshot.docs[0]
    const transactionData = {
      id: transactionDoc.id,
      ...transactionDoc.data(),
      createdAt:
        transactionDoc.data().createdAt?.toDate?.() ??
        new Date(transactionDoc.data().createdAt),
    } as TransactionWithId

    return transactionData
  } catch (error) {
    console.error("Error getting transaction by invCode:", error)
    return undefined
  }
}

// Buat Transaksi baru
export const createTransaction = async (data: Transaction) => {
  const user = await getCurrentUserData()

  const finalData = {
    ...data,
    // createdAt: serverTimestamp(),
  }
  const docRef = await addDoc(transactionsRef, finalData)

  await addLog({
    adminName: user?.name,
    adminRole: user?.role,
    action: "tambah",
    target: "transaksi",
    targetId: docRef.id,
    description: `Transaksi baru ${data.invCode} untuk ${data.customerName} telah dibuat`,
  })

  await notifySuperadmins({
    title: "Data Transaksi Baru",
    body: `Admin ${user?.name} telah menambahkan data transaksi baru.`,
  })

  return docRef
}

// Hapus transaksi berdasar InvCode
export const deleteTransaction = async (invCode: string) => {
  const user = await getCurrentUserData()

  const q = query(transactionsRef, where("invCode", "==", invCode))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan InvCode tersebut tidak ditemukan")
  }

  const transactionDoc = snapshot.docs[0]

  const transactionData = transactionDoc.data()

  try {
    await addLog({
      adminName: user?.name,
      adminRole: user?.role,
      action: "hapus",
      target: "transaksi",
      targetId: transactionDoc.id,
      description: `Transaksi ${invCode} untuk ${transactionData.customerName} telah dihapus`,
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
