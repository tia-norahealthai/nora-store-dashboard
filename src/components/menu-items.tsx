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
import Link from 'next/link'
import { ITEMS_PER_PAGE } from "@/lib/constants"

interface MenuItemsProps {
  initialItems: MenuItem[]
  restaurantId: string
  totalItems: number
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
    
    // Validate URL format
    if (!url.match(/^https?:\/\//)) {
      console.warn('Invalid URL format:', url)
      return '/images/placeholder-dish.jpg'
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

export function MenuItems({ initialItems, restaurantId, totalItems }: MenuItemsProps) {
  const [items, setItems] = useState(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  // Fetch restaurant names for all menu items
  useEffect(() => {
    async function fetchRestaurants() {
      const restaurantIds = Array.from(new Set(items.map(item => item.restaurant_id)))
      
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
  }, [items, supabase])

  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean)

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const fetchPage = async (page: number) => {
    setLoading(true)
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name')
      .range(start, end)

    if (error) {
      console.error('Error fetching menu items:', error)
    } else {
      setItems(data || [])
      setCurrentPage(page)
    }
    setLoading(false)
  }

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
          <Link 
            key={item.id} 
            href={`/menu/${item.id}`}
            className="block transition-colors hover:bg-muted/50 rounded-lg"
          >
            <div className="p-6 rounded-lg border">
              <div className="relative w-full aspect-[4/3] mb-4 rounded-md overflow-hidden">
                <Image
                  src={getValidImageUrl(item.image_url)}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {item.restaurant_id && restaurants[item.restaurant_id] && (
                <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
                  <Store className="h-4 w-4" />
                  {restaurants[item.restaurant_id]}
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <div className="text-lg font-semibold">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
              {item.category && (
                <Badge variant="secondary" className="mt-2">
                  {item.category}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => fetchPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => fetchPage(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 