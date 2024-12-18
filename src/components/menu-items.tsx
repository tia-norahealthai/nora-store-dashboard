"use client"

import { MenuTable } from "@/components/menu-table"
import type { MenuItem } from "@/lib/types"

interface MenuItemsProps {
  initialItems: MenuItem[]
  initialViewMode?: "grid" | "table"
}

export function MenuItems({ initialItems, initialViewMode = "grid" }: MenuItemsProps) {
  return <MenuTable items={initialItems} initialViewMode={initialViewMode} />
} 