"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, Phone, Mail, Clock } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type Restaurant = Database['public']['Tables']['restaurants']['Row']

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => router.push(`/restaurants/${restaurant.id}`)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
          </div>
          <Badge>Active</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            <p className="text-sm text-muted-foreground">{restaurant.address}</p>
          </div>

          {restaurant.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{restaurant.phone}</p>
            </div>
          )}

          {restaurant.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{restaurant.email}</p>
            </div>
          )}

          {restaurant.business_hours?.monday && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                {restaurant.business_hours.monday.open} - {restaurant.business_hours.monday.close}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary">
            {restaurant.cashback_percentage?.toFixed(2)}% Cashback
          </Badge>
        </div>
      </div>
    </Card>
  )
} 