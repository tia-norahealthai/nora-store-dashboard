"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  items: MealPlanItem[]
}

interface MealPlanItem {
  id: string
  day: string
  daytime: string
  menu_item: {
    id: string
    name: string
    price: number
  }
}

interface CustomerMealPlanProps {
  customerId: string
}

export function CustomerMealPlan({ customerId }: CustomerMealPlanProps) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMealPlan() {
      const { data: mealPlans, error } = await supabase
        .from('meal_plans')
        .select(`
          id,
          name,
          start_date,
          end_date,
          items:meal_plan_items(
            id,
            day,
            daytime,
            menu_item:menu_items(
              id,
              name,
              price
            )
          )
        `)
        .eq('customer_id', customerId)
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching meal plan:', error)
        setLoading(false)
        return
      }

      setMealPlan(mealPlans)
      setLoading(false)
    }

    fetchMealPlan()
  }, [customerId])

  if (loading) {
    return <div>Loading meal plan...</div>
  }

  if (!mealPlan) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No meal plan found</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Meal Plan
        </Button>
      </div>
    )
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayTimes = ['morning', 'afternoon', 'evening']

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{mealPlan.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(mealPlan.start_date)} - {formatDate(mealPlan.end_date)}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Edit Plan
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Time</TableHead>
              {daysOfWeek.map((day) => (
                <TableHead key={day} className="capitalize">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayTimes.map((time) => (
              <TableRow key={time}>
                <TableCell className="font-medium capitalize">{time}</TableCell>
                {daysOfWeek.map((day) => {
                  const meal = mealPlan?.items?.find(
                    (item) => item.day === day && item.daytime === time
                  )
                  return (
                    <TableCell key={`${day}-${time}`}>
                      {meal?.menu_item?.name || '-'}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 