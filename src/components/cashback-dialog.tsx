"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'

interface CashbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
}

export function CashbackDialog({ open, onOpenChange, restaurantId }: CashbackDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPercentage, setSelectedPercentage] = useState("5")
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('restaurants')
        .update({ cashback_percentage: parseFloat(selectedPercentage) })
        .eq('id', restaurantId)

      if (error) throw error

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Error setting cashback percentage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Cashback Percentage</DialogTitle>
          <DialogDescription>
            Choose the cashback percentage you want to offer to your customers. This will apply to all orders.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Select
            value={selectedPercentage}
            onValueChange={setSelectedPercentage}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select percentage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="2">2%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="10">10%</SelectItem>
              <SelectItem value="15">15%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 