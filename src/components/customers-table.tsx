"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, Utensils, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  avatarUrl?: string
  allergens: string[]
  dietaryPreference: string
}

// This would typically come from your API/database
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    totalOrders: 48,
    totalSpent: 2840.50,
    avatarUrl: "/avatars/01.png",
    allergens: ["Peanuts", "Shellfish"],
    dietaryPreference: "Vegetarian"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 (555) 234-5678",
    totalOrders: 42,
    totalSpent: 2650.75,
    avatarUrl: "/avatars/02.png",
    allergens: ["Lactose"],
    dietaryPreference: "Non-vegetarian"
  },
  // Add more mock customers as needed
]

export function CustomersTable() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (customerId: string) => {
    router.push(`/customers/${customerId}`)
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Customers</h2>
          <Button>Add Customer</Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Dietary Preferences</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer"
              onClick={() => handleViewDetails(customer.id)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{customer.phone}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{customer.dietaryPreference}</span>
                  </div>
                  {customer.allergens.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      <div className="flex gap-1">
                        {customer.allergens.map((allergen) => (
                          <Badge key={allergen} variant="outline" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{customer.totalOrders}</TableCell>
              <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
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
                      handleViewDetails(customer.id)
                    }}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Edit customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete customer
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
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of{" "}
          {filteredCustomers.length} customers
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
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