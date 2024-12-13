"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateMealPlanForm } from '@/components/create-meal-plan-form'
import { Plus } from 'lucide-react'

interface CustomerMealPlanProps {
  customerId: string
}

export function CustomerMealPlan({ customerId }: CustomerMealPlanProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Meal Plan</DialogTitle>
            </DialogHeader>
            <CreateMealPlanForm customerId={customerId} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* TODO: Add meal plan list/grid view here */}
      <div className="text-center text-muted-foreground">
        No meal plans found. Create one to get started.
      </div>
    </div>
  )
} 