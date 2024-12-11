import type { Customer } from '@/types/store'

export interface CustomersSlice {
  customers: {
    list: Customer[]
    isLoading: boolean
    error: string | null
  }
}

export const createCustomersSlice = (set: any) => ({
  customers: {
    list: [],
    isLoading: false,
    error: null,
    setList: (customers: Customer[]) =>
      set((state: any) => ({ customers: { ...state.customers, list: customers } })),
    addCustomer: (customer: Customer) =>
      set((state: any) => ({
        customers: {
          ...state.customers,
          list: [...state.customers.list, customer]
        }
      }))
  }
}) 