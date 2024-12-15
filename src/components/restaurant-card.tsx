"use client"

import { Store, MapPin, Phone, Mail, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/supabase"

type Restaurant = Database['public']['Tables']['restaurants']['Row']

interface RestaurantCardProps {
  restaurant: Restaurant
  showActions?: boolean
}

export function RestaurantCard({ restaurant, showActions = true }: RestaurantCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="group relative rounded-lg border hover:border-foreground/50 transition-all cursor-pointer"
      onClick={() => router.push(`/restaurants/${restaurant.id}`)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <span className="group-hover:underline">{restaurant.name}</span>
            </CardTitle>
            <Badge>Active</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm">{restaurant.address}</p>
        </div>
        {restaurant.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">{restaurant.phone}</p>
          </div>
        )}
        {restaurant.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">{restaurant.email}</p>
          </div>
        )}
        {restaurant.website && (
          <div 
            className="flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              window.open(restaurant.website, '_blank')
            }}
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-blue-500 hover:underline">
              {new URL(restaurant.website).hostname}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 