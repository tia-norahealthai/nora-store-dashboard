export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string
          name: string
          description?: string
          price: number
          category: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>
      }
      customers: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['customers']['Row']>
      }
      // Add other tables as needed
    }
  }
} 