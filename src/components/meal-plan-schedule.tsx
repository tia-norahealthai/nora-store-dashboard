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
import { generateMealPlan } from '@/lib/meal-plan-generator'
import { Progress } from "@/components/ui/progress"
import { BudgetCard } from "@/components/budget-card"

interface MenuItem {
  id: string
  name: string
  allergens: string[]
  category: string
  type: 'Meal' | 'Snack' | 'Drink'
  image_url?: string
  price: number
  available_days: string[]
  available_times: string[]
}

interface CustomerBudget {
  meals_budget: number
  snacks_budget: number
  drinks_budget: number
}

interface MealPlanScheduleProps {
  mealPlanId: string
  customerId: string
  onComplete: () => void
  isNewPlan?: boolean
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIMES = ['morning', 'afternoon', 'evening']
const ITEM_TYPES = ['meal', 'snack', 'drink'] as const

export function MealPlanSchedule({ 
  mealPlanId, 
  customerId, 
  onComplete,
  isNewPlan = false 
}: MealPlanScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [customerAllergens, setCustomerAllergens] = useState<string[]>([])
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [customerBudget, setCustomerBudget] = useState<CustomerBudget>({
    meals_budget: 0,
    snacks_budget: 0,
    drinks_budget: 0
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!mealPlanId || !customerId) {
        console.error('Missing required props:', { mealPlanId, customerId })
        return
      }

      try {
        // Fetch customer data including budgets
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('allergens, meals_budget, snacks_budget, drinks_budget')
          .eq('id', customerId)
          .single()

        if (customerError) throw customerError
        setCustomerAllergens(customerData?.allergens || [])
        
        // Set budgets directly from database values
        setCustomerBudget({
          meals_budget: customerData?.meals_budget || 0,
          snacks_budget: customerData?.snacks_budget || 0,
          drinks_budget: customerData?.drinks_budget || 0
        })

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, type, allergens, image_url, category, available_days, available_times')

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

  useEffect(() => {
    const initializeNewPlan = async () => {
      if (isNewPlan && menuItems.length > 0) {
        setIsLoading(true)
        try {
          await handleAutoGenerate()
          await handleSave() // Automatically save after generation
          onComplete() // Call onComplete to update the UI
        } catch (error) {
          console.error('Error initializing new plan:', error)
          toast.error('Failed to initialize meal plan')
        } finally {
          setIsLoading(false)
        }
      }
    }

    initializeNewPlan()
  }, [isNewPlan, menuItems])

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
    
    if (!menuItem) return

    // Check allergens
    if (hasAllergenConflict(menuItem)) {
      toast.error('This menu item contains allergens that conflict with customer allergies')
      return
    }

    // Check budget
    const budgetKey = `${itemType}s_budget` as keyof CustomerBudget
    if (menuItem.price > customerBudget[budgetKey]) {
      toast.error(`This item exceeds the maximum ${itemType} budget of $${customerBudget[budgetKey].toFixed(2)}`)
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
    const violations = checkBudgetViolations(selections)
    
    if (violations.length > 0) {
      toast.error(
        <div className="space-y-2">
          <p>Cannot save meal plan. The following items exceed budget limits:</p>
          <ul className="list-disc pl-4">
            {violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
        </div>
      )
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

      if (insertError) throw insertError

      // Update meal plan status to completed
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({ status: 'completed' })
        .eq('id', mealPlanId)

      if (updateError) throw updateError

      return true
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

  const calculateCurrentCosts = (currentSelections: Record<string, Record<string, string>>) => {
    const costs = {
      meal: 0,
      snack: 0,
      drink: 0
    }

    Object.values(currentSelections).forEach(daySelections => {
      Object.entries(daySelections).forEach(([timeType, itemId]) => {
        const [_, type] = timeType.split('_')
        const item = menuItems.find(item => item.id === itemId)
        if (item) {
          costs[type as keyof typeof costs] += item.price
        }
      })
    })

    return costs
  }

  const selectAppropriateItem = (
    items: MenuItem[], 
    day: string, 
    time: string, 
    itemType: typeof ITEM_TYPES[number],
    currentSelections: Record<string, Record<string, string>>
  ): MenuItem | null => {
    // Get budget limit for this type
    const budgetKey = `${itemType}s_budget` as keyof CustomerBudget
    const budgetLimit = customerBudget[budgetKey]
    
    // Filter items by price and previous filters
    const daySelections = currentSelections[day] || {}
    const itemsUsedToday = new Set(Object.values(daySelections))
    
    const affordableItems = items.filter(item => 
      !itemsUsedToday.has(item.id) && 
      item.price <= budgetLimit // Check against individual item budget limit
    )
    
    if (affordableItems.length === 0) {
      return null // No affordable items available
    }
    
    // Prefer items that don't exceed budget
    return affordableItems[Math.floor(Math.random() * affordableItems.length)]
  }

  const handleAutoGenerate = async () => {
    try {
      const newSelections = { ...selections }

      DAYS.forEach(day => {
        newSelections[day] = newSelections[day] || {}

        TIMES.forEach(time => {
          ITEM_TYPES.forEach(itemType => {
            const timeTypeKey = `${time}_${itemType}`
            
            const availableItems = menuItemsByCategory[itemType]?.filter(item => 
              !hasAllergenConflict(item)
            ) || []

            if (availableItems.length > 0) {
              const selectedItem = selectAppropriateItem(
                availableItems, 
                day, 
                time, 
                itemType,
                newSelections
              )
              
              if (selectedItem) {
                newSelections[day][timeTypeKey] = selectedItem.id
              } else {
                toast.warning(`Could not find affordable ${itemType} for ${day} ${time}`)
              }
            }
          })
        })
      })

      // Calculate final costs
      const finalCosts = calculateCurrentCosts(newSelections)
      
      // Check if we're within budget
      const isWithinBudget = 
        finalCosts.meal <= customerBudget.meals_budget &&
        finalCosts.snack <= customerBudget.snacks_budget &&
        finalCosts.drink <= customerBudget.drinks_budget

      if (!isWithinBudget) {
        toast.warning('Some items could not be added due to budget constraints')
      }

      setSelections(newSelections)
      return newSelections
    } catch (error) {
      console.error('Error generating meal plan:', error)
      throw error
    }
  }

  // Add this function to check if an item exceeds budget
  const checkBudgetViolations = (selections: Record<string, Record<string, string>>) => {
    const violations: string[] = []

    Object.entries(selections).forEach(([day, daySelections]) => {
      Object.entries(daySelections).forEach(([timeType, itemId]) => {
        const [daytime, type] = timeType.split('_')
        const item = menuItems.find(item => item.id === itemId)
        const budgetKey = `${type}s_budget` as keyof CustomerBudget
        
        if (item && item.price > customerBudget[budgetKey]) {
          violations.push(`${item.name} (${day} ${daytime}) exceeds ${type} budget of $${customerBudget[budgetKey].toFixed(2)}`)
        }
      })
    })

    return violations
  }

  // Add this function to calculate weekly totals
  const calculateWeeklyTotals = (currentSelections: Record<string, Record<string, string>>) => {
    const totals = {
      meals: { count: 0, cost: 0 },
      snacks: { count: 0, cost: 0 },
      drinks: { count: 0, cost: 0 }
    }

    Object.values(currentSelections).forEach(daySelections => {
      Object.entries(daySelections).forEach(([timeType, itemId]) => {
        const [_, type] = timeType.split('_')
        const item = menuItems.find(item => item.id === itemId)
        if (item) {
          const category = `${type}s` as keyof typeof totals
          totals[category].count++
          totals[category].cost += item.price
        }
      })
    })

    return totals
  }

  // Add this function to get the selected item's cost for the current day and time
  const getCurrentSelectionCost = (type: typeof ITEM_TYPES[number], time: string) => {
    const timeTypeKey = `${time}_${type}`
    const selectedItemId = selections[selectedDay]?.[timeTypeKey]
    const selectedItem = menuItems.find(item => item.id === selectedItemId)
    return selectedItem?.price || 0
  }

  // Add this helper function to calculate percentage
  const calculatePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  // Add this function to calculate current day's total
  const getCurrentDayTotal = (type: typeof ITEM_TYPES[number]) => {
    const daySelections = selections[selectedDay] || {}
    return Object.entries(daySelections)
      .filter(([timeType]) => timeType.endsWith(type))
      .reduce((total, [_, itemId]) => {
        const item = menuItems.find(item => item.id === itemId)
        return total + (item?.price || 0)
      }, 0)
  }

  const getAvailableMenuItems = (
    allItems: MenuItem[], 
    day: string, 
    time: string
  ) => {
    return allItems.filter(item => 
      item.available_days.includes(day.toLowerCase()) &&
      item.available_times.includes(time.toLowerCase())
    )
  }

  // Only show the UI if it's not a new plan being auto-generated
  if (isNewPlan && isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Generating your meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <BudgetCard
          title="Meals"
          maxBudget={customerBudget.meals_budget}
          currentSelection={getCurrentSelectionCost('meal', TIMES[0])}
          dailyTotal={getCurrentDayTotal('meal')}
          weeklyTotal={calculateWeeklyTotals(selections).meals.cost}
          itemCount={calculateWeeklyTotals(selections).meals.count}
        />
        <BudgetCard
          title="Snacks"
          maxBudget={customerBudget.snacks_budget}
          currentSelection={getCurrentSelectionCost('snack', TIMES[0])}
          dailyTotal={getCurrentDayTotal('snack')}
          weeklyTotal={calculateWeeklyTotals(selections).snacks.cost}
          itemCount={calculateWeeklyTotals(selections).snacks.count}
        />
        <BudgetCard
          title="Drinks"
          maxBudget={customerBudget.drinks_budget}
          currentSelection={getCurrentSelectionCost('drink', TIMES[0])}
          dailyTotal={getCurrentDayTotal('drink')}
          weeklyTotal={calculateWeeklyTotals(selections).drinks.cost}
          itemCount={calculateWeeklyTotals(selections).drinks.count}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {!isNewPlan && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAutoGenerate().then(handleSave)}
                disabled={isLoading}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Regenerate Plan
              </Button>
              <Button
                variant="outline"
                onClick={handleAutoFill}
                disabled={isLoading}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Auto-fill Empty Slots
              </Button>
            </>
          )}
        </div>
        {!isNewPlan && (
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Meal Plan'}
          </Button>
        )}
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
                          {getAvailableMenuItems(menuItemsByCategory[itemType], selectedDay, time)
                            .map(item => (
                              <SelectItem 
                                key={item.id} 
                                value={item.id}
                                disabled={hasAllergenConflict(item)}
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
                            ))}
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