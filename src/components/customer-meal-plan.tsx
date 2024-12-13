"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateMealPlanForm } from '@/components/create-meal-plan-form'
import { MealPlanSchedule } from '@/components/meal-plan-schedule'
import { Plus, Calendar, Edit2, CheckCircle, Wand2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface CustomerMealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  created_at: string
  status: 'draft' | 'completed' | 'partial'
}

interface CustomerMealPlanProps {
  customerId: string
}

export function CustomerMealPlan({ customerId }: CustomerMealPlanProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mealPlan, setMealPlan] = useState<CustomerMealPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchMealPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items(count)
        `)
        .eq('customer_id', customerId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setMealPlan(data)
    } catch (error) {
      console.error('Error fetching meal plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMealPlan()
  }, [customerId, supabase])

  const handleEditComplete = async () => {
    await fetchMealPlan()
    setIsEditMode(false)
    toast.success('Meal plan updated successfully')
  }

  if (isLoading) {
    return <div className="text-center">Loading meal plan...</div>
  }

  if (isEditMode && mealPlan) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Meal Plan: {mealPlan.name}</h3>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
        <MealPlanSchedule 
          mealPlanId={mealPlan.id}
          customerId={customerId}
          onComplete={handleEditComplete}
          isNewPlan={mealPlan.status === 'draft'}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        {mealPlan ? (
          <>
            {mealPlan.status === 'completed' && (
              <Button 
                variant="outline"
                onClick={() => setIsEditMode(true)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Regenerate Plan
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setIsEditMode(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Schedule
            </Button>
          </>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meal Plan</DialogTitle>
              </DialogHeader>
              <CreateMealPlanForm 
                customerId={customerId} 
                onSuccess={(newMealPlanId) => {
                  setIsDialogOpen(false)
                  setMealPlan({
                    id: newMealPlanId,
                    name: 'New Meal Plan',
                    start_date: new Date().toISOString(),
                    end_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    status: 'draft'
                  })
                  setIsEditMode(true)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {mealPlan ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{mealPlan.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      mealPlan.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : mealPlan.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {mealPlan.status === 'completed' && <CheckCircle className="inline-block mr-1 h-4 w-4" />}
                      {mealPlan.status.charAt(0).toUpperCase() + mealPlan.status.slice(1)}
                    </span>
                  </div>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{formatDate(mealPlan.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{formatDate(mealPlan.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(mealPlan.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground">
          No meal plan found. Create one to get started.
        </div>
      )}
    </div>
  )
} 