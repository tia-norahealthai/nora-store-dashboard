"use client"

import { createContext, useContext, useState, useCallback } from 'react'
import { useStore } from '@/store'
import { db } from '@/lib/supabase/db'
import type { MenuItem, Customer, Order } from '@/types/store'
import { useToast } from "@/components/ui/use-toast"
import { useMenu } from "@/hooks/use-menu"
import { actionResponses } from '@/lib/action-responses'

interface MariaContextType {
  menuItems: MenuItem[]
  customers: Customer[]
  orders: Order[]
  isLoading: boolean
  pageType: string
  pageData: any
  updateMenuItems: (items: MenuItem[]) => void
  executeCommand: (command: string, data: any) => Promise<void>
}

const MariaContext = createContext<MariaContextType>({
  menuItems: [],
  customers: [],
  orders: [],
  isLoading: false,
  pageType: '',
  pageData: null,
  updateMenuItems: () => {},
  executeCommand: async () => {}
})

export function MariaProvider({ 
  children, 
  pageType,
  initialData 
}: { 
  children: React.ReactNode
  pageType: string
  initialData: any 
}) {
  const store = useStore()
  const { toast } = useToast()
  const [pageData, setPageData] = useState(initialData)

  const { createMenuItem } = useMenu()

  const updateMenuItems = useCallback((items: MenuItem[]) => {
    store.menu.setItems(items)
  }, [store.menu])

  const executeCommand = useCallback(async (command: string, data: any) => {
    try {
      switch (command) {
        case 'deleteMenuItem':
          if (data?.id) {
            await db.menu.deleteItem(data.id)
            store.menu.deleteItem(data.id)
            toast({
              title: "Success",
              description: "Menu item deleted successfully",
            })
          }
          break

        case 'createMenuItem':
          if (data?.item) {
            const newItem = await createMenuItem(data.item)
            toast({
              title: "Success",
              description: "Menu item created successfully",
            })
            return newItem
          }
          break

        case 'updateMenuItem':
          if (data?.id && data?.updates) {
            const updatedItem = await db.menu.updateItem(data.id, data.updates)
            store.menu.updateItem(data.id, updatedItem)
            toast({
              title: "Success",
              description: "Menu item updated successfully",
            })
          }
          break

        case 'fetchMenuItems':
          const items = await db.menu.getItems()
          store.menu.setItems(items)
          break

        case 'openChat':
          if (window.location.pathname === '/maria') {
            window.dispatchEvent(new CustomEvent('maria-send-message', {
              detail: data.initialMessage
            }))
          } else {
            const query = encodeURIComponent(data.initialMessage)
            window.location.href = `/maria?query=${query}`
          }
          break

        case 'getActionResponse':
          const actionKey = data.action.toLowerCase()
          const response = actionResponses[actionKey as keyof typeof actionResponses]
          if (response) {
            window.dispatchEvent(new CustomEvent('maria-send-message', {
              detail: {
                query: data.query,
                response: response.details
              }
            }))
          } else {
            console.warn(`No response found for action: ${actionKey}`)
            window.dispatchEvent(new CustomEvent('maria-send-message', {
              detail: {
                query: data.query,
                response: "I'm sorry, I don't have specific guidance for that action yet. Please try asking me in a different way or contact support for assistance."
              }
            }))
          }
          break

        default:
          console.warn(`Unknown command: ${command}`)
          return
      }
    } catch (error) {
      console.error('Command execution failed:', error)
      toast({
        title: "Error",
        description: "Failed to execute command. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }, [createMenuItem, toast])

  const value = {
    menuItems: store.menu.items,
    customers: store.customers.list,
    orders: store.orders.list,
    isLoading: store.menu.isLoading || 
               store.customers.isLoading || 
               store.orders.isLoading,
    pageType,
    pageData,
    updateMenuItems,
    executeCommand
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