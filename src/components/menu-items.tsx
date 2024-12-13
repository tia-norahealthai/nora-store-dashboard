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
  Filter,
  Store
} from "lucide-react"
import type { MenuItem } from '@/types/store'
import Image from "next/image"
import { useMariaContext } from "@/contexts/maria-context"
import { AddMenuItemForm } from './add-menu-item-form'
import { CsvUpload } from './csv-upload'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

interface MenuItemsProps {
  initialItems: MenuItem[]
}

// Update the getValidImageUrl function
const getValidImageUrl = (url?: string) => {
  if (!url) return '/images/placeholder-dish.jpg'
  
  const allowedDomains = [
    'xyhqystoebgvqjqgmqng.supabase.co',
    'images.unsplash.com',
    'images.squarespace-cdn.com',
    'xtra-static-content.s3.us-east-1.amazonaws.com'
  ]
  
  try {
    // Handle relative URLs
    if (url.startsWith('/')) {
      return url
    }
    
    // Handle absolute URLs
    const urlObj = new URL(url)
    if (allowedDomains.includes(urlObj.hostname)) {
      return url
    }
    
    console.warn(`Image domain not allowed: ${urlObj.hostname}`)
    return '/images/placeholder-dish.jpg'
  } catch (error) {
    console.warn('Invalid image URL:', url)
    return '/images/placeholder-dish.jpg'
  }
}

export function MenuItems({ initialItems }: MenuItemsProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Record<string, string>>({})
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  // Fetch restaurant names for all menu items
  useEffect(() => {
    async function fetchRestaurants() {
      const restaurantIds = Array.from(new Set(menuItems.map(item => item.restaurant_id)))
      
      if (restaurantIds.length === 0) return

      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .in('id', restaurantIds)

      if (error) {
        console.error('Error fetching restaurants:', error)
        return
      }

      const restaurantMap = Object.fromEntries(
        data.map(restaurant => [restaurant.id, restaurant.name])
      )
      setRestaurants(restaurantMap)
    }

    fetchRestaurants()
  }, [menuItems, supabase])

  const categories = Array.from(new Set(menuItems.map(item => item.category))).filter(Boolean)

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory || "All Categories"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg border hover:border-foreground/50 cursor-pointer"
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b p-0">
                <div className="aspect-video relative bg-muted">
                  <div className="relative w-full h-48">
                    <Image
                      src={getValidImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div 
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/restaurants/${item.restaurant_id}`)
                      }}
                    >
                      <Store className="h-3 w-3 mr-1" />
                      {restaurants[item.restaurant_id] || 'Loading...'}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant="secondary">${item.price.toFixed(2)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
} 