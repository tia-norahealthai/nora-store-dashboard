import { Button } from "@/components/ui/button"
import { OrderStatus } from "@/app/orders/[id]/page"

interface StatusFilterProps {
  currentStatus: OrderStatus | 'all'
  onStatusChange: (status: OrderStatus | 'all') => void
}

const statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'processing', 'completed', 'cancelled']

export function StatusFilter({ currentStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={currentStatus === status ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(status)}
        >
          {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
  )
} 