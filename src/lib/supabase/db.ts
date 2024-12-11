import { supabase } from './client'

export const db = {
  menu: {
    async getItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
      
      if (error) throw error
      return data
    },

    async createItem(item: any) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async updateItem(id: string, updates: any) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async deleteItem(id: string) {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    },

    getItemsWithNutrition: async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
        
        if (error) {
          console.error('Supabase error details:', error)
          throw error
        }
        
        if (!data) {
          console.error('No data returned from Supabase')
          return []
        }
        
        console.log('Successfully fetched data:', data)
        return data
      } catch (err) {
        console.error('Error in getItemsWithNutrition:', err)
        throw err
      }
    }
  },
  
  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
      
      if (error) throw error
      return data
    }
  },

  orders: {
    async getAll() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
      
      if (error) throw error
      return data
    }
  }
} 