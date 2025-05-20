import { create } from "zustand"
import { getTopCustomers} from "@/lib/firestore/dashboard"

type CustomerData = {
  name: string
  totalWeight: number
  totalTransaction: number
}

type TopCustomersState = {
  byWeight: CustomerData[]
  byTransaction: CustomerData[]
  loading: boolean
  fetchTopCustomers: () => Promise<void>
}

export const useTopCustomersStore = create<TopCustomersState>((set) => ({
  byWeight: [],
  byTransaction: [],
  loading: false,
  fetchTopCustomers: async () => {
    set({ loading: true })
    try {
      const data = await getTopCustomers()
      set({
        byWeight: data.byWeight,
        byTransaction: data.byTransaction,
      })
    } catch (error) {
      console.error("Failed to fetch top customers:", error)
    } finally {
      set({ loading: false })
    }
  },
}))
