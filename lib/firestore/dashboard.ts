import { TransactionWithId } from "@/types/transaction"
import { db } from "@/utils/firebase"
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore"

// Mengambil semua transaksi dari Firestore
export const getAllTransactions = async (): Promise<TransactionWithId[]> => {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt)
    return {
      id: doc.id,
      ...data,
      createdAt,
    }
  }) as TransactionWithId[]
}

// Fungsi untuk mendapatkan rentang tanggal berdasarkan tipe (daily, weekly, monthly)
const getDateRange = (
  type: "daily" | "weekly" | "monthly",
  date = new Date()
) => {
  let startDate: Date
  let endDate: Date

  if (type === "daily") {
    startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
  } else if (type === "weekly") {
    startDate = new Date(date)
    startDate.setDate(date.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
  } else {
    // monthly
    startDate = new Date(date.getFullYear(), date.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  }

  return {
    start: Timestamp.fromDate(startDate),
    end: Timestamp.fromDate(endDate),
    startDate,
    endDate,
  }
}

// Fungsi untuk mendapatkan rekap penjualan berdasarkan tipe (daily, weekly, monthly)
export const getSalesRecap = async (type: "daily" | "weekly" | "monthly") => {
  const { start, end } = getDateRange(type)

  const q = query(
    collection(db, "transactions"),
    where("createdAt", ">=", start),
    where("createdAt", "<=", end)
  )

  const snapshot = await getDocs(q)

  let totalTransactions = 0
  let totalWeight = 0
  let totalRevenue = 0

  snapshot.forEach((doc) => {
    const data = doc.data() as TransactionWithId
    totalTransactions += 1
    totalRevenue += data.totalTransaction
    totalWeight += data.cards.reduce(
      (sum, card) => sum + parseFloat(card.weight),
      0
    )
  })

  return {
    transactions: totalTransactions,
    totalFabricSold: parseFloat(totalWeight.toFixed(2)),
    totalRevenue,
  }
}

type CustomerSummary = {
  name: string
  totalWeight: number
  totalTransaction: number
}

export const getTopCustomers = async () => {
  // Ambil range tanggal bulan ini
  const { start, end } = getDateRange("monthly")

  // Ambil semua transaksi bulan ini
  const transactionSnapshot = await getDocs(
    query(
      collection(db, "transactions"),
      where("createdAt", ">=", start),
      where("createdAt", "<", end)
    )
  )

  const transactions = transactionSnapshot.docs.map((doc) => doc.data())

  // Ambil semua customer
  const customersSnapshot = await getDocs(collection(db, "customers"))
  const customers = customersSnapshot.docs.map((doc) => doc.data())

  const summaries: CustomerSummary[] = customers.map((customer) => {
    // Filter transaksi yang cocok dengan nama customer
    const customerTransactions = transactions.filter(
      (tx) => tx.customerName === customer.name
    )

    // Hitung total berat dan transaksi
    const totalWeight = customerTransactions.reduce((total, tx) => {
      const weightSum =
        tx.cards?.reduce((sum: number, card: any) => {
          return sum + parseFloat(card.weight || "0")
        }, 0) || 0
      return total + weightSum
    }, 0)

    const totalTransaction = customerTransactions.reduce(
      (sum, tx) => sum + (tx.totalTransaction || 0),
      0
    )

    return {
      name: customer.name,
      totalWeight,
      totalTransaction,
    }
  })

  // Ambil top 5 berdasarkan total berat
  const byWeight = [...summaries]
    .sort((a, b) => b.totalWeight - a.totalWeight)
    .slice(0, 5)

  // Ambil top 5 berdasarkan total transaksi
  const byTransaction = [...summaries]
    .sort((a, b) => b.totalTransaction - a.totalTransaction)
    .slice(0, 5)

  return {
    byWeight,
    byTransaction,
  }
}

// Top 5 kain terlaris berdasarkan berat
type FabricSummary = {
  fabricName: string
  totalWeight: number
}

export const getTopFabrics = async () => {
  // Ambil range tanggal bulan ini
  const { start, end } = getDateRange("monthly")

  // Ambil semua transaksi bulan ini
  const transactionSnapshot = await getDocs(
    query(
      collection(db, "transactions"),
      where("createdAt", ">=", start),
      where("createdAt", "<", end)
    )
  )

  const transactions = transactionSnapshot.docs.map((doc) => doc.data())

  // Ambil semua cards dari seluruh transaksi
  const allCards = transactions.flatMap((tx) => tx.cards || [])

  // Kelompokkan berdasarkan fabricName
  const fabricMap: Record<string, number> = {}

  allCards.forEach((card: any) => {
    const name = card.fabricName
    const weight = parseFloat(card.weight || "0")

    if (!fabricMap[name]) {
      fabricMap[name] = 0
    }

    fabricMap[name] += weight
  })

  // Ubah jadi array dan sort
  const fabricSummaries: FabricSummary[] = Object.entries(fabricMap).map(
    ([fabricName, totalWeight]) => ({
      fabricName,
      totalWeight,
    })
  )

  const topFabrics = fabricSummaries
    .sort((a, b) => b.totalWeight - a.totalWeight)
    .slice(0, 5)

  return topFabrics
}

export type MonthlyFabricSales = {
  month: string
  totalWeight: number
}

// Grafik penjualan kain bulanan berdasarkan tahun (berat total per bulan)
export const getMonthlyFabricSales = async () => {
  const snapshot = await getDocs(collection(db, "transactions"))
  const transactions: TransactionWithId[] = []

  snapshot.forEach((doc) => {
    const data = doc.data() as any
    const createdAt = data.createdAt?.toDate?.() ?? new Date(data.createdAt)
    const transaction: TransactionWithId = {
      id: doc.id,
      ...data,
      createdAt,
    }
    transactions.push(transaction)
  })

  const now = new Date()
  const year = now.getFullYear()
  const currentMonth = now.getMonth()
  const result: MonthlyFabricSales[] = []

  for (let i = 0; i <= currentMonth; i++) {
    const { startDate, endDate } = getDateRange("monthly", new Date(year, i))

    const filtered = transactions.filter(
      (t) => t.createdAt >= startDate && t.createdAt <= endDate
    )

    const totalWeight = filtered.reduce((acc, t) => {
      const sum = t.cards.reduce(
        (cardAcc, card) => cardAcc + parseFloat(card.weight),
        0
      )
      return acc + sum
    }, 0)

    result.push({
      month: startDate.toLocaleString("id", { month: "short" }), // Jan, Feb, dst
      totalWeight,
    })
  }

  return result
}
