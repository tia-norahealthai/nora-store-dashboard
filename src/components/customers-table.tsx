"use client"

import { useState } from "react"
import { Customer } from '@/lib/types'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { CustomerItem } from "@/components/customer-item"

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
          <CustomerItem key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  )
} 