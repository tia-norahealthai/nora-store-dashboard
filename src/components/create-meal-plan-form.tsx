'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface CreateMealPlanFormProps {
  customerId: string
}

export function CreateMealPlanForm({ customerId }: CreateMealPlanFormProps) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [startDateDialogOpen, setStartDateDialogOpen] = useState(false)
  const [endDateDialogOpen, setEndDateDialogOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          customer_id: customerId,
          name,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Meal plan created successfully')
      router.refresh()
    } catch (error) {
      console.error('Error creating meal plan:', error)
      toast.error('Failed to create meal plan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Weekly Meal Plan"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Dialog open={startDateDialogOpen} onOpenChange={setStartDateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>Select Start Date</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date)
                    setStartDateDialogOpen(false)
                  }}
                  disabled={(date) =>
                    date < new Date() || (endDate ? date > endDate : false)
                  }
                  initialFocus
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Dialog open={endDateDialogOpen} onOpenChange={setEndDateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>Select End Date</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date)
                    setEndDateDialogOpen(false)
                  }}
                  disabled={(date) =>
                    date < new Date() || (startDate ? date < startDate : false)
                  }
                  initialFocus
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Meal Plan'}
      </Button>
    </form>
  )
} 