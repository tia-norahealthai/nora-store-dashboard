export interface Customer {
  id: string
  name: string
  email: string
  created_at: string
  orders?: {
    id: string
    status: string
    created_at: string
    total_amount: number
    order_items?: {
      id: string
      quantity: number
      item_name: string
      price: number
    }[]
  }[]
} 