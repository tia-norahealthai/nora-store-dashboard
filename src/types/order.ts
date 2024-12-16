export interface OrderItem {
  id: string
  quantity: number
  menu_item: {
    id: string
    name: string
    price: number
  }
} 