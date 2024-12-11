import { CustomersSlice } from '@/store/slices/customersSlice'
import { MenuSlice } from '@/store/slices/menuSlice'
import { OrdersSlice } from '@/store/slices/ordersSlice'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: 'available' | 'out_of_stock'
  dietary: string[]
  allergens?: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  imageUrl?: string;
}

export interface Customer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive'
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  items: Array<{
    menuItemId: string
    quantity: number
    price: number
  }>
  total: number
  date: string
}

export interface StoreState {
  menu: {
    items: MenuItem[]
    categories: string[]
    isLoading: boolean
    error: string | null
  }
  customers: {
    list: Customer[]
    isLoading: boolean
    error: string | null
  }
  orders: {
    list: Order[]
    isLoading: boolean
    error: string | null
  }
}

export type RootState = StoreState & MenuSlice & CustomersSlice & OrdersSlice 