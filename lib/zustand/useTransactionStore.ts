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
  fetchTransactions: (
    page: number,
    searchQuery?: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<void>
  resetTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  hasMore: true,
  currentPage: 1,

  fetchTransactions: async (
    page = 1,
    searchQuery?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (get().loading) return

    set({ loading: true })

    try {
      // Panggil API pagination dengan filter opsi
      const { data } = await getPaginatedTransactions(
        page,
        searchQuery,
        startDate,
        endDate
      )

      if (data.length === 0) {
        // Jika tidak ada data, berarti sudah halaman terakhir
        set({ hasMore: false })
      } else {
        set({
          transactions: data,
          currentPage: page,
          hasMore: data.length >= 10, // Jika data kurang dari pageLimit (10), maka halaman terakhir
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
    set({
      transactions: [],
      hasMore: true,
      currentPage: 1,
    })
  },
}))
