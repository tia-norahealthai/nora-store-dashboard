"use client"

import { useEffect, useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { 
  MoreHorizontal, 
  Search, 
  Plus,
  Trash2,
  Edit,
  Filter
} from "lucide-react"
import { MenuItem } from '@/types/store'
import Image from "next/image"

export function MenuItems() {
  const router = useRouter()
  const { menuItems, isLoading, fetchMenuItems, deleteMenuItem } = useMenu()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteMenuItem(id)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/menu/${id}`)
  }

  const filteredItems = menuItems.filter((item: MenuItem) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    
    // If it's a local image (starts with /)
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // If it's a valid URL
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      // If it's not a valid URL, assume it's in the public folder
      return `/${imageUrl}`;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/menu/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item: MenuItem) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={getImageUrl(item.imageUrl) || '/placeholder-food.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">{item.description}</p>
              <div className="mt-4">
                <Badge variant="secondary">${item.price}</Badge>
                {item.category && (
                  <Badge variant="outline" className="ml-2">
                    {item.category}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No menu items found
        </div>
      )}
    </div>
  )
} 