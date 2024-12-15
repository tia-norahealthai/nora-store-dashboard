"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { MoreHorizontal } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { useRouter } from 'next/navigation'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  restaurant: Database['public']['Tables']['restaurants']['Row']
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_item: Database['public']['Tables']['menu_items']['Row']
  })[]
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()
  
  const totalAmount = order.order_items.reduce(
    (sum, item) => sum + item.quantity * item.menu_item.price,
    0
  )

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {order.customer.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{order.customer.name}</h3>
            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Cancel order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Restaurant</span>
          <span className="text-sm font-medium">{order.restaurant.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Order ID</span>
          <span className="text-sm font-medium">{order.id}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            order.status === "completed" ? "bg-green-50 text-green-700" :
            order.status === "pending" ? "bg-yellow-50 text-yellow-700" :
            order.status === "processing" ? "bg-blue-50 text-blue-700" :
            "bg-red-50 text-red-700"
          }`}>
            {order.status}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium">Items</h4>
        <ul className="mt-2 space-y-2">
          {order.order_items.map((item) => (
            <li key={item.menu_item.id} className="flex items-center justify-between text-sm">
              <span>{item.menu_item.name} × {item.quantity}</span>
              <span className="font-medium">
                {formatCurrency(item.quantity * item.menu_item.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
} 