export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          created_at: string
          dietary_preferences?: string
          allergens?: string
          drinks_budget?: number
          meals_budget?: number
          snacks_budget?: number
        }
      }
      orders: {
        Row: {
          id: string
          status: string
          created_at: string
          total_amount: number
          customer_id: string
        }
      }
      order_items: {
        Row: {
          id: string
          quantity: number
          menu_item_id: string
          order_id: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          price: number
          description?: string
          category?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          customer_id: string
          start_date: string
          end_date: string
          status: 'draft' | 'completed' | 'partial'
          created_at: string
        }
        Insert: {
          customer_id: string
          start_date: string
          end_date: string
          status: 'draft' | 'completed' | 'partial'
        }
      }
      meal_plan_items: {
        Row: {
          id: string
          meal_plan_id: string
          day: string
          daytime: 'breakfast' | 'lunch' | 'dinner'
          menu_item_id?: string
        }
        Insert: {
          meal_plan_id: string
          day: string
          daytime: 'breakfast' | 'lunch' | 'dinner'
          menu_item_id?: string
        }
      }
    }
  }
}

export type MenuItem = Database['public']['Tables']['menu_items']['Row'] 