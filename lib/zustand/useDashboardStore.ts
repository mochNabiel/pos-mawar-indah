import { create } from "zustand"
import {
  getMonthlyFabricSales,
  MonthlyFabricSales,
  getSalesRecap,
  getTopCustomers,
  getTopFabrics,
} from "@/lib/firestore/dashboard"

type CustomerData = {
  name: string
  totalWeight: number
  totalTransaction: number
}

export type FabricSummary = {
  fabricName: string
  totalWeight: number
}

interface SalesRecapData {
  transactions: number
  totalFabricSold: number
  totalRevenue: number
}

interface DashboardState {
  daily: SalesRecapData | null
  weekly: SalesRecapData | null
  monthly: SalesRecapData | null

  byWeight: CustomerData[]
  byTransaction: CustomerData[]

  topFabrics: FabricSummary[]

  monthlySales: MonthlyFabricSales[]

  loading: boolean
  error?: string

  fetchDashboardData: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  daily: null,
  weekly: null,
  monthly: null,

  byWeight: [],
  byTransaction: [],

  topFabrics: [],

  monthlySales: [],

  loading: false,
  error: undefined,

  fetchDashboardData: async () => {
    set({ loading: true, error: undefined })

    try {
      const [
        salesRecapDaily,
        salesRecapWeekly,
        salesRecapMonthly,
        topCustomers,
        topFabricsData,
        monthlySalesData,
      ] = await Promise.all([
        getSalesRecap("daily"),
        getSalesRecap("weekly"),
        getSalesRecap("monthly"),
        getTopCustomers(),
        getTopFabrics(),
        getMonthlyFabricSales(),
      ])

      set({
        daily: salesRecapDaily,
        weekly: salesRecapWeekly,
        monthly: salesRecapMonthly,

        byWeight: topCustomers.byWeight,
        byTransaction: topCustomers.byTransaction,

        topFabrics: topFabricsData,

        monthlySales: monthlySalesData,

        loading: false,
        error: undefined,
      })
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error)
      set({
        daily: null,
        weekly: null,
        monthly: null,

        byWeight: [],
        byTransaction: [],

        topFabrics: [],

        monthlySales: [],

        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      })
    }
  },
}))
