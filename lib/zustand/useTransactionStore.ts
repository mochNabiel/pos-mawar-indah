import { create } from "zustand"
import { TransactionWithId } from "@/types/transaction"
import {
  getPaginatedTransactions,
  resetPagination,
} from "@/lib/firestore/transaction"

interface TransactionStore {
  transactions: TransactionWithId[]
  loading: boolean
  hasMore: boolean
  currentPage: number
  fetchTransactions: (page: number) => Promise<void>
  resetTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  hasMore: true,
  currentPage: 1,

  fetchTransactions: async (page = 1) => {
    if (get().loading) return

    set({ loading: true })

    try {
      const { data } = await getPaginatedTransactions(page)
      if (data.length === 0) {
        set({ hasMore: false })
      } else {
        set({
          transactions: data,
          currentPage: page,
        })
      }
    } catch (error) {
      console.error("Fetch paginated transactions failed:", error)
    } finally {
      set({ loading: false })
    }
  },

  resetTransactions: () => {
    resetPagination()
    set({ transactions: [], hasMore: true, currentPage: 1 })
  },
}))
