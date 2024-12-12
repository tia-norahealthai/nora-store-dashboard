"use client"

import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// This would typically come from your API/database
const recentOrders = [
  {
    id: "1",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "JD",
    },
    status: "completed",
    product: "Premium Plan",
    amount: "$99.00",
    date: "2024-03-20",
  },
  {
    id: "2",
    customer: {
      name: "Sarah Wilson",
      email: "sarah.w@example.com",
      avatar: "SW",
    },
    status: "pending",
    product: "Basic Plan",
    amount: "$49.00",
    date: "2024-03-19",
  },
  {
    id: "3",
    customer: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatar: "MC",
    },
    status: "completed",
    product: "Enterprise Plan",
    amount: "$299.00",
    date: "2024-03-19",
  },
  {
    id: "4",
    customer: {
      name: "Emma Thompson",
      email: "emma.t@example.com",
      avatar: "ET",
    },
    status: "pending",
    product: "Premium Plan",
    amount: "$99.00",
    date: "2024-03-18",
  },
  {
    id: "5",
    customer: {
      name: "Robert Garcia",
      email: "r.garcia@example.com",
      avatar: "RG",
    },
    status: "completed",
    product: "Basic Plan",
    amount: "$49.00",
    date: "2024-03-18",
  },
  {
    id: "6",
    customer: {
      name: "Lisa Kim",
      email: "lisa.kim@example.com",
      avatar: "LK",
    },
    status: "completed",
    product: "Enterprise Plan",
    amount: "$299.00",
    date: "2024-03-17",
  },
  {
    id: "7",
    customer: {
      name: "David Brown",
      email: "d.brown@example.com",
      avatar: "DB",
    },
    status: "pending",
    product: "Premium Plan",
    amount: "$99.00",
    date: "2024-03-17",
  },
  {
    id: "8",
    customer: {
      name: "Anna Martinez",
      email: "anna.m@example.com",
      avatar: "AM",
    },
    status: "completed",
    product: "Basic Plan",
    amount: "$49.00",
    date: "2024-03-16",
  },
  {
    id: "9",
    customer: {
      name: "James Wilson",
      email: "j.wilson@example.com",
      avatar: "JW",
    },
    status: "pending",
    product: "Enterprise Plan",
    amount: "$299.00",
    date: "2024-03-16",
  },
  {
    id: "10",
    customer: {
      name: "Sophie Taylor",
      email: "s.taylor@example.com",
      avatar: "ST",
    },
    status: "completed",
    product: "Premium Plan",
    amount: "$99.00",
    date: "2024-03-15",
  }
]

interface RecentOrdersProps {
  orders?: {
    id: string
    customer: {
      name: string
      email: string
      avatar: string
    }
    product: string
    status: string
    amount: string
    date: string
  }[]
}

const RecentOrders = ({ orders = recentOrders }: RecentOrdersProps) => {
  const router = useRouter()

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    {order.customer.avatar}
                  </div>
                </Avatar>
                <div>
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </TableCell>
              <TableCell>{order.amount}</TableCell>
              <TableCell>{order.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { RecentOrders }
export default RecentOrders 