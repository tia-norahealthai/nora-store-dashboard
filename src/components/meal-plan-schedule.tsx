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
}

interface MealPlanScheduleProps {
  mealPlanId: string
  customerId: string
  onComplete: () => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIMES = ['morning', 'afternoon', 'evening']

export function MealPlanSchedule({ mealPlanId, customerId, onComplete }: MealPlanScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [customerAllergens, setCustomerAllergens] = useState<string[]>([])
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('allergens')
          .eq('id', customerId)
          .single()

        if (customerError) throw customerError
        setCustomerAllergens(customerData.allergens || [])

        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .order('name')

        if (menuError) throw menuError
        setMenuItems(menuData || [])
      } catch (err) {
        toast.error('Failed to load data')
        console.error('Error fetching data:', err)
      }
    }

    fetchData()
  }, [supabase, customerId])

  const hasAllergenConflict = (menuItem: MenuItem) => {
    return menuItem.allergens?.some(allergen => 
      customerAllergens.includes(allergen)
    )
  }

  const handleTimeSelection = (time: string, menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId)
    if (menuItem && hasAllergenConflict(menuItem)) {
      toast.error('This menu item contains allergens that conflict with customer allergies')
      return
    }

    setSelections(prev => ({
      ...prev,
      [selectedDay]: {
        ...(prev[selectedDay] || {}),
        [time]: menuItemId
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
        Object.entries(times).map(([time, menuItemId]) => ({
          meal_plan_id: mealPlanId,
          menu_item_id: menuItemId,
          day,
          daytime: time
        }))
      )

      const { error: insertError } = await supabase
        .from('meal_plan_items')
        .insert(items)

      if (insertError) {
        throw insertError
      }

      toast.success('Meal plan schedule saved successfully')
      onComplete()
    } catch (err: any) {
      console.error('Error saving meal plan schedule:', err)
      toast.error(err.message || 'Failed to save meal plan schedule')
    } finally {
      setIsLoading(false)
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
          <TabsContent key={day} value={day} className="space-y-4">
            {TIMES.map(time => (
              <div key={time} className="space-y-2">
                <Label className="capitalize">{time}</Label>
                <Select
                  value={selections[day]?.[time] || ''}
                  onValueChange={(value) => handleTimeSelection(time, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a menu item" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map(item => {
                      const hasConflict = hasAllergenConflict(item)
                      return (
                        <SelectItem 
                          key={item.id} 
                          value={item.id}
                          disabled={hasConflict}
                          className={cn(
                            hasConflict && "text-destructive relative pl-8",
                            "flex items-center"
                          )}
                        >
                          {hasConflict && (
                            <AlertCircle className="h-4 w-4 absolute left-2" />
                          )}
                          {item.name}
                          {hasConflict && (
                            <span className="ml-2 text-xs text-destructive">
                              (Contains allergens)
                            </span>
                          )}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
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