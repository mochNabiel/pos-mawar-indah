import { create } from "zustand"
import { getAllTransactions } from "@/lib/firestore/transaction"

interface FabricSummary {
  fabricName: string
  totalWeight: number
  totalTransaction: number
}

interface TopFabricsState {
  topFabrics: FabricSummary[]
  loading: boolean
  error: string | null
  fetchTopFabrics: (startDate: Date, endDate: Date) => Promise<void>
}

export const useTopFabricsStore = create<TopFabricsState>((set) => ({
  topFabrics: [],
  loading: false,
  error: null,

  fetchTopFabrics: async (startDate, endDate) => {
    set({ loading: true, error: null })

    try {
      const transactions = await getAllTransactions(
        undefined,
        startDate,
        endDate
      )
      const fabricMap = new Map<string, FabricSummary>()

      transactions.forEach((t) => {
        t.cards.forEach((card) => {
          const name = card.fabricName || "Unknown"
          const current = fabricMap.get(name) || {
            fabricName: name,
            totalWeight: 0,
            totalTransaction: 0,
          }

          const w = parseFloat(card.weight || "0")
          const weight = isNaN(w) ? 0 : w

          fabricMap.set(name, {
            fabricName: name,
            totalWeight: current.totalWeight + weight,
            totalTransaction: current.totalTransaction + (card.totalPrice || 0),
          })
        })
      })

      const sorted = Array.from(fabricMap.values()).sort(
        (a, b) => b.totalWeight - a.totalWeight
      )

      set({ topFabrics: sorted.slice(0, 5), loading: false })
    } catch (err) {
      set({ error: "Failed to fetch top fabrics", loading: false })
    }
  },
}))
