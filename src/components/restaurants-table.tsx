"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/supabase/db"
import type { Database } from "@/lib/database.types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, MapPin, Phone, Mail, Globe } from "lucide-react"
import Link from "next/link"
import { AddRestaurantForm } from "@/components/add-restaurant-form"

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export function RestaurantsTable() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRestaurants = async () => {
    try {
      const data = await db.restaurants.getAll()
      setRestaurants(data)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  if (isLoading) {
    return <div>Loading restaurants...</div>
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Restaurants</h2>
          <AddRestaurantForm onSuccess={loadRestaurants} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell className="font-medium">{restaurant.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {restaurant.address}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {restaurant.phone}
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {restaurant.email}
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {new URL(restaurant.website).hostname}
                      </a>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {restaurant.business_hours?.monday.open} - {restaurant.business_hours?.monday.close}
                </div>
              </TableCell>
              <TableCell>
                <Badge>Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/restaurants/${restaurant.id}`}>
                    View Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 