import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Order } from '@/types/store'

interface OrdersState {
  list: Order[]
  isLoading: boolean
  error: string | null
}

const initialState: OrdersState = {
  list: [],
  isLoading: false,
  error: null
}

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
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

export type OrdersSlice = {
  orders: OrdersState
}

export const { setOrders, setLoading, setError } = ordersSlice.actions
export default ordersSlice.reducer 