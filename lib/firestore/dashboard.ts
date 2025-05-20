import { TransactionWithId } from "@/types/transaction"
import { db } from "@/utils/firebase"
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore"

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
const getDateRange = (type: "daily" | "weekly" | "monthly") => {
  const now = new Date()
  let startDate: Date

  if (type === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // hari ini mulai dari pukul 00:00
  } else if (type === "weekly") {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1) // awal bulan ini
  }

  return { start: Timestamp.fromDate(startDate), end: Timestamp.fromDate(now) }
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
    totalWeight += data.cards.reduce((sum, card) => sum + parseFloat(card.weight), 0)
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
      const weightSum = tx.cards?.reduce((sum: number, card: any) => {
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


// Top 5 kain terlaris berdasarkan berat (weekly/monthly)
export const getTopFabricsByWeight = async (
  filterBy: "weekly" | "monthly"
) => {
  const transactions = await getAllTransactions()
  const now = new Date()

  const filtered = transactions.filter((trx) => {
    const date = trx.createdAt
    if (filterBy === "weekly") {
      const last7 = new Date(now)
      last7.setDate(now.getDate() - 7)
      return date >= last7
    } else {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return date >= firstDayOfMonth
    }
  })

  const fabricMap: Record<string, number> = {}

  for (const trx of filtered) {
    for (const card of trx.cards) {
      const weight = parseFloat(card.weight)
      fabricMap[card.fabricName] =
        (fabricMap[card.fabricName] || 0) + weight
    }
  }

  return Object.entries(fabricMap)
    .map(([fabricName, totalWeight]) => ({ fabricName, totalWeight }))
    .sort((a, b) => b.totalWeight - a.totalWeight)
    .slice(0, 5)
}

// Grafik penjualan kain bulanan berdasarkan tahun (berat total per bulan)
export const getMonthlyFabricSales = async (
  year: number
): Promise<
  | { label: string; totalWeight: number }[]
  | { message: "Tidak Ada Data" }
> => {
  const transactions = await getAllTransactions()

  const filtered = transactions.filter(
    (trx) => trx.createdAt.getFullYear() === year
  )

  if (filtered.length === 0) {
    return { message: "Tidak Ada Data" }
  }

  // Inisialisasi total per bulan
  const monthlyTotals: { [month: number]: number } = {}
  for (let i = 0; i < 12; i++) {
    monthlyTotals[i] = 0
  }

  for (const trx of filtered) {
    const month = trx.createdAt.getMonth() // 0 = Jan, 11 = Dec
    for (const card of trx.cards) {
      const weight = parseFloat(card.weight)
      monthlyTotals[month] += weight
    }
  }

  // Ambil hingga bulan terakhir yang ada datanya
  const lastMonthIndex = Math.max(
    ...filtered.map((t) => t.createdAt.getMonth())
  )

  const result = []
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  for (let i = 0; i <= lastMonthIndex; i++) {
    result.push({
      label: monthLabels[i],
      totalWeight: monthlyTotals[i],
    })
  }

  return result
}
