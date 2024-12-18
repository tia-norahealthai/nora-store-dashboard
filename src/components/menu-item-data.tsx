"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Store, Clock, Leaf, AlertTriangle } from "lucide-react"
import type { MenuItem } from "@/types/supabase"

interface MenuItemDataProps {
  menuItem: MenuItem
}

const getValidImageUrl = (url?: string) => {
  if (!url) return '/images/placeholder-dish.jpg'
  
  // If it's a relative URL starting with /, return as is
  if (url.startsWith('/')) {
    return url
  }

  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url
  }

  // List of allowed domains
  const allowedDomains = [
    'xyhqystoebgvqjqgmqng.supabase.co',
    'images.unsplash.com',
    'images.squarespace-cdn.com',
    'xtra-static-content.s3.us-east-1.amazonaws.com'
  ]

  try {
    // Add https:// if the URL doesn't start with http:// or https://
    const urlToCheck = url.match(/^https?:\/\//) ? url : `https://${url}`
    const urlObj = new URL(urlToCheck)
    
    if (allowedDomains.includes(urlObj.hostname)) {
      return urlToCheck
    }
    
    console.warn(`Image domain not allowed: ${urlObj.hostname}`)
    return '/images/placeholder-dish.jpg'
  } catch (error) {
    console.warn('Invalid image URL:', url)
    return '/images/placeholder-dish.jpg'
  }
}

export function MenuItemData({ menuItem }: MenuItemDataProps) {
  // Helper function to safely check array existence
  const isValidArray = (arr: any): arr is any[] => {
    return Array.isArray(arr) && arr.length > 0
  }

  return (
    <div className="space-y-6">
      {/* Image and Basic Info */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src={getValidImageUrl(menuItem.image_url)}
              alt={menuItem.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{menuItem.name}</h1>
              <p className="text-xl font-semibold mt-2">${menuItem.price.toFixed(2)}</p>
            </div>
            <p className="text-muted-foreground">{menuItem.description}</p>
            <div className="flex flex-wrap gap-2">
              {menuItem.category && (
                <Badge variant="secondary">{menuItem.category}</Badge>
              )}
              {menuItem.cuisine_type && (
                <Badge variant="outline">{menuItem.cuisine_type}</Badge>
              )}
              {menuItem.type && (
                <Badge variant="outline">{menuItem.type}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Nutritional Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Nutritional Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menuItem.calories != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Calories</div>
              <div className="text-2xl">{menuItem.calories}</div>
            </div>
          )}
          {menuItem.protein != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Protein</div>
              <div className="text-2xl">{menuItem.protein}g</div>
            </div>
          )}
          {menuItem.carbohydrates != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Carbohydrates</div>
              <div className="text-2xl">{menuItem.carbohydrates}g</div>
            </div>
          )}
          {menuItem.fat != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Fat</div>
              <div className="text-2xl">{menuItem.fat}g</div>
            </div>
          )}
          {menuItem.fiber != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Fiber</div>
              <div className="text-2xl">{menuItem.fiber}g</div>
            </div>
          )}
          {menuItem.added_sugars != null && (
            <div className="p-4 border rounded-lg">
              <div className="font-semibold">Added Sugars</div>
              <div className="text-2xl">{menuItem.added_sugars}g</div>
            </div>
          )}
        </div>
      </Card>

      {/* Additional Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Preparation & Availability Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preparation & Availability</h2>
          <div className="space-y-3">
            {menuItem.preparation_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{menuItem.preparation_time} minutes</span>
              </div>
            )}
            {menuItem.available_days && (
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {menuItem.available_days.map((day) => (
                    <Badge key={day} variant="outline">{day}</Badge>
                  ))}
                </div>
              </div>
            )}
            {menuItem.time_ranges && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  {Object.entries(menuItem.time_ranges).map(([day, ranges]) => (
                    <div key={day} className="mb-1">
                      <span className="font-medium">{day}: </span>
                      {Array.isArray(ranges) ? ranges.join(', ') : 'All day'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {menuItem.available_times && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {menuItem.available_times.map((time) => (
                    <Badge key={time} variant="outline">{time}</Badge>
                  ))}
                </div>
              </div>
            )}
            {menuItem.availability !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant={menuItem.availability ? "success" : "secondary"}>
                  {menuItem.availability ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            )}
          </div>
        </Card>

        {/* Dietary Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dietary Information</h2>
          <div className="space-y-4">
            {isValidArray(menuItem.dietary) && (
              <div className="flex flex-wrap gap-2">
                <Leaf className="h-5 w-5 text-muted-foreground" />
                {menuItem.dietary.map((diet) => (
                  <Badge key={diet} variant="secondary">{diet}</Badge>
                ))}
              </div>
            )}
            {isValidArray(menuItem.allergens) && (
              <div className="flex flex-wrap gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                {menuItem.allergens.map((allergen) => (
                  <Badge key={allergen} variant="destructive">{allergen}</Badge>
                ))}
              </div>
            )}
            {menuItem.dressing && (
              <div className="mt-2">
                <h3 className="font-semibold mb-1">Dressing</h3>
                <p>{menuItem.dressing}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ingredients and Benefits */}
      <div className="grid gap-6 md:grid-cols-2">
        {isValidArray(menuItem.ingredients) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <div className="flex flex-wrap gap-2">
              {menuItem.ingredients.map((ingredient) => (
                <Badge key={ingredient} variant="outline">{ingredient}</Badge>
              ))}
            </div>
          </Card>
        )}

        {isValidArray(menuItem.food_benefits) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Health Benefits</h2>
            <div className="flex flex-wrap gap-2">
              {menuItem.food_benefits.map((benefit) => (
                <Badge key={benefit} variant="secondary">{benefit}</Badge>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Health Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Health Information</h2>
        <div className="space-y-4">
          {menuItem.healthy_score != null && (
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{menuItem.healthy_score}/100</div>
            </div>
          )}
          {menuItem.processed_food !== undefined && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Processing Status</h3>
              <Badge variant={menuItem.processed_food ? "destructive" : "success"}>
                {menuItem.processed_food ? "Contains processed ingredients" : "Made with whole ingredients"}
              </Badge>
            </div>
          )}
          {menuItem.average_rating != null && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Average Rating</h3>
              <div className="text-2xl font-bold">{menuItem.average_rating.toFixed(1)}/5.0</div>
            </div>
          )}
        </div>
      </Card>

      {/* Restaurant Information */}
      {menuItem.restaurant_id && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <span>Restaurant ID: {menuItem.restaurant_id}</span>
          </div>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Item History</h2>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Created: {new Date(menuItem.created_at).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Last Updated: {new Date(menuItem.updated_at).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  )
} 