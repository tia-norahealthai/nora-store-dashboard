"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"
import { MenuItem } from "@/lib/types"
import { useRouter } from "next/navigation"

interface MenuItemCardProps {
  item: MenuItem
}

function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const router = useRouter()
  const imageUrl = isValidUrl(item.image_url) 
    ? item.image_url 
    : '/placeholder-food.jpg' // Make sure to add this image to your public directory

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => router.push(`/menu/${item.id}`)}
    >
      <div className="p-6">
        <div className="relative w-full aspect-[4/3] mb-4 rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {item.restaurant_name && (
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            {item.restaurant_name}
          </div>
        )}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <div className="text-lg font-semibold">
            ${item.price.toFixed(2)}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.category && (
            <Badge variant="secondary">
              {item.category}
            </Badge>
          )}
          <Badge variant={item.status === "active" ? "success" : "secondary"}>
            {item.status || 'active'}
          </Badge>
        </div>
      </div>
    </Card>
  )
} 