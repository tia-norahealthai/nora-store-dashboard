export type MenuItemData = {
  id: string
  name: string
  description: string
  price: number
  category: string
  dietary: string[]
  status: "available" | "out_of_stock" | "coming_soon"
  imageUrl?: string
  allergens?: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export type CustomerData = {
  id: string
  name: string
  email: string
  phone?: string
  dietaryPreference?: string
  allergens?: string[]
  totalOrders?: number
  totalSpent?: number
}

export type OrderData = {
  id: string
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
    notes?: string
  }>
  payment?: {
    subtotal: number
    tax: number
    delivery: number
    total: number
  }
  timestamps?: {
    placed: string
    estimated: string
    completed?: string
  }
}

export type DashboardMetrics = {
  revenue: number
  activeUsers: number
  conversionRate: number
  pendingOrders: number
  totalOrders: number
}

export type PageContextData = {
  menu_details: { item: MenuItemData }
  customer_details: { customer: CustomerData }
  order_details: { order: OrderData }
  dashboard: { metrics: DashboardMetrics }
}

export type PageType = "menu_details" | "customer_details" | "order_details" | "dashboard" 