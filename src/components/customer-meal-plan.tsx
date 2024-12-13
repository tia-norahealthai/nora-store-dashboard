"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateMealPlanForm } from '@/components/create-meal-plan-form'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  items: {
    id: string
    day: string
    daytime: string
    menu_item: {
      id: string
      name: string
      image_url: string | null
    }
  }[]
}

interface CustomerMealPlanProps {
  customerId: string
}

export function CustomerMealPlan({ customerId }: CustomerMealPlanProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const { data, error } = await supabase
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
                image_url
              )
            )
          `)
          .eq('customer_id', customerId)
          .order('start_date', { ascending: false })

        if (error) throw error
        setMealPlans(data || [])
      } catch (err) {
        console.error('Error fetching meal plans:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMealPlans()
  }, [customerId, supabase])

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Meal Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Meal Plan</DialogTitle>
            </DialogHeader>
            <CreateMealPlanForm 
              customerId={customerId} 
              onSuccess={() => {
                setIsDialogOpen(false)
                window.location.reload()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading meal plans...
        </div>
      ) : mealPlans.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">No meal plans found.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Meal Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mealPlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(plan.start_date), 'PPP')} - {format(new Date(plan.end_date), 'PPP')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayItems = plan.items.filter(
                    item => item.day === ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index]
                  )
                  return (
                    <div key={day} className="space-y-2">
                      <h4 className="font-medium text-sm">{day}</h4>
                      {['morning', 'afternoon', 'evening'].map(time => {
                        const item = dayItems.find(i => i.daytime === time)
                        return (
                          <div key={time} className="text-sm p-2 bg-muted rounded">
                            <span className="capitalize text-xs text-muted-foreground block">
                              {time}
                            </span>
                            {item ? (
                              <span className="font-medium">{item.menu_item.name}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 