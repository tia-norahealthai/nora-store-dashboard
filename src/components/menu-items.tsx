"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { 
  MoreHorizontal, 
  Search, 
  Plus,
  Trash2,
  Edit,
  Filter
} from "lucide-react"
import type { MenuItem } from '@/types/store'
import Image from "next/image"
import { useMariaContext } from "@/contexts/maria-context"
import { AddMenuItemForm } from './add-menu-item-form'

interface MenuItemsProps {
  initialItems: MenuItem[]
}

export function MenuItems({ initialItems }: MenuItemsProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const mariaContext = useMariaContext()

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    // Prevent click event from bubbling up when clicking dropdown
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      e.stopPropagation()
      return
    }
    router.push(`/menu/${itemId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <AddMenuItemForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg border p-4 hover:border-foreground/50 cursor-pointer"
            onClick={(e) => handleItemClick(e, item.id)}
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b p-0">
                <div className="aspect-video relative bg-muted">
                  {item.image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">${item.price.toFixed(2)}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="dropdown-trigger"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/menu/${item.id}`)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <p className="text-lg font-semibold">No menu items found</p>
          <p className="text-sm">Try adjusting your search or add new items</p>
        </div>
      )}
    </div>
  )
} 