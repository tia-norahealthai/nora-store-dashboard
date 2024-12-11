import { supabase } from '@/lib/supabase'

export async function fetchTableData(tableName: string, columns: string = '*', options: {
  limit?: number,
  offset?: number,
  orderBy?: string,
  filter?: Record<string, any>
} = {}) {
  try {
    let query = supabase
      .from(tableName)
      .select(columns)

    if (options.orderBy) {
      query = query.order(options.orderBy)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error)
    throw error
  }
} 