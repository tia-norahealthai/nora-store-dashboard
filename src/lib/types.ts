export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  dietary_preferences?: string
  allergens?: string
  drinks_budget?: number
  meals_budget?: number
  snacks_budget?: number
  orders?: Array<{
    id: string
    status: string
    created_at: string
    total_amount: number
    order_items?: Array<{
      id: string
      quantity: number
      item_name: string
      price: number
    }>
  }>
  meal_plans?: Array<{
    id: string
    status: string
    start_date: string
    end_date: string
    created_at: string
    meal_plan_items?: Array<{
      id: string
      day: string
      daytime: string
      type: string
      menu_items: any // Define specific menu item type if needed
    }>
  }>
} 