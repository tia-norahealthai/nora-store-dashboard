'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  allergens: string[]
  category: string
  type: 'Meal' | 'Snack' | 'Drink'
  image_url?: string
}

interface MealPlanScheduleProps {
  mealPlanId: string
  customerId: string
  onComplete: () => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIMES = ['morning', 'afternoon', 'evening']
const ITEM_TYPES = ['meal', 'snack', 'drink'] as const

export function MealPlanSchedule({ mealPlanId, customerId, onComplete }: MealPlanScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [customerAllergens, setCustomerAllergens] = useState<string[]>([])
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!mealPlanId || !customerId) {
        console.error('Missing required props:', { mealPlanId, customerId })
        return
      }

      try {
        console.log('Checking meal plan:', mealPlanId)
        const { data: mealPlanExists, error: mealPlanCheckError } = await supabase
          .from('meal_plans')
          .select('id')
          .eq('id', mealPlanId)
          .single()

        if (mealPlanCheckError) {
          console.error('Meal plan check error:', mealPlanCheckError)
          if (mealPlanCheckError.code !== 'PGRST116') {
            throw mealPlanCheckError
          }
        }

        console.log('Fetching customer data:', customerId)
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('allergens')
          .eq('id', customerId)
          .single()

        if (customerError) {
          console.error('Customer fetch error:', customerError)
          throw customerError
        }
        setCustomerAllergens(customerData?.allergens || [])

        console.log('Fetching menu items')
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, type, allergens, image_url')

        if (menuError) {
          console.error('Menu items fetch error:', menuError)
          throw menuError
        }
        
        console.log('Menu items fetched:', menuData?.length || 0, 'items')
        setMenuItems(menuData || [])

        // Only try to fetch meal plan items if we confirmed the meal plan exists
        if (mealPlanExists) {
          console.log('Fetching meal plan items for:', mealPlanId)
          const { data: mealPlanData, error: mealPlanError } = await supabase
            .from('meal_plan_items')
            .select(`
              menu_item_id,
              day,
              daytime,
              menu_items (
                id,
                name,
                type,
                allergens
              )
            `)
            .eq('meal_plan_id', mealPlanId)

          if (mealPlanError) {
            console.error('Meal plan items fetch error:', mealPlanError)
            throw mealPlanError
          }

          console.log('Meal plan items fetched:', mealPlanData?.length || 0, 'items')
          if (mealPlanData) {
            const existingSelections = mealPlanData.reduce((acc, item) => {
              const day = item.day
              const menuItem = item.menu_items
              const timeType = `${item.daytime}_${menuItem.type.toLowerCase()}`
              return {
                ...acc,
                [day]: {
                  ...(acc[day] || {}),
                  [timeType]: item.menu_item_id
                }
              }
            }, {} as Record<string, Record<string, string>>)

            console.log('Setting selections:', existingSelections)
            setSelections(existingSelections)
          }
        } else {
          console.log('New meal plan - no existing items to fetch')
        }
      } catch (err: any) {
        console.error('Detailed error:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          stack: err.stack
        })
        
