"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { OrderCard } from "@/components/order-card"
import { OrdersTable } from "@/components/orders-table"
import type { Database } from "@/lib/database.types"

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  restaurant: Database['public']['Tables']['restaurants']['Row']
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_item: Database['public']['Tables']['menu_items']['Row']
  })[]
}

interface ViewToggleProps {
  orders: Order[]
}

export function ViewToggle({ orders }: ViewToggleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('table')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </>
  )
} 