import { create } from "zustand"
import { getSalesRecap } from "@/lib/firestore/dashboard"

interface SalesRecapData {
  transactions: number
  totalFabricSold: number
  totalRevenue: number
}

interface SalesRecapState {
  daily: SalesRecapData | null
  weekly: SalesRecapData | null
  monthly: SalesRecapData | null
  loading: boolean
  fetchSalesRecap: () => Promise<void>
}

export const useSalesRecapStore = create<SalesRecapState>((set) => ({
  daily: null,
  weekly: null,
  monthly: null,
  loading: false,

  fetchSalesRecap: async () => {
    set({ loading: true })
    const [daily, weekly, monthly] = await Promise.all([
      getSalesRecap("daily"),
      getSalesRecap("weekly"),
      getSalesRecap("monthly"),
    ])
    set({ daily, weekly, monthly, loading: false })
  },
}))
