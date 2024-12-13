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
          // Validate required fields
          const requiredFields = ['name', 'price', 'category', 'restaurant_id']
          const missingFields = requiredFields.filter(field => 
            !results.meta.fields?.includes(field)
          )

          if (missingFields.length > 0) {
            resolve({
              success: false,
              message: `Missing required columns: ${missingFields.join(', ')}`
            })
            return
          }

          const items = results.data.map((row: any) => ({
            restaurant_id: row.restaurant_id,
            name: row.name,
            description: row.description || null,
            price: parseFloat(row.price),
            type: row.type || null,
            cuisine_type: row.cuisine_type || null,
            category: row.category,
            average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
            calories: row.calories ? parseInt(row.calories) : null,
            carbohydrates: row.carbohydrates ? parseFloat(row.carbohydrates) : null,
            protein: row.protein ? parseFloat(row.protein) : null,
            fat: row.fat ? parseFloat(row.fat) : null,
            added_sugars: row.added_sugars ? parseFloat(row.added_sugars) : null,
            processed_food: row.processed_food === 'true' || row.processed_food === '1',
            ingredients: row.ingredients ? row.ingredients.split(',').map((i: string) => i.trim()) : [],
            dressing: row.dressing || null,
            food_benefits: row.food_benefits ? row.food_benefits.split(',').map((b: string) => b.trim()) : [],
            allergens: row.allergens ? row.allergens.split(',').map((a: string) => a.trim()) : [],
            healthy_score: row.healthy_score ? parseInt(row.healthy_score) : null,
            image_url: row.image_url || null,
            availability: row.availability || 'available'
          }))

          // Validate data types
          const invalidItems = items.filter(item => 
            isNaN(item.price) || 
            (item.average_rating !== null && isNaN(item.average_rating)) ||
            (item.calories !== null && isNaN(item.calories)) ||
            (item.carbohydrates !== null && isNaN(item.carbohydrates)) ||
            (item.protein !== null && isNaN(item.protein)) ||
            (item.fat !== null && isNaN(item.fat)) ||
            (item.added_sugars !== null && isNaN(item.added_sugars)) ||
            (item.healthy_score !== null && isNaN(item.healthy_score))
          )

          if (invalidItems.length > 0) {
            resolve({
              success: false,
              message: `Invalid data types found in ${invalidItems.length} items. Please ensure:\n` +
                      '- price is a number\n' +
                      '- average_rating is a number\n' +
                      '- calories is a whole number\n' +
                      '- carbohydrates, protein, fat, and added_sugars are numbers\n' +
                      '- healthy_score is a whole number'
            })
            return
          }

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
            message: error instanceof Error ? error.message : 'Error processing CSV file. Please check the format and try again.'
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