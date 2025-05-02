import { create } from "zustand"
import {
  getAllCustomers,
  createCustomer,
  updateCustomerInDb,
  deleteCustomerInDb,
} from "@/lib/firestore/customer"
import { CustomerStore, Customer, CustomerWithId } from "@/types/customer"

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  isLoading: false,

  fetchAllCustomers: async () => {
    set({ isLoading: true })
    const data = await getAllCustomers()
    set({ customers: data, isLoading: false })
  },

  findCustomerByName: (name: string) => {
    return get().customers.find((c) => c.name === name)
  },

  addCustomer: async (data: Customer) => {
    const docRef = await createCustomer(data)
    const newCustomer: CustomerWithId = { id: docRef.id, ...data }
    set((state) => ({ customers: [...state.customers, newCustomer] }))
  },

  updateCustomer: async (name: string, data: Partial<Customer>) => {
    await updateCustomerInDb(name, data)
    set((state) => ({
      customers: state.customers.map((c) =>
        c.name === name ? { ...c, ...data } : c
      ),
    }))
  },

  deleteCustomer: async (name: string) => {
    try {
      await deleteCustomerInDb(name)
      set((state) => ({
        customers: state.customers.filter((c) => c.name !== name), // Menghapus kain dari state
      }))
    } catch (error) {
      console.error("Gagal menghapus data customer: ", error)
    }
  },
}))
