"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { RestaurantCard } from "@/components/restaurant-card"
import type { Database } from "@/lib/database.types"

type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  orders_count?: number
}

interface RestaurantsTableProps {
  initialData: Restaurant[]
}

export function RestaurantsTable({ initialData }: RestaurantsTableProps) {
  const router = useRouter()

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (restaurant: Restaurant) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{restaurant.name}</span>
        </div>
      ),
    },
    {
      header: "Location",
      accessorKey: "address",
    },
    {
      header: "Contact",
      accessorKey: "phone",
      cell: (restaurant: Restaurant) => restaurant.phone || restaurant.email,
    },
    {
      header: "Hours",
      accessorKey: "business_hours",
      cell: (restaurant: Restaurant) => (
        restaurant.business_hours?.monday ? 
        `${restaurant.business_hours.monday.open} - ${restaurant.business_hours.monday.close}` :
        'Not set'
      ),
    },
    {
      header: "Cashback",
      accessorKey: "cashback_percentage",
      cell: (restaurant: Restaurant) => (
        <Badge variant="secondary">
          {restaurant.cashback_percentage?.toFixed(2)}%
        </Badge>
      ),
    },
    {
      header: "Orders",
      accessorKey: "orders_count",
      cell: (restaurant: Restaurant) => (
        <div className="text-right">{restaurant.orders_count || 0}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: () => <Badge>Active</Badge>,
    },
  ]

  return (
    <DataTable
      data={initialData}
      columns={columns}
      searchPlaceholder="Search restaurants..."
      searchKeys={["name", "address", "phone", "email"]}
      gridViewRender={(restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      )}
      onRowClick={(restaurant) => router.push(`/restaurants/${restaurant.id}`)}
      initialViewMode="grid"
    />
  )
} 