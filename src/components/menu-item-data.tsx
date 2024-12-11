"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category?: string
  preparation_time?: number
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  fiber?: number
  ingredients?: string
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  allergens?: string
  image_url?: string
}

interface MenuItemDataProps {
  menuItem: MenuItem
}

export function MenuItemData({ menuItem }: MenuItemDataProps) {
  console.log('MenuItemData received:', menuItem)
  
  return (
    <div className="space-y-4">
      {/* Existing menu item info */}
      <Card>
        <CardHeader>
          <CardTitle>{menuItem.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{menuItem.description}</p>
          <p className="mt-2 font-semibold">Price: ${menuItem.price.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Nutrition card */}
      <Card>
        <CardHeader>
          <CardTitle>Nutritional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Calories</TableCell>
                <TableCell>{menuItem.calories ?? 'N/A'} kcal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Protein</TableCell>
                <TableCell>{menuItem.protein ?? 'N/A'}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Carbohydrates</TableCell>
                <TableCell>{menuItem.carbohydrates ?? 'N/A'}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fat</TableCell>
                <TableCell>{menuItem.fat ?? 'N/A'}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fiber</TableCell>
                <TableCell>{menuItem.fiber ?? 'N/A'}g</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          {/* Debug info - remove this in production */}
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-500">Debug Info:</p>
            <pre className="text-xs mt-2">
              {JSON.stringify(menuItem, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 