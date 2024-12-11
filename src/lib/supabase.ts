import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// Create admin client (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create public client (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

// Database interface
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

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('menu_items').select('count')
    if (error) throw error
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
} 