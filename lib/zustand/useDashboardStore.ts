import { create } from "zustand"
import { TransactionWithId } from "@/types/transaction"
import { getAllTransactions } from "@/lib/firestore/dashboard"
import getDateRange from "@/lib/helper/getDateRange"
import { getCurrentUserData, AppUser  } from "@/lib/helper/getCurrentUserData";

interface DashboardState {
  transactions: TransactionWithId[]
  user: any
  loading: boolean
  loadingUser: boolean
  selectedMonth: string | null
  selectedYear: string | null
  fetchUser:  () => Promise<void>; 
  fetchTransactions: () => Promise<void>
  setSelectedMonth: (month: string | null) => void
  setSelectedYear: (year: string | null) => void
  getSalesRecap: (
    type: "daily" | "weekly" | "monthly",
    month?: string | null,
    year?: string | null
  ) => {
    transactions: number
    totalFabricSold: number
    totalRevenue: number
  }
  getMonthlySalesChartData: (
    year?: string | null
  ) => { month: string; totalWeight: number }[]
  getFabricsRecap: (
    month?: string | null,
    year?: string | null
  ) => { fabricName: string; totalWeight: number }[]
  getCustomersRecap: (
    month?: string | null,
    year?: string | null
  ) => {
    byWeight: { name: string; totalWeight: number; totalTransaction: number }[]
    byTransaction: {
      name: string
      totalWeight: number
      totalTransaction: number
    }[]
  }
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  transactions: [],
  user: null,
  loading: false,
  loadingUser:  false,
  selectedMonth: new Date().getMonth() + 1 + "", // Inisialisasi di set pada bulan ini
  selectedYear: new Date().getFullYear() + "", // inisialisasi di set pada tahun ini

  fetchUser:  async () => {
    set({ loadingUser:  true }); // Set loadingUser  menjadi true saat mengambil data
    try {
      const user = await getCurrentUserData();
      set({ user });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      set({ loadingUser:  false }); // Set loadingUser  menjadi false setelah selesai
    }
  },

  fetchTransactions: async () => {
    // Hanya ambil transaksi jika belum ada
    if (get().transactions.length === 0) {
      set({ loading: true })
      try {
        const transactions = await getAllTransactions()
        set({ transactions })
      } catch (error: any) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        set({ loading: false })
      }
    }
  },

  setSelectedMonth: (month: string | null) => {
    set({ selectedMonth: month })
  },

  setSelectedYear: (year: string | null) => {
    set({ selectedYear: year })
  },

  getSalesRecap: (type, month, year) => {
    const date =
      month && year ? new Date(parseInt(year), parseInt(month)) : new Date()
    const { start, end } = getDateRange(type, date) // Mengambil rentang tanggal berdasarkan tipe

    const transactions = get().transactions // Mengambil transaksi dari state

    let totalTransactions = 0
    let totalWeight = 0
    let totalRevenue = 0

    // Menghitung total transaksi, berat, dan pendapatan
    transactions.forEach((tx) => {
      if (tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()) {
        totalTransactions += 1
        totalRevenue += tx.totalTransaction
        totalWeight += tx.cards.reduce(
          (sum, card) => sum + parseFloat(card.weight || "0"),
          0
        )
      }
    })

    return {
      transactions: totalTransactions,
      totalFabricSold: parseFloat(totalWeight.toFixed(2)),
      totalRevenue,
    }
  },

  getMonthlySalesChartData: (year) => {
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    const transactions = get().transactions

    const monthlyTotals: Record<number, number> = {}

    transactions.forEach((t) => {
      const txYear = t.createdAt.getFullYear()
      if (txYear === targetYear) {
        const month = t.createdAt.getMonth()
        const weightSum = t.cards.reduce(
          (sum, card) => sum + parseFloat(card.weight || "0"),
          0
        )
        monthlyTotals[month] = (monthlyTotals[month] || 0) + weightSum
      }
    })

    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(targetYear, i).toLocaleString("id", { month: "short" }),
      totalWeight: monthlyTotals[i] || 0,
    }))
  },

  getFabricsRecap: (month, year) => {
    // Mendapatkan rentang tanggal berdasarkan bulan dan tahun yang dipilih
    const date =
      month && year ? new Date(parseInt(year), parseInt(month)) : new Date()
    const { start, end } = getDateRange("monthly", date) // Mengambil rentang tanggal bulanan
    const transactions = get().transactions // Mengambil transaksi dari state

    // Mengambil semua kartu dari transaksi yang berada dalam rentang tanggal
    const allCards = transactions
      .filter(
        (tx) => tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()
      )
      .flatMap((tx) => tx.cards || [])

    const fabricMap: Record<string, number> = {} // Map untuk menyimpan total berat per kain

    // Menghitung total berat per kain
    allCards.forEach((card: any) => {
      const name = card.fabricName // Nama kain
      const weight = parseFloat(card.weight || "0") // Berat kain

      if (!fabricMap[name]) {
        fabricMap[name] = 0 // Inisialisasi jika kain belum ada di map
      }

      fabricMap[name] += weight // Tambahkan berat kain ke total
    })

    // Mengembalikan array dari objek kain dengan total berat, diurutkan berdasarkan berat
    return Object.entries(fabricMap)
      .map(([fabricName, totalWeight]) => ({
        fabricName,
        totalWeight,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight) // Urutkan dari berat tertinggi
  },

  getCustomersRecap: (month, year) => {
    const date =
      month && year ? new Date(parseInt(year), parseInt(month)) : new Date()
    const { start, end } = getDateRange("monthly", date)
    const transactions = get().transactions

    const customerMap: Record<
      string,
      { totalWeight: number; totalTransaction: number }
    > = {}

    transactions.forEach((tx) => {
      if (tx.createdAt >= start.toDate() && tx.createdAt <= end.toDate()) {
        const customerName = tx.customerName
        const weightSum = tx.cards.reduce((sum: number, card: any) => {
          return sum + parseFloat(card.weight || "0")
        }, 0)

        if (!customerMap[customerName]) {
          customerMap[customerName] = { totalWeight: 0, totalTransaction: 0 }
        }

        customerMap[customerName].totalWeight += weightSum
        customerMap[customerName].totalTransaction += tx.totalTransaction || 0
      }
    })

    const customersArray = Object.entries(customerMap).map(
      ([name, { totalWeight, totalTransaction }]) => ({
        name,
        totalWeight,
        totalTransaction,
      })
    )

    const byWeight = customersArray.sort(
      (a, b) => b.totalWeight - a.totalWeight
    )
    const byTransaction = customersArray.sort(
      (a, b) => b.totalTransaction - a.totalTransaction
    )

    return {
      byWeight,
      byTransaction,
    }
  },
}))
