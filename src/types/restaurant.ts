export interface Restaurant {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  business_hours: Record<string, { open: string; close: string }>
  cashback_percentage: number
  created_at: string
  orders?: Array<{
    id: string
    created_at: string
    status: string
    customer: {
      id: string
      name: string
      email: string
    }
    order_items: Array<{
      quantity: number
      menu_item?: {
        name: string
        price: number
      }
    }>
  }>
}

export interface RestaurantMetrics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  averageCostPerOrder: number
  fixedFeeRate: number
  cashbackRate: number
  cashbackPercentage: number
} 