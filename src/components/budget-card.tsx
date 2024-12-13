import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface BudgetCardProps {
  title: string
  maxBudget: number
  currentSelection: number
  dailyTotal: number
  weeklyTotal: number
  itemCount: number
  maxItems?: number
}

export function BudgetCard({
  title,
  maxBudget,
  currentSelection,
  dailyTotal,
  weeklyTotal,
  itemCount,
  maxItems = 21
}: BudgetCardProps) {
  // Helper function to calculate percentage
  const calculatePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  return (
    <div className="p-4 border rounded-lg">
      <Label className="text-xl font-semibold">{title} Budget</Label>
      <div className="flex justify-between mt-1">
        <span className="text-muted-foreground">
          Max ${maxBudget.toFixed(2)} per {title.toLowerCase()}
        </span>
      </div>
      
      {/* Current selection cost */}
      <div className="mt-1 text-sm space-y-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Current Selection:</span>
          <span>${currentSelection.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Today's Total:</span>
          <span>${dailyTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Weekly totals with progress bar */}
      <div className="mt-2 text-sm border-t pt-2 space-y-2">
        <div className="flex justify-between text-muted-foreground">
          <span>Weekly Total:</span>
          <span>${weeklyTotal.toFixed(2)}</span>
        </div>
        <Progress 
          value={calculatePercentage(weeklyTotal, maxBudget * maxItems)} 
          className="h-2"
        />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>Items Selected:</span>
          <span>{itemCount} / {maxItems}</span>
        </div>
      </div>
    </div>
  )
} 