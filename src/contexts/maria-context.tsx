"use client"

import { createContext, useContext } from 'react'
import { useStore } from '@/store'
import type { MenuItem, Customer, Order } from '@/types/store'

interface MariaContextType {
  menuItems: MenuItem[]
  customers: Customer[]
  orders: Order[]
  isLoading: boolean
}

const MariaContext = createContext<MariaContextType>({
  menuItems: [],
  customers: [],
  orders: [],
  isLoading: false
})

export function MariaProvider({ children }: { children: React.ReactNode }) {
  const menuItems = useStore((state) => state.menu.items)
  const customers = useStore((state) => state.customers.list)
  const orders = useStore((state) => state.orders.list)
  const isLoading = useStore((state) => 
    state.menu.isLoading || 
    state.customers.isLoading || 
    state.orders.isLoading
  )

  const value = {
    menuItems,
    customers,
    orders,
    isLoading
  }

  return (
    <MariaContext.Provider value={value}>
      {children}
    </MariaContext.Provider>
  )
}

export function useMariaContext() {
  const context = useContext(MariaContext)
  if (context === undefined) {
    throw new Error('useMariaContext must be used within a MariaProvider')
  }
  return context
} 