"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MenuItem } from "@/lib/types"
import { MenuItemCard } from "@/components/menu-item-card"

interface MenuTableProps {
  items: MenuItem[]
  initialViewMode?: "grid" | "table"
}

export function MenuTable({ items, initialViewMode = "grid" }: MenuTableProps) {
  const router = useRouter()

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (item: MenuItem) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item: MenuItem) => (
        item.category && (
          <Badge variant="secondary">
            {item.category}
          </Badge>
        )
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (item: MenuItem) => (
        <div className="text-right">${item.price.toFixed(2)}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: MenuItem) => (
        <Badge variant={item.status === "active" ? "success" : "secondary"}>
          {item.status || 'active'}
        </Badge>
      ),
    },
  ]

  return (
    <DataTable
      data={items}
      columns={columns}
      searchPlaceholder="Search menu items..."
      searchKeys={["name", "description", "category"]}
      gridViewRender={(item) => <MenuItemCard key={item.id} item={item} />}
      onRowClick={(item) => router.push(`/menu/${item.id}`)}
      initialViewMode={initialViewMode}
    />
  )
} 