import { create } from "zustand"
import { getAllTransactions } from "@/lib/firestore/transaction"

interface CustomerSummary {
  customerName: string
  totalWeight: number
  totalTransaction: number
}

interface TopCustomersState {
  topCustomers: CustomerSummary[]
  loading: boolean
  error: string | null
  fetchTopCustomers: (startDate: Date, endDate: Date) => Promise<void>
}

export const useTopCustomersStore = create<TopCustomersState>((set) => ({
  topCustomers: [],
  loading: false,
  error: null,

  fetchTopCustomers: async (startDate, endDate) => {
    set({ loading: true, error: null })

    try {
      const transactions = await getAllTransactions(
        undefined,
        startDate,
        endDate
      )
      // Hitung total berat dan transaksi per customer
      const customerMap = new Map<string, CustomerSummary>()

      transactions.forEach((t) => {
        const name = t.customerName || "Unknown"
        const current = customerMap.get(name) || {
          customerName: name,
          totalWeight: 0,
          totalTransaction: 0,
        }

        // Jumlahkan berat dari setiap card
        const totalWeight = t.cards.reduce((acc, card) => {
          const w = parseFloat(card.weight || "0")
          return acc + (isNaN(w) ? 0 : w)
        }, 0)

        customerMap.set(name, {
          customerName: name,
          totalWeight: current.totalWeight + totalWeight,
          totalTransaction:
            current.totalTransaction + (t.totalTransaction || 0),
        })
      })

      // Sort dan ambil top 5 berdasarkan totalWeight atau totalTransaction (bisa kamu sesuaikan)
      const sorted = Array.from(customerMap.values()).sort(
        (a, b) => b.totalWeight - a.totalWeight
      )

      set({ topCustomers: sorted.slice(0, 5), loading: false })
    } catch (err) {
      set({ error: "Failed to fetch top customers", loading: false })
    }
  },
}))
