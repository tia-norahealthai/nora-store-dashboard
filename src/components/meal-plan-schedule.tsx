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
import { AlertCircle, Wand2 } from 'lucide-react'
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
        // Fetch customer allergens
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('allergens')
          .eq('id', customerId)
          .single()

        if (customerError) throw customerError
        setCustomerAllergens(customerData?.allergens || [])

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, type, allergens, image_url, category')

        if (menuError) throw menuError
        setMenuItems(menuData || [])

        // Fetch existing meal plan items
        const { data: mealPlanData, error: mealPlanError } = await supabase
          .from('meal_plan_items')
          .select(`
            id,
            menu_item_id,
            day,
            daytime,
            menu_items (
              id,
              name,
              type,
              allergens,
              category
            )
          `)
          .eq('meal_plan_id', mealPlanId)

        if (mealPlanError) throw mealPlanError

        // Transform meal plan items into selections state
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

          setSelections(existingSelections)
        }

      } catch (err: any) {
        console.error('Error fetching data:', err)
        toast.error(`Failed to load data: ${err.message}`)
      }
    }

    fetchData()
  }, [mealPlanId, customerId, supabase])

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

  const handleAutoFill = () => {
    setIsLoading(true)
    try {
      // Create a copy of current selections
      const newSelections = { ...selections }

      // For each day, time, and item type combination
      DAYS.forEach(day => {
        TIMES.forEach(time => {
          ITEM_TYPES.forEach(itemType => {
            const timeTypeKey = `${time}_${itemType}`
            
            // Skip if already selected
            if (newSelections[day]?.[timeTypeKey]) return

            // Get available items of this type
            const availableItems = menuItemsByCategory[itemType]?.filter(item => 
              !hasAllergenConflict(item)
            ) || []

            if (availableItems.length > 0) {
              // Randomly select an item
              const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)]
              
              // Add to selections
              newSelections[day] = {
                ...(newSelections[day] || {}),
                [timeTypeKey]: randomItem.id
              }
            }
          })
        })
      })

      setSelections(newSelections)
      toast.success('Empty slots have been automatically filled')
    } catch (error) {
      console.error('Error auto-filling meal plan:', error)
      toast.error('Failed to auto-fill meal plan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleAutoFill}
          disabled={isLoading}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Auto-fill Empty Slots
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Meal Plan'}
        </Button>
      </div>

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
                {ITEM_TYPES.map(itemType => {
                  const timeTypeKey = `${time}_${itemType}`
                  const selectedItemId = selections[day]?.[timeTypeKey]
                  const selectedItem = selectedItemId ? menuItems.find(item => item.id === selectedItemId) : null
                  
                  return (
                    <div key={itemType} className="space-y-2 pl-4">
                      <Label className="capitalize">{itemType}</Label>
                      <Select
                        value={selectedItemId || ""}
                        onValueChange={(value) => handleTimeSelection(time, value, itemType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select a ${itemType}`}>
                            {selectedItem && (
                              <div className="flex items-center gap-2">
                                {selectedItem.image_url && (
                                  <img 
                                    src={getValidImageUrl(selectedItem.image_url)}
                                    alt={selectedItem.name}
                                    className="h-6 w-6 object-cover rounded-sm"
                                  />
                                )}
                                {selectedItem.name}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {menuItemsByCategory[itemType]?.map(item => {
                            const hasConflict = hasAllergenConflict(item)
                            return (
                              <SelectItem 
                                key={item.id} 
                                value={item.id}
                                disabled={hasConflict}
                                className={cn(
                                  "flex items-center gap-2",
                                  hasConflict && "text-destructive relative pl-8"
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
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
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