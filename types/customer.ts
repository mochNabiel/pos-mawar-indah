export type Customer = {
  name: string
  phone: string
  company: string
}

export type CustomerWithId = Customer & { id: string }

export type CustomerStore = {
  customers: CustomerWithId[]
  isLoading: boolean
  fetchAllCustomers: () => Promise<void>
  findCustomerByName: (name: string) => CustomerWithId | undefined
  addCustomer: (data: Customer) => Promise<void>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
}
