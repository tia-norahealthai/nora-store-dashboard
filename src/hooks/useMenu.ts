import { useCallback } from 'react'
import { useStore } from '@/store'

export function useMenu() {
  const dispatch = useStore((state) => state.dispatch)

  const createMenuItem = useCallback(async (itemData: {
    name: string
    price: string
    category: string
    description: string
  }) => {
    try {
      // Here you would typically make an API call to create the menu item
      // For now, we'll just dispatch it to the store
      dispatch({
        type: 'ADD_MENU_ITEM',
        payload: itemData
      })
      return true
    } catch (error) {
      console.error('Error creating menu item:', error)
      return false
    }
  }, [dispatch])

  return {
    createMenuItem
  }
} 