import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Transaction, TransactionWithId } from "@/types/transaction"
import { addLog } from "@/lib/firestore/logs"
import { getCurrentUserData } from "@/lib/helper/getCurrentUserData"
import { notifySuperadmins } from "@/lib/helper/notifySuperAdmins"

const transactionsRef = collection(db, "transactions")

// Function to fetch all transactions from Firestore
export const fetchAllTransactions = async (): Promise<TransactionWithId[]> => {
  const snapshot = await getDocs(
    query(transactionsRef, orderBy("createdAt", "desc"))
  )

  // Map snapshot results to an array of transactions with conversion of timestamp to Date
  const transactions: TransactionWithId[] = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt,
    } as TransactionWithId
  })

  return transactions
}

// Create a new transaction
export const createTransaction = async (data: Transaction) => {
  const user = await getCurrentUserData()

  const docRef = await addDoc(transactionsRef, data)

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

// Delete a transaction by InvCode
export const deleteTransaction = async (invCode: string) => {
  const user = await getCurrentUserData()

  const q = query(transactionsRef, where("invCode", "==", invCode))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Dokumen dengan InvCode tersebut tidak ditemukan")
  }

  // Get the first document from the query results and delete by ID
  const transactionDoc = snapshot.docs[0]

  const transactionData = transactionDoc.data() // Get the data first

  // Send log before data is deleted
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
