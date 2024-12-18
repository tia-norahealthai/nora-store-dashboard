"use client"

import { useRouter } from "next/navigation"
import { Customer } from '@/lib/types'
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomerItem } from "@/components/customer-item"
import { formatDate } from "@/lib/utils"

interface CustomersTableProps {
  initialData: Customer[]
}

export function CustomersTable({ initialData }: CustomersTableProps) {
  const router = useRouter()

  const columns = [
    {
      header: "Customer",
      accessorKey: "name",
      cell: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={customer.avatar_url} alt={customer.name} />
            <AvatarFallback>
              {customer.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{customer.name}</span>
            <span className="text-xs text-muted-foreground">{customer.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Joined",
      accessorKey: "created_at",
      cell: (customer: Customer) => formatDate(customer.created_at),
    },
    {
      header: "Orders",
      accessorKey: "total_orders",
      cell: (customer: Customer) => (
        <div className="text-right">{customer.total_orders || 0}</div>
      ),
    },
  ]

  return (
    <DataTable
      data={initialData}
      columns={columns}
      searchPlaceholder="Search customers..."
      searchKeys={["name", "email", "phone"]}
      gridViewRender={(customer) => <CustomerItem key={customer.id} customer={customer} />}
      onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
    />
  )
} 