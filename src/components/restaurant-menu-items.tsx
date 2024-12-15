"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/supabase/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddMenuItemForm } from "@/components/add-menu-item-form"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface RestaurantMenuItemsProps {
  restaurantId: string
}

export function RestaurantMenuItems({ restaurantId }: RestaurantMenuItemsProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function loadMenuItems() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Direct Supabase query instead of using db helper
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('name')

        if (error) throw error
        
        setMenuItems(data || [])
      } catch (err) {
        console.error('Error loading menu items:', err)
        setError(err instanceof Error ? err.message : 'Failed to load menu items')
      } finally {
        setIsLoading(false)
      }
    }

    loadMenuItems()
  }, [restaurantId, supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Menu Items ({menuItems.length})</h3>
        <AddMenuItemForm restaurantId={restaurantId} />
      </div>
      
      {menuItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No menu items found for this restaurant.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "active" ? "success" : "secondary"}>
                    {item.status || 'active'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 