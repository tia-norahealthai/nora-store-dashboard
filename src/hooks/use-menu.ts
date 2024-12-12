import { useCallback } from 'react'
import { useStore } from '@/store'
import { db } from '@/lib/supabase/db'
import type { MenuItem } from '@/types/store'

interface CreateMenuItemParams {
  name: string;
  price: string;
  category: string;
  description: string;
  image_url?: string;
  status?: string;
  ingredients?: string[];
  preparation_time?: number;
}

export function useMenu() {
  const store = useStore()
  
  const menuItems = store.menu.items
  const isLoading = store.menu.isLoading
  const error = store.menu.error

  const fetchMenuItems = useCallback(async () => {
    try {
      const items = await db.menu.getItems()
      store.menu.setItems(items)
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
    }
  }, [store.menu])

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      await db.menu.deleteItem(id)
      store.menu.deleteItem(id)
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }, [store.menu])

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    try {
      const updatedItem = await db.menu.updateItem(id, updates)
      store.menu.updateItem(id, updatedItem)
    } catch (error) {
      console.error('Failed to update menu item:', error)
    }
  }, [store.menu])

  const createMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    try {
      const newItem = await db.menu.createItem(item)
      store.menu.addItem(newItem)
    } catch (error) {
      console.error('Failed to create menu item:', error)
    }
  }, [store.menu])

  return {
    menuItems,
    isLoading,
    error,
    fetchMenuItems,
    deleteMenuItem,
    updateMenuItem,
    createMenuItem
  }
} 