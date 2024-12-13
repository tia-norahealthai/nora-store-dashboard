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
import { Clock, MapPin, Phone, Mail, Globe, Store, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { AddRestaurantForm } from "@/components/add-restaurant-form"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export function RestaurantsTable() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
            <TableRow 
              key={restaurant.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/restaurants/${restaurant.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  {restaurant.name}
                </div>
              </TableCell>
              <TableCell>{restaurant.address}</TableCell>
              <TableCell>
                {restaurant.phone || restaurant.email}
              </TableCell>
              <TableCell>
                {restaurant.business_hours?.monday?.open} - {restaurant.business_hours?.monday?.close}
              </TableCell>
              <TableCell>
                <Badge>Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/restaurants/${restaurant.id}`)
                      }}
                    >
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // Add edit functionality
                      }}
                    >
                      Edit restaurant
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 