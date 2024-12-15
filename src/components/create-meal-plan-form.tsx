'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

interface CreateMealPlanFormProps {
  customerId: string
  onSuccess?: () => void
}

type MealPlanInsert = Database['public']['Tables']['meal_plans']['Insert']
type MealPlanItemInsert = Database['public']['Tables']['meal_plan_items']['Insert']

export function CreateMealPlanForm({ customerId, onSuccess }: CreateMealPlanFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClientComponentClient<Database>()

      // Validate inputs
      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates')
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (start > end) {
        throw new Error('Start date must be before end date')
      }

      // Create the meal plan
      const mealPlanData: MealPlanInsert = {
        customer_id: customerId,
        start_date: startDate,
        end_date: endDate,
        status: 'draft'
      }

      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert([mealPlanData])
        .select()
        .single()

      if (mealPlanError) {
        console.error('Error creating meal plan:', mealPlanError)
        throw new Error(mealPlanError.message)
      }

      if (!mealPlan) {
        throw new Error('Failed to create meal plan')
      }

      // Create meal plan items
      const days = getDaysBetweenDates(start, end)
      const mealTimes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner']
      
      const mealPlanItems: MealPlanItemInsert[] = days.flatMap(day => 
        mealTimes.map(daytime => ({
          meal_plan_id: mealPlan.id,
          day: day,
          daytime: daytime
        }))
      )

      const { error: itemsError } = await supabase
        .from('meal_plan_items')
        .insert(mealPlanItems)

      if (itemsError) {
        console.error('Error creating meal plan items:', itemsError)
        // Rollback meal plan creation
        await supabase
          .from('meal_plans')
          .delete()
          .eq('id', mealPlan.id)
        throw new Error(itemsError.message)
      }

      toast.success('Meal plan created successfully')
      setIsOpen(false)
      setStartDate('')
      setEndDate('')
      onSuccess?.()

    } catch (error) {
      console.error('Error creating meal plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create meal plan')
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysBetweenDates = (start: Date, end: Date): string[] => {
    const dates: string[] = []
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Meal Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Meal Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !startDate || !endDate} 
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Meal Plan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 