        // Only show error for non-404 errors
        if (err.code !== 'PGRST116') {
          toast.error(`Failed to load data: ${err.message || 'Unknown error'}`)
        }
      }
    }

    fetchData()
  }, [supabase, customerId, mealPlanId])

  const hasAllergenConflict = (menuItem: MenuItem) => {
    return menuItem.allergens?.some(allergen => 
      customerAllergens.includes(allergen)
    )
  }

  const menuItemsByCategory = menuItems.reduce((acc, item) => {
    const type = item.type?.toLowerCase() || ''
    
    if (type === 'drink') {
      acc.drink = [...(acc.drink || []), item]
    } else if (type === 'snack') {
      acc.snack = [...(acc.snack || []), item]
    } else if (type === 'meal') {
      acc.meal = [...(acc.meal || []), item]
    }
    return acc
  }, {} as Record<typeof ITEM_TYPES[number], MenuItem[]>)

  useEffect(() => {
    console.log('Menu Items by Category:', menuItemsByCategory)
  }, [menuItemsByCategory])

  const handleTimeSelection = (time: string, menuItemId: string, itemType: typeof ITEM_TYPES[number]) => {
    // If placeholder is selected, clear the selection
    if (menuItemId === 'placeholder') {
      setSelections(prev => {
        const newDaySelections = { ...(prev[selectedDay] || {}) }
        delete newDaySelections[`${time}_${itemType}`]
        return {
          ...prev,
          [selectedDay]: newDaySelections
        }
      })
      return
    }

    const menuItem = menuItems.find(item => item.id === menuItemId)
    if (menuItem && hasAllergenConflict(menuItem)) {
      toast.error('This menu item contains allergens that conflict with customer allergies')
      return
    }

    setSelections(prev => ({
      ...prev,
      [selectedDay]: {
        ...(prev[selectedDay] || {}),
        [`${time}_${itemType}`]: menuItemId
      }
    }))
  }

  const handleSave = async () => {
    const hasSelections = Object.keys(selections).length > 0 && 
      Object.values(selections).some(daySelections => 
        Object.keys(daySelections).length > 0
      )

    if (!hasSelections) {
      toast.error('Please select at least one menu item')
      return
    }

    setIsLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', mealPlanId)

      if (deleteError) throw deleteError

      const items = Object.entries(selections).flatMap(([day, times]) =>
        Object.entries(times).map(([timeType, menuItemId]) => {
          const [daytime] = timeType.split('_')
          return {
            meal_plan_id: mealPlanId,
            menu_item_id: menuItemId,
            day,
            daytime
          }
        })
      )

      const { error: insertError } = await supabase
        .from('meal_plan_items')
        .insert(items)

      if (insertError) {
        throw insertError
      }

      toast.success('Meal plan schedule updated successfully')
      onComplete()
    } catch (err: any) {
      console.error('Error saving meal plan schedule:', err)
      toast.error(err.message || 'Failed to save meal plan schedule')
    } finally {
      setIsLoading(false)
    }
  }

  const getValidImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-dish.jpg'
    
    try {
      // Handle relative URLs
      if (url.startsWith('/')) {
        return url
      }
      
      // Handle absolute URLs
      const urlObj = new URL(url)
      return url
    } catch (error) {
      console.warn('Invalid image URL:', url)
      return '/images/placeholder-dish.jpg'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="grid grid-cols-7">
          {DAYS.map(day => (
            <TabsTrigger key={day} value={day} className="capitalize">
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
        {DAYS.map(day => (
          <TabsContent key={day} value={day} className="space-y-4 max-h-[60vh] overflow-y-auto">
            {TIMES.map(time => (
              <div key={time} className="space-y-4">
                <Label className="capitalize font-bold sticky top-0 bg-background py-2">
                  {time}
                </Label>
                {ITEM_TYPES.map(itemType => (
                  <div key={itemType} className="space-y-2 pl-4">
                    <Label className="capitalize">{itemType}</Label>
                    <Select
                      value={selections[day]?.[`${time}_${itemType}`] || 'placeholder'}
                      onValueChange={(value) => handleTimeSelection(time, value, itemType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${itemType}`} />
                      </SelectTrigger>
                      <SelectContent 
                        className="max-h-[200px] overflow-y-auto"
                        position="popper"
                        align="start"
                        side="bottom"
                        sideOffset={5}
                      >
                        <SelectItem value="placeholder" className="text-muted-foreground">
                          Select a {itemType}
                        </SelectItem>
                        <div className="overflow-y-auto">
                          {(menuItemsByCategory[itemType] || []).map(item => {
                            const hasConflict = hasAllergenConflict(item)
                            return (
                              <SelectItem 
                                key={item.id} 
                                value={item.id}
                                disabled={hasConflict}
                                className={cn(
                                  hasConflict && "text-destructive relative pl-8",
                                  "flex items-center gap-2 py-2"
                                )}
                              >
                                {hasConflict && (
                                  <AlertCircle className="h-4 w-4 absolute left-2" />
                                )}
                                <div className="flex items-center gap-2 flex-1">
                                  <img 
                                    src={getValidImageUrl(item.image_url)}
                                    alt={item.name}
                                    className="h-8 w-8 object-cover rounded-sm flex-shrink-0"
                                  />
                                  <span className="font-medium truncate">
                                    {item.name}
                                    {hasConflict && (
                                      <span className="ml-2 text-xs text-destructive">
                                        (Contains allergens)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Button 
        onClick={handleSave} 
        disabled={isLoading} 
        className="w-full"
      >
        {isLoading ? 'Saving...' : 'Save Meal Plan'}
      </Button>
    </div>
  )
} 