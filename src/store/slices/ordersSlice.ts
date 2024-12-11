import type { Order } from '@/types/store'

export interface OrdersSlice {
  orders: {
    list: Order[]
    isLoading: boolean
    error: string | null
  }
}

export const createOrdersSlice = (set: any) => ({
  orders: {
    list: [],
    isLoading: false,
    error: null,
    setList: (orders: Order[]) =>
      set((state: any) => ({ orders: { ...state.orders, list: orders } })),
    addOrder: (order: Order) =>
      set((state: any) => ({
        orders: {
          ...state.orders,
          list: [...state.orders.list, order]
        }
      }))
  }
}) 