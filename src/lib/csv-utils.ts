import { parse } from 'papaparse'
import { db } from '@/lib/supabase/db'
import type { MenuItem } from '@/types/store'

export async function processMenuItemsCsv(file: File): Promise<{
  success: boolean
  message: string
  items?: MenuItem[]
}> {
  return new Promise((resolve) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const items = results.data.map((row: any) => ({
            name: row.name,
            description: row.description || null,
            price: parseFloat(row.price),
            category: row.category,
            image_url: row.image_url || null,
            ingredients: row.ingredients ? row.ingredients.split(',').map((i: string) => i.trim()) : [],
            preparation_time: row.preparation_time ? parseInt(row.preparation_time) : null,
            status: 'active'
          }))

          const { data, error } = await db.menu.createBulk(items)
          
          if (error) throw error

          resolve({
            success: true,
            message: `Successfully imported ${items.length} items`,
            items: data
          })
        } catch (error) {
          console.error('Error processing CSV:', error)
          resolve({
            success: false,
            message: 'Error processing CSV file. Please check the format and try again.'
          })
        }
      },
      error: (error) => {
        resolve({
          success: false,
          message: `Error parsing CSV: ${error.message}`
        })
      }
    })
  })
} 