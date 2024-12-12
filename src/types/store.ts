export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  total_orders: number
  total_spent: number
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  items: OrderItem[]
  payment_method?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  price: number
  notes?: string
}

type MenuAction = {
  type: 'ADD_MENU_ITEM'
  payload: MenuItem
}

type Actions = MenuAction