import { create } from 'zustand'
import { createMenuSlice, MenuSlice } from './slices/menuSlice'
import { createCustomersSlice, CustomersSlice } from './slices/customersSlice'
import { createOrdersSlice, OrdersSlice } from './slices/ordersSlice'

type StoreState = MenuSlice & CustomersSlice & OrdersSlice

export const useStore = create<StoreState>()((set) => ({
  ...createMenuSlice(set),
  ...createCustomersSlice(set),
  ...createOrdersSlice(set)
})) 