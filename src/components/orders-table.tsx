"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import { DataTable } from "@/components/ui/data-table"
import { OrderCard } from "@/components/order-card"

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

interface OrdersTableProps {
  orders: Order[]
  initialViewMode?: "grid" | "table"
}

export function OrdersTable({ orders, initialViewMode = "table" }: OrdersTableProps) {
  const router = useRouter()

  const columns = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (order: Order) => (
        <span className="font-medium">{order.id.slice(0, 8)}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer",
      cell: (order: Order) => (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-sm text-muted-foreground">{order.customer.email}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (order: Order) => (
        <Badge variant={
          order.status === 'completed' ? 'success' :
          order.status === 'cancelled' ? 'destructive' :
          'secondary'
        }>
          {order.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (order: Order) => formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
    },
    {
      header: "Amount",
      accessorKey: "total_amount",
      cell: (order: Order) => (
        <div className="text-right">${order.total_amount.toFixed(2)}</div>
      ),
    },
  ]

  return (
    <DataTable
      data={orders}
      columns={columns}
      searchPlaceholder="Search orders..."
      searchKeys={["id", "customer.name", "customer.email", "status"]}
      gridViewRender={(order) => <OrderCard key={order.id} order={order} />}
      onRowClick={(order) => router.push(`/orders/${order.id}`)}
      initialViewMode={initialViewMode}
    />
  )
} 