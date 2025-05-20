import { create } from "zustand"
import { TransactionWithId } from "@/types/transaction"

import {
  getMonthlyFabricSales,
  getSalesRecap,
  getTopCustomersByWeight,
  getTopCustomersByTransaction,
  getTopFabricsByWeight,
} from "@/lib/firestore/dashboard"

type RecapType = "daily" | "weekly" | "monthly"
type CustomerFilter = "weight" | "transaction"
type FabricFilter = "monthly" // bisa dikembangkan nanti

type DashboardStore = {
  selectedYear: number
  monthlySales: number[]
  recapType: RecapType
  salesRecapTotal: number
  customerFilter: CustomerFilter
  topCustomers: { customerName: string; value: number }[]
  topFabrics: { fabricName: string; totalWeight: number }[]
  fabricFilter: FabricFilter
  loading: boolean
  error: string | null
  fetchDashboardData: () => Promise<void>
  setSelectedYear: (year: number) => void
  setRecapType: (type: RecapType) => void
  setCustomerFilter: (filter: CustomerFilter) => void
  setFabricFilter: (filter: FabricFilter) => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  selectedYear: new Date().getFullYear(),
  monthlySales: [],
  recapType: "monthly",
  salesRecapTotal: 0,
  customerFilter: "weight",
  topCustomers: [],
  topFabrics: [],
  fabricFilter: "monthly",
  loading: false,
  error: null,

  setSelectedYear: (year) => set({ selectedYear: year }),
  setRecapType: (type) => set({ recapType: type }),
  setCustomerFilter: (filter) => set({ customerFilter: filter }),
  setFabricFilter: (filter) => set({ fabricFilter: filter }),

  fetchDashboardData: async () => {
    const {
      selectedYear,
      recapType,
      customerFilter,
      fabricFilter,
    } = get()

    set({ loading: true, error: null })

    try {
      const [
        monthlySales,
        salesRecapTotal,
        topCustomersRaw,
        topFabrics,
      ] = await Promise.all([
        getMonthlyFabricSales(selectedYear),
        getSalesRecap(recapType),
        customerFilter === "weight"
          ? getTopCustomersByWeight()
          : getTopCustomersByTransaction(),
        getTopFabricsByWeight(fabricFilter),
      ])

      const topCustomers = customerFilter === "weight"
        ? topCustomersRaw.map((c) => ({ customerName: c.customerName, value: c.totalWeight }))
        : topCustomersRaw.map((c) => ({ customerName: c.customerName, value: c.totalTransaction }))

      set({
        monthlySales,
        salesRecapTotal,
        topCustomers,
        topFabrics,
        loading: false,
      })
    } catch (err: any) {
      set({ error: err.message || "Gagal mengambil data", loading: false })
    }
  },
}))
