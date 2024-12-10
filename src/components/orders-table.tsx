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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

type Order = {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    avatarUrl?: string
  }
  status: "pending" | "processing" | "completed" | "cancelled"
  product: string
  amount: number
  date: string
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatarUrl: "/avatars/01.png"
    },
    status: "completed",
    product: "Premium Plan",
    amount: 99.00,
    date: "2024-03-20"
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatarUrl: "/avatars/02.png"
    },
    status: "processing",
    product: "Basic Plan",
    amount: 49.00,
    date: "2024-03-19"
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Emma Wilson",
      email: "emma.w@example.com",
      avatarUrl: "/avatars/03.png"
    },
    status: "pending",
    product: "Enterprise Plan",
    amount: 299.00,
    date: "2024-03-18"
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: {
      name: "James Brown",
      email: "j.brown@example.com"
    },
    status: "completed",
    product: "Premium Plan",
    amount: 99.00,
    date: "2024-03-17"
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: {
      name: "Sofia Garcia",
      email: "s.garcia@example.com",
      avatarUrl: "/avatars/04.png"
    },
    status: "cancelled",
    product: "Basic Plan",
    amount: 49.00,
    date: "2024-03-16"
  },
  {
    id: "6",
    orderNumber: "ORD-2024-006",
    customer: {
      name: "Lucas Kim",
      email: "l.kim@example.com"
    },
    status: "processing",
    product: "Enterprise Plan",
    amount: 299.00,
    date: "2024-03-15"
  },
  {
    id: "7",
    orderNumber: "ORD-2024-007",
    customer: {
      name: "Olivia Taylor",
      email: "o.taylor@example.com",
      avatarUrl: "/avatars/05.png"
    },
    status: "completed",
    product: "Premium Plan",
    amount: 99.00,
    date: "2024-03-14"
  },
  {
    id: "8",
    orderNumber: "ORD-2024-008",
    customer: {
      name: "William Lee",
      email: "w.lee@example.com"
    },
    status: "pending",
    product: "Basic Plan",
    amount: 49.00,
    date: "2024-03-13"
  },
  {
    id: "9",
    orderNumber: "ORD-2024-009",
    customer: {
      name: "Isabella Martinez",
      email: "i.martinez@example.com",
      avatarUrl: "/avatars/06.png"
    },
    status: "completed",
    product: "Enterprise Plan",
    amount: 299.00,
    date: "2024-03-12"
  },
  {
    id: "10",
    orderNumber: "ORD-2024-010",
    customer: {
      name: "David Anderson",
      email: "d.anderson@example.com"
    },
    status: "processing",
    product: "Premium Plan",
    amount: 99.00,
    date: "2024-03-11"
  },
  {
    id: "11",
    orderNumber: "ORD-2024-011",
    customer: {
      name: "Ava Thompson",
      email: "a.thompson@example.com",
      avatarUrl: "/avatars/07.png"
    },
    status: "completed",
    product: "Basic Plan",
    amount: 49.00,
    date: "2024-03-10"
  },
  {
    id: "12",
    orderNumber: "ORD-2024-012",
    customer: {
      name: "Ethan Wright",
      email: "e.wright@example.com"
    },
    status: "cancelled",
    product: "Enterprise Plan",
    amount: 299.00,
    date: "2024-03-09"
  },
  {
    id: "13",
    orderNumber: "ORD-2024-013",
    customer: {
      name: "Mia Patel",
      email: "m.patel@example.com",
      avatarUrl: "/avatars/08.png"
    },
    status: "pending",
    product: "Premium Plan",
    amount: 99.00,
    date: "2024-03-08"
  },
  {
    id: "14",
    orderNumber: "ORD-2024-014",
    customer: {
      name: "Alexander Wong",
      email: "a.wong@example.com"
    },
    status: "completed",
    product: "Basic Plan",
    amount: 49.00,
    date: "2024-03-07"
  },
  {
    id: "15",
    orderNumber: "ORD-2024-015",
    customer: {
      name: "Sophie Miller",
      email: "s.miller@example.com",
      avatarUrl: "/avatars/09.png"
    },
    status: "processing",
    product: "Enterprise Plan",
    amount: 299.00,
    date: "2024-03-06"
  }
]

export function OrdersTable() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const filteredOrders = mockOrders.filter(order => 
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Export</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order) => (
            <TableRow 
              key={order.id}
              className="cursor-pointer"
              onClick={() => handleViewDetails(order.id)}
            >
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={order.customer.avatarUrl} alt={order.customer.name} />
                    <AvatarFallback>
                      {order.customer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{order.customer.name}</span>
                    <span className="text-xs text-muted-foreground">{order.customer.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.product}</TableCell>
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
              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
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
                      handleViewDetails(order.id)
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
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 