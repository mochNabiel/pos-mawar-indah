import {create} from "zustand"
import { getTopFabrics } from "@/lib/firestore/dashboard"

export type FabricSummary = {
  fabricName: string
  totalWeight: number
}

interface TopFabricState {
  topFabrics: FabricSummary[]
  loading: boolean
  error?: string

  fetchTopFabrics: () => Promise<void>
}

export const useTopFabricStore = create<TopFabricState>((set) => ({
  topFabrics: [],
  loading: false,
  error: undefined,

  fetchTopFabrics: async () => {
    set({ loading: true, error: undefined })
    try {
      const data = await getTopFabrics()
      set({ topFabrics: data, loading: false })
    } catch (error: any) {
      set({ error: error.message || "Failed to load top fabrics", loading: false })
    }
  },
}))
