"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import Link from "next/link"

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

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link href={`/orders/${order.id}`} className="hover:underline">
                {order.id.slice(0, 8)}
              </Link>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.customer.name}</div>
                <div className="text-sm text-muted-foreground">{order.customer.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={
                order.status === 'completed' ? 'success' :
                order.status === 'cancelled' ? 'destructive' :
                'secondary'
              }>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              ${order.total_amount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 