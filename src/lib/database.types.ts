export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          status: string
          total_amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          status?: string
          total_amount: number
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          status?: string
          total_amount?: number
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
        }
      }
    }
  }
} 