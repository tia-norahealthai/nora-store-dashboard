import { createClient } from '@supabase/supabase-js'
import type { MenuItem } from '@/types/store'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

export const db = {
  menu: {
    async getItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          category,
          image_url,
          status,
          ingredients,
          nutritional_info,
          preparation_time,
          created_at,
          updated_at
        `)
      
      if (error) {
        console.error('Error fetching menu items:', error)
        throw error
      }
      return data
    },

    async getItem(id: string) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching menu item:', error)
        throw error
      }
      return data
    },

    async createItem(item: Omit<MenuItem, 'id'>) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating menu item:', error)
        throw error
      }
      return data
    },

    async updateItem(id: string, updates: Partial<MenuItem>) {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating menu item:', error)
        throw error
      }
      return data
    },

    async deleteItem(id: string) {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting menu item:', error)
        throw error
      }
      return true
    }
  }
}

// Add a test function to verify connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('menu_items').select('count')
    if (error) throw error
    console.log('Supabase connection successful:', data)
    return true
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
} 