export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  snacks_budget?: number
  meals_budget?: number
  drinks_budget?: number
  food_preferences?: string[]
  total_orders: number
} 