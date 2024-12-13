import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Make sure these environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const db = {
  customers: {
    async getCount() {
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
      return count
    },
    async getActiveCount() {
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
      return count
    }
  },
  orders: {
    async getPendingCount() {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
      return count
    },
    async getTotalCount() {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
      return count
    },
    async getRecentOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      return data
    }
  },
  menu: {
    async getItemsCount() {
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact' })
      return count
    },
    async getCategoriesCount() {
      const { data } = (await supabase
        .from('menu_items')
        .select('category')
        .distinct()) as { data: { category: string }[] }
      return data?.length || 0
    },
    async getItems(options?: { filter?: { restaurant_id?: string } }) {
      try {
        const query = supabase
          .from('menu_items')
          .select('*')
        
        if (options?.filter?.restaurant_id) {
          query.eq('restaurant_id', options.filter.restaurant_id)
        }
        
        const { data, error } = await query.order('name')
        
        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message)
        }
        
        return data || []
      } catch (error) {
        console.error('Error in getItems:', error)
        throw error
      }
    },

    async getItem(id: string) {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          category,
          image_url,
          dietary,
          allergens,
          ingredients,
          preparation_time,
          created_at,
          updated_at,
          calories,
          protein,
          carbohydrates,
          fat,
          fiber,
          restaurant_id,
          type,
          cuisine_type,
          average_rating,
          added_sugars,
          processed_food,
          dressing,
          food_benefits,
          healthy_score,
          availability
        `)
        .eq('id', id)
        .single()
      
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

    async getItemsWithNutrition() {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          category,
          image_url,
          dietary,
          allergens,
          ingredients,
          preparation_time,
          calories,
          protein,
          carbohydrates,
          fat,
          fiber,
          type,
          cuisine_type,
          added_sugars,
          processed_food,
          food_benefits,
          healthy_score
        `)
      
      if (error) {
        console.error('Error fetching menu items:', error)
        throw error
      }

      return data?.map(item => ({
        ...item,
        is_vegetarian: item.dietary?.includes('vegetarian') || false,
        is_vegan: item.dietary?.includes('vegan') || false,
        is_gluten_free: item.dietary?.includes('gluten-free') || false
      })) || []
    },

    async createBulk(items: any[]) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(items)
        .select()

      if (error) throw error
      return { data, error }
    }
  },
  restaurants: {
    async getAll() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async select(columns: string) {
      const { data, error } = await supabase
        .from('restaurants')
        .select(columns)
      
      if (error) throw error
      return { data, error: null }
    },

    async create(restaurant: Omit<Restaurant, 'id'>) {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Restaurant>) {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    },

    async getMetrics() {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')

      if (error) throw error

      const totalLocations = restaurants.length
      const cities = new Set(restaurants.map(r => r.address.split(',')[1]?.trim())).size
      
      // Calculate average hours open with proper typing
      const avgHours = restaurants.reduce((acc: number, restaurant) => {
        if (!restaurant.business_hours) return acc
        const hours = Object.values(restaurant.business_hours as Record<string, { open: string; close: string }>)
          .reduce((sum: number, { open, close }) => {
            const openTime = new Date(`1970-01-01T${open}:00`)
            const closeTime = new Date(`1970-01-01T${close}:00`)
            return sum + (closeTime.getTime() - openTime.getTime()) / (1000 * 60 * 60)
          }, 0)
        return acc + (hours / Object.keys(restaurant.business_hours).length)
      }, 0) / restaurants.length

      // Count digital platforms (website + email = digital presence)
      const digitalPlatforms = restaurants.reduce((acc, r) => {
        let platforms = 0
        if (r.website) platforms++
        if (r.email) platforms++
        return acc + platforms
      }, 0)

      return {
        totalLocations,
        avgHours: Math.round(avgHours),
        cities,
        digitalPlatforms
      }
    }
  }
} 