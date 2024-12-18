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
          available_days: string[]
          available_times: string[]
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
      restaurant_users: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          phone?: string
          email?: string
          website?: string
          logo_url?: string
          cities?: string[]
          created_at: string
          updated_at: string
          cashback_percentage?: number
        }
      }
    }
  }
}

export type MenuItem = Database['public']['Tables']['menu_items']['Row'] 

export type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  restaurant_locations?: Array<{ count: number }>;
  restaurant_platforms?: Array<{ count: number }>;
  locationCount?: number;
  platformCount?: number;
}