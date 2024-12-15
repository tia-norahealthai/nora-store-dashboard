"use client"

import { AddRestaurantForm } from "@/components/add-restaurant-form"

export function RestaurantHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight">Restaurants</h2>
      <AddRestaurantForm onSuccess={() => {
        // Optionally refresh the data here
      }} />
    </div>
  )
} 