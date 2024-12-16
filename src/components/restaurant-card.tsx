"use client"

import { Store, MapPin, Phone, Mail, Globe, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"] & {
  orders_count: number
}

interface RestaurantCardProps {
  restaurant: Restaurant
  showActions?: boolean
}

export function RestaurantCard({ restaurant, showActions = true }: RestaurantCardProps) {
  const router = useRouter()

  const renderOrdersCount = () => {
    const ordersCount = restaurant.orders_count
    
    return (
      <span className="text-sm text-muted-foreground">
        {ordersCount === 0 
          ? "No orders yet" 
          : `${ordersCount} ${ordersCount === 1 ? 'order' : 'orders'}`}
      </span>
    );
  };

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
            <div className="flex items-center gap-2">
              <Badge>Active</Badge>
              {renderOrdersCount()}
            </div>
            {restaurant.cashback_percentage !== null && restaurant.cashback_percentage > 0 && (
              <div className="flex items-center text-sm text-green-600 dark:text-green-500">
                <Percent className="h-4 w-4 mr-1" />
                {restaurant.cashback_percentage?.toFixed(2)}% cashback
              </div>
            )}
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
              if (restaurant.website) {
                window.open(restaurant.website, '_blank')
              }
            }}
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-blue-500 hover:underline">
              {restaurant.website ? new URL(restaurant.website).hostname : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 