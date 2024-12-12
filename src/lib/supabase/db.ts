import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      const { data } = await supabase
        .from('menu_items')
        .select('category')
        .distinct()
      return data?.length || 0
    },
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
      
      if (error) throw error
      return data
    },

    async getItem(id: string) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
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
          status,
          ingredients,
          nutritional_info,
          preparation_time,
          created_at,
          updated_at
        `)
      
      if (error) {
        console.error('Error fetching menu items with nutrition:', error)
        throw error
      }

      return data?.map(item => ({
        ...item,
        calories: item.nutritional_info?.calories,
        protein: item.nutritional_info?.protein,
        carbohydrates: item.nutritional_info?.carbohydrates,
        fat: item.nutritional_info?.fat,
        fiber: item.nutritional_info?.fiber,
        is_vegetarian: item.nutritional_info?.is_vegetarian,
        is_vegan: item.nutritional_info?.is_vegan,
        is_gluten_free: item.nutritional_info?.is_gluten_free,
        allergens: item.nutritional_info?.allergens
      })) || []
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

    async create(restaurant: Database['public']['Tables']['restaurants']['Insert']) {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['restaurants']['Update']) {
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
      
      // Calculate average hours open
      const avgHours = restaurants.reduce((acc, restaurant) => {
        if (!restaurant.business_hours) return acc
        const hours = Object.values(restaurant.business_hours).reduce((sum, { open, close }) => {
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