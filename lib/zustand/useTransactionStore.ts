import { create } from "zustand"
import { fetchAllTransactions } from "@/lib/firestore/transaction"
import { TransactionWithId } from "@/types/transaction"

interface TransactionStore {
  transactions: TransactionWithId[]
  filteredTransactions: TransactionWithId[]
  searchQuery: string // State to hold the search query
  loading: boolean // Loading state
  fetchTransactions: () => Promise<void>
  filterTransactionsByDate: (startDate: Date, endDate: Date) => void
  filterTransactionsByCustomerName: (query: string) => void // Method for filtering by customer name
  resetFilters: () => void
  getTransactionByInvCode: (invCode: string) => TransactionWithId | undefined // Method to get transaction by invCode
}

const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  searchQuery: "", // Initialize search query
  loading: false, // Initialize loading state

  // Fetch all transactions from Firestore and store them
  fetchTransactions: async () => {
    set({ loading: true }) // Set loading to true before fetching
    try {
      const transactions = await fetchAllTransactions()
      set({ transactions, filteredTransactions: transactions })
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      set({ loading: false }) // Set loading to false after fetching
    }
  },

  // Filter transactions based on the provided date range
  filterTransactionsByDate: (startDate, endDate) => {
    set((state) => ({
      filteredTransactions: state.transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate >= startDate && transactionDate <= endDate
      }),
    }))
  },

  // Filter transactions based on customer name
  filterTransactionsByCustomerName: (query) => {
    set((state) => ({
      searchQuery: query, // Update the search query state
      filteredTransactions: state.transactions.filter((transaction) =>
        transaction.customerName.toLowerCase().includes(query.toLowerCase())
      ),
    }))
  },

  // Reset filters to show all transactions
  resetFilters: () => {
    set((state) => ({
      filteredTransactions: state.transactions,
      searchQuery: "", // Reset search query
    }))
  },

  // Get a transaction by its invCode
  getTransactionByInvCode: (invCode) => {
    return get().transactions.find(
      (transaction) => transaction.invCode === invCode
    )
  },
}))

export default useTransactionStore
