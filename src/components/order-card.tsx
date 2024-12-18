"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from "next/navigation"

interface Order {
  id: string
  status: string
  created_at: string
  total_amount: number
  customer: {
    name: string
    email: string
  }
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()

  return (
    <Card
      onClick={() => router.push(`/orders/${order.id}`)}
      className="cursor-pointer hover:border-foreground/50 transition-colors"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="font-medium">
            {order.id.slice(0, 8)}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
          </p>
        </div>
        <Badge variant={
          order.status === 'completed' ? 'success' :
          order.status === 'cancelled' ? 'destructive' :
          'secondary'
        }>
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="font-medium">{order.customer.name}</div>
            <div className="text-sm text-muted-foreground">{order.customer.email}</div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="font-medium">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 