"use client"

import { useState } from "react"
import { Customer } from '@/lib/types'
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Mail, Phone, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface CustomersTableProps {
  initialData: Customer[]
}

export function CustomersTable({ initialData }: CustomersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredCustomers = initialData.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Link 
            href={`/customers/${customer.id}`} 
            key={customer.id}
            className="block transition-colors hover:bg-muted/50"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/customers/${customer.id}`}
                      >
                        View details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 