"use client"

import { useEffect } from "react"
import { useMenu } from "@/hooks/use-menu"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const DEFAULT_IMAGE = "/file.svg"

function getImageUrl(url: string | null): string {
  if (!url) return DEFAULT_IMAGE;
  
  try {
    if (url.includes('images.unsplash.com')) {
      return url;
    }
    
    if (url.includes('unsplash.com/photos/')) {
      const photoId = url.split('/').pop()?.split('-')[0] || '';
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
    }
    
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return DEFAULT_IMAGE;
  }
}

interface MenuItemsProps {
  initialItems: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    status: string;
    ingredients: string[];
    nutritional_info: any;
    preparation_time: number;
  }[];
}

export function MenuItems({ initialItems }: MenuItemsProps) {
  const router = useRouter()
  const { menuItems, isLoading, fetchMenuItems, deleteMenuItem } = useMenu()
  const { executeCommand } = useMariaContext()

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const handleDelete = async (id: string) => {
    try {
      await executeCommand('deleteMenuItem', { id })
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Menu Items</h2>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search menu items..."
              className="h-9"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Sort by name
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sort by price
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sort by category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <AddMenuItemForm />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item) => (
            <Card key={item.id} data-menu-item>
              <CardHeader className="relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="object-cover"
                    width={400}
                    height={400}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute right-2 top-2 h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/menu/${item.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <CardTitle className="line-clamp-1">{item.name}</CardTitle>
                <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="secondary" data-category>
                    {item.category}
                  </Badge>
                  <span className="font-semibold">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 