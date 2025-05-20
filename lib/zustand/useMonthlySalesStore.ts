import { create } from "zustand"
import {
  getMonthlyFabricSales,
  MonthlyFabricSales,
} from "@/lib/firestore/dashboard"

interface MonthlySalesState {
  monthlySales: MonthlyFabricSales[]
  loading: boolean
  fetchMonthlySales: () => Promise<void>
}

export const useMonthlySalesStore = create<MonthlySalesState>((set) => ({
  monthlySales: [],
  loading: false,

  fetchMonthlySales: async () => {
    set({ loading: true })
    try {
      const data = await getMonthlyFabricSales()
      set({ monthlySales: data, loading: false })
    } catch (error) {
      console.error("Gagal mengambil data penjualan bulanan:", error)
      set({ monthlySales: [], loading: false })
    }
  },
}))
