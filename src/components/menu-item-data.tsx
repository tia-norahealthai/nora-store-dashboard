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
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{menuItem.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{menuItem.description}</p>
          <p className="mt-2 font-semibold">Price: ${menuItem.price.toFixed(2)}</p>
        </CardContent>
      </Card>

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
              {menuItem.calories !== undefined && (
                <TableRow>
                  <TableCell>Calories</TableCell>
                  <TableCell>{menuItem.calories} kcal</TableCell>
                </TableRow>
              )}
              {menuItem.protein !== undefined && (
                <TableRow>
                  <TableCell>Protein</TableCell>
                  <TableCell>{menuItem.protein}g</TableCell>
                </TableRow>
              )}
              {menuItem.carbohydrates !== undefined && (
                <TableRow>
                  <TableCell>Carbohydrates</TableCell>
                  <TableCell>{menuItem.carbohydrates}g</TableCell>
                </TableRow>
              )}
              {menuItem.fat !== undefined && (
                <TableRow>
                  <TableCell>Fat</TableCell>
                  <TableCell>{menuItem.fat}g</TableCell>
                </TableRow>
              )}
              {menuItem.fiber !== undefined && (
                <TableRow>
                  <TableCell>Fiber</TableCell>
                  <TableCell>{menuItem.fiber}g</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 