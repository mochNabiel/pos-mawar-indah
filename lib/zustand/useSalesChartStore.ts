import { create } from "zustand"
import { getAllTransactions } from "@/lib/firestore/transaction"

interface SalesChartPoint {
  date: string // misal "2025-05-20"
  totalRevenue: number
  totalWeight: number
  totalTransactions: number
}

interface SalesChartState {
  chartData: SalesChartPoint[]
  loading: boolean
  error: string | null
  fetchChartData: (
    startDate: Date,
    endDate: Date,
    granularity: "day" | "week" | "month"
  ) => Promise<void>
}

export const useSalesChartStore = create<SalesChartState>((set) => ({
  chartData: [],
  loading: false,
  error: null,

  fetchChartData: async (startDate, endDate, granularity) => {
    set({ loading: true, error: null })

    try {
      const transactions = await getAllTransactions(
        undefined,
        startDate,
        endDate
      )

      // Group transactions by granularity
      const grouped = new Map<string, SalesChartPoint>()

      const getDateKey = (date: Date) => {
        switch (granularity) {
          case "day":
            return date.toISOString().slice(0, 10)
          case "week": {
            const oneJan = new Date(date.getFullYear(), 0, 1)
            const week = Math.ceil(
              ((date.getTime() - oneJan.getTime()) / (1000 * 60 * 60 * 24) +
                oneJan.getDay() +
                1) /
                7
            )
            return `${date.getFullYear()}-W${week}`
          }
          case "month":
            return `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`
        }
      }

      transactions.forEach((t) => {
        const date = (t.createdAt as Date) || new Date()
        const key = getDateKey(date)

        const existing = grouped.get(key) || {
          date: key,
          totalRevenue: 0,
          totalWeight: 0,
          totalTransactions: 0,
        }

        // Calculate weight for transaction
        const totalWeight = t.cards.reduce((acc, card) => {
          const w = parseFloat(card.weight || "0")
          return acc + (isNaN(w) ? 0 : w)
        }, 0)

        grouped.set(key, {
          date: key,
          totalRevenue: existing.totalRevenue + (t.totalTransaction || 0),
          totalWeight: existing.totalWeight + totalWeight,
          totalTransactions: existing.totalTransactions + 1,
        })
      })

      const sorted = Array.from(grouped.values()).sort((a, b) =>
        a.date > b.date ? 1 : -1
      )

      set({ chartData: sorted, loading: false })
    } catch (err) {
      set({ error: "Failed to fetch chart data", loading: false })
    }
  },
}))
