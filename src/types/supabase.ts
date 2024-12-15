export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          business_hours: Record<string, { open: string; close: string }>
          website?: string
          email?: string
          // Add other fields as needed
        }
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description?: string
          price: number
          category: string
          image_url?: string
          dietary?: string[]
          allergens?: string[]
          ingredients?: string[]
          preparation_time?: number
          created_at: string
          updated_at: string
          calories?: number
          protein?: number
          carbohydrates?: number
          fat?: number
          fiber?: number
          restaurant_id?: string
          type?: string
          cuisine_type?: string
          average_rating?: number
          added_sugars?: number
          processed_food?: boolean
          dressing?: string
          food_benefits?: string[]
          healthy_score?: number
          availability?: string
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      // Add other tables as needed
    }
  }
}

export type MenuItem = Database['public']['Tables']['menu_items']['Row'] 