import type { MenuItem } from '@/types/store'

export interface MenuSlice {
  menu: {
    items: MenuItem[]
    isLoading: boolean
    error: string | null
    setItems: (items: MenuItem[]) => void
    addItem: (item: MenuItem) => void
    updateItem: (id: string, updates: Partial<MenuItem>) => void
    deleteItem: (id: string) => void
  }
}

export const createMenuSlice = (set: any) => ({
  menu: {
    items: [],
    isLoading: false,
    error: null,
    setItems: (items: MenuItem[]) => 
      set((state: any) => ({ menu: { ...state.menu, items } })),
    addItem: (item: MenuItem) =>
      set((state: any) => ({ 
        menu: { 
          ...state.menu, 
          items: [...state.menu.items, item] 
        } 
      })),
    updateItem: (id: string, updates: Partial<MenuItem>) =>
      set((state: any) => ({
        menu: {
          ...state.menu,
          items: state.menu.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        }
      })),
    deleteItem: (id: string) =>
      set((state: any) => ({
        menu: {
          ...state.menu,
          items: state.menu.items.filter(item => item.id !== id)
        }
      }))
  }
}) 