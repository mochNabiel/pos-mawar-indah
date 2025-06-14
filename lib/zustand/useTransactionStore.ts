import { create } from "zustand"
import { TransactionWithId } from "@/types/transaction"
import {
  getTransactionByInvCode,
  getTransactions,
} from "@/lib/firestore/transaction"

type TransactionState = {
  transactions: TransactionWithId[]
  transaction: TransactionWithId | null
  loading: boolean
  hasMore: boolean
  lastDoc: any
  filters: {
    customerName?: string
    startDate?: Date | null
    endDate?: Date | null
  }
  fetchInitial: () => void
  fetchMore: () => void
  setCustomerName: (name: string) => void
  setDateRange: (start: Date | null, end: Date | null) => void
  resetFilters: () => void
  getTransactionDetail: (
    invCode: string
  ) => Promise<TransactionWithId | undefined>
}

const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  transaction: null,
  loading: false,
  hasMore: true,
  lastDoc: null,
  filters: {
    customerName: undefined,
    startDate: null,
    endDate: null,
  },

  fetchInitial: async () => {
    set({ loading: true })
    const { customerName, startDate, endDate } = get().filters
    const result = await getTransactions({ customerName, startDate, endDate })

    set({
      transactions: result.data,
      lastDoc: result.lastDoc,
      hasMore: !result.isLastPage,
      loading: false,
    })
  },

  fetchMore: async () => {
    const { lastDoc, hasMore, loading, filters } = get()
    if (!hasMore || loading) return

    set({ loading: true })
    const result = await getTransactions({ ...filters, lastDoc })

    set((state) => ({
      transactions: [...state.transactions, ...result.data],
      lastDoc: result.lastDoc,
      hasMore: !result.isLastPage,
      loading: false,
    }))
  },

  setCustomerName: (name: string) => {
    set((state) => ({
      filters: { ...state.filters, customerName: name || undefined },
    }))
    get().fetchInitial()
  },

  setDateRange: (start: Date | null, end: Date | null) => {
    set((state) => ({
      filters: { ...state.filters, startDate: start, endDate: end },
    }))
    get().fetchInitial()
  },

  resetFilters: () => {
    set({
      filters: {
        customerName: undefined,
        startDate: null,
        endDate: null,
      },
    })
    get().fetchInitial()
  },

  getTransactionDetail: async (invCode: string) => {
    const tx = get().transactions.find((tx) => tx.invCode === invCode)
    if (!tx) {
      // Ambil dari Firestore jika tidak ditemukan di state
      const fetchedTransaction = await getTransactionByInvCode(invCode)
      set({ transaction: fetchedTransaction })
      return fetchedTransaction
    }
    set({ transaction: tx })
    return tx
  },
}))

export default useTransactionStore
