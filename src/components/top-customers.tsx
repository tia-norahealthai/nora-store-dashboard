"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Medal } from "lucide-react"

type Customer = {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  avatarUrl?: string
}

const mockTopCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    totalOrders: 48,
    totalSpent: 2840.50,
    avatarUrl: "/avatars/01.png"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    totalOrders: 42,
    totalSpent: 2650.75,
    avatarUrl: "/avatars/02.png"
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    totalOrders: 39,
    totalSpent: 2470.25,
    avatarUrl: "/avatars/03.png"
  },
  {
    id: "4",
    name: "James Rodriguez",
    email: "j.rodriguez@example.com",
    totalOrders: 35,
    totalSpent: 2180.00,
    avatarUrl: "/avatars/04.png"
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.t@example.com",
    totalOrders: 33,
    totalSpent: 1950.80,
    avatarUrl: "/avatars/05.png"
  },
  {
    id: "6",
    name: "David Kim",
    email: "d.kim@example.com",
    totalOrders: 30,
    totalSpent: 1840.60,
    avatarUrl: "/avatars/06.png"
  },
  {
    id: "7",
    name: "Anna Martinez",
    email: "anna.m@example.com",
    totalOrders: 28,
    totalSpent: 1720.90,
    avatarUrl: "/avatars/07.png"
  },
  {
    id: "8",
    name: "Robert Taylor",
    email: "r.taylor@example.com",
    totalOrders: 25,
    totalSpent: 1580.30,
    avatarUrl: "/avatars/08.png"
  },
  {
    id: "9",
    name: "Sophie Brown",
    email: "sophie.b@example.com",
    totalOrders: 23,
    totalSpent: 1460.75,
    avatarUrl: "/avatars/09.png"
  },
  {
    id: "10",
    name: "Daniel Lee",
    email: "d.lee@example.com",
    totalOrders: 20,
    totalSpent: 1320.40,
    avatarUrl: "/avatars/10.png"
  }
]

const getMedalColor = (index: number) => {
  switch (index) {
    case 0:
      return "text-yellow-500"
    case 1:
      return "text-gray-400"
    case 2:
      return "text-amber-600"
    default:
      return "text-transparent"
  }
}

export function TopCustomers() {
  const router = useRouter()

  const handleViewDetails = (customerId: string) => {
    router.push(`/customers/${customerId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTopCustomers.slice(0, 10).map((customer, index) => (
            <div
              key={customer.id}
              className={`flex items-center justify-between ${
                index < 3 ? 'bg-muted/50 p-3 rounded-lg' : 'p-2'
              } cursor-pointer hover:bg-muted/50 transition-colors`}
              onClick={() => handleViewDetails(customer.id)}
            >
              <div className="flex items-center gap-3">
                <Medal className={`h-5 w-5 ${getMedalColor(index)}`} />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                  <AvatarFallback>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${customer.totalSpent.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{customer.totalOrders} orders</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 