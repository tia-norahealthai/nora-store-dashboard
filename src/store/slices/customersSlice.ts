import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Customer } from '@/types/store'

interface CustomersState {
  list: Customer[]
  isLoading: boolean
  error: string | null
}

const initialState: CustomersState = {
  list: [],
  isLoading: false,
  error: null
}

export const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.list = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export type CustomersSlice = {
  customers: CustomersState
}

export const { setCustomers, setLoading, setError } = customersSlice.actions
export default customersSlice.reducer 