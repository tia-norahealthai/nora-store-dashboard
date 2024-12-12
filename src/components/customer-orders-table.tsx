"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface OrderItem {
  id: string
  quantity: number
  item_name: string
  price: number
}

interface Order {
  id: string
  status: string
  created_at: string
  total_amount: number
  order_items?: OrderItem[]
}

interface CustomerOrdersTableProps {
  orders: Order[]
}

export function CustomerOrdersTable({ orders }: CustomerOrdersTableProps) {
  const router = useRouter()

  const getOrderItemsText = (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return "No items"
    }
    return order.order_items.map(item => `${item.quantity}x ${item.item_name}`).join(", ")
  }

  return orders.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="cursor-pointer"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{getOrderItemsText(order)}</TableCell>
            <TableCell>
              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                order.status === "completed" ? "bg-green-50 text-green-700" :
                order.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                order.status === "processing" ? "bg-blue-50 text-blue-700" :
                "bg-red-50 text-red-700"
              }`}>
                {order.status}
              </div>
            </TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
            <TableCell className="text-right">
              ${order.total_amount?.toFixed(2) || '0.00'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/orders/${order.id}`)
                  }}>
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    Update status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Cancel order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <div className="p-6">
      <p className="text-muted-foreground">No orders yet</p>
    </div>
  )
} 