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
  fetchTransactions: (reset?: boolean) => Promise<void>
  resetTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  hasMore: true,

  fetchTransactions: async (reset = false) => {
    if (get().loading || (!get().hasMore && !reset)) return

    set({ loading: true })

    try {
      if (reset) {
        resetPagination()
        set({ transactions: [], hasMore: true })
      }

      const { data } = await getPaginatedTransactions()
      if (data.length === 0) {
        set({ hasMore: false })
      }

      set((state) => ({
        transactions: [...state.transactions, ...data],
      }))
    } catch (error) {
      console.error("Fetch paginated transactions failed:", error)
    } finally {
      set({ loading: false })
    }
  },

  resetTransactions: () => {
    resetPagination()
    set({ transactions: [], hasMore: true })
  },
}))