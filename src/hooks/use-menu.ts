import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { fetchMenuItems, deleteMenuItem } from '@/store/slices/menuSlice'

export function useMenu() {
  const dispatch = useAppDispatch()
  const menuItems = useAppSelector((state) => state.menu.items)
  const isLoading = useAppSelector((state) => state.menu.isLoading)
  const error = useAppSelector((state) => state.menu.error)

  const fetchItems = useCallback(() => {
    dispatch(fetchMenuItems())
  }, [dispatch])

  const deleteItem = useCallback((id: string) => {
    dispatch(deleteMenuItem(id))
  }, [dispatch])

  return {
    menuItems,
    isLoading,
    error,
    fetchMenuItems: fetchItems,
    deleteMenuItem: deleteItem
  }
} 