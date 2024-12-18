"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface AddMenuItemFormProps {
  restaurantId: string | null
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIMES = ['morning', 'afternoon', 'evening']

export function AddMenuItemForm({ restaurantId }: AddMenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(restaurantId || '');
  const supabase = createClientComponentClient<Database>();

  // Fetch restaurants when component mounts
  useEffect(() => {
    async function loadRestaurants() {
      try {
        setIsLoading(true)
        
        // Get the current user's ID
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Get restaurants owned by the user
        const { data: userRestaurants, error: restaurantsError } = await supabase
          .from('restaurant_users')
          .select('restaurant_id')
          .eq('user_id', session.user.id)

        if (restaurantsError) throw restaurantsError

        const restaurantIds = userRestaurants.map(r => r.restaurant_id)

        // Get restaurant details
        const { data: restaurantsData, error: detailsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .order('name')

        if (detailsError) throw detailsError
        
        setRestaurants(restaurantsData)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRestaurants()
  }, [supabase])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      // Get selected days and times
      const available_days = DAYS.filter(day => 
        formData.get(`day-${day}`) === 'on'
      )
      
      const available_times = TIMES.filter(time => 
        formData.get(`time-${time}`) === 'on'
      )

      const menuItemData = {
        name: formData.get('name') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        restaurant_id: restaurantId || selectedRestaurant,
        preparation_time: parseInt(formData.get('preparation_time') as string),
        image_url: formData.get('image_url') as string,
        availability: formData.get('availability') as string,
        available_days,
        available_times,
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([menuItemData]);

      if (error) throw error;

      setIsOpen(false);
      // Optionally refresh the page or update the list
      window.location.reload();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Menu Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {!restaurantId && (
            <div className="grid gap-2">
              <Label htmlFor="restaurant">Restaurant</Label>
              <Select
                value={selectedRestaurant}
                onValueChange={setSelectedRestaurant}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price *</Label>
            <Input id="price" name="price" type="number" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Input id="category" name="category" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" placeholder="e.g., Main Course, Appetizer" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cuisine_type">Cuisine Type</Label>
            <Input id="cuisine_type" name="cuisine_type" placeholder="e.g., Italian, Mexican" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dietary">Dietary Restrictions (comma-separated)</Label>
            <Input id="dietary" name="dietary" placeholder="vegetarian, vegan, gluten-free" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="allergens">Allergens (comma-separated)</Label>
            <Input id="allergens" name="allergens" placeholder="nuts, dairy, shellfish" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="calories">Calories</Label>
              <Input id="calories" name="calories" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input id="protein" name="protein" type="number" step="0.1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carbohydrates">Carbohydrates (g)</Label>
              <Input id="carbohydrates" name="carbohydrates" type="number" step="0.1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input id="fat" name="fat" type="number" step="0.1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input id="fiber" name="fiber" type="number" step="0.1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="added_sugars">Added Sugars (g)</Label>
              <Input id="added_sugars" name="added_sugars" type="number" step="0.1" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="processed_food">Processed Food</Label>
            <Select name="processed_food">
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="food_benefits">Health Benefits (comma-separated)</Label>
            <Input id="food_benefits" name="food_benefits" placeholder="high-protein, antioxidants" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="healthy_score">Health Score (0-100)</Label>
            <Input 
              id="healthy_score" 
              name="healthy_score" 
              type="number" 
              min="0" 
              max="100" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ingredients">Ingredients (comma-separated) *</Label>
            <Input id="ingredients" name="ingredients" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dressing">Dressing/Sauce</Label>
            <Input id="dressing" name="dressing" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preparation_time">Preparation Time (minutes) *</Label>
            <Input id="preparation_time" name="preparation_time" type="number" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input id="image_url" name="image_url" type="url" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="availability">Availability</Label>
            <Select name="availability" defaultValue="available">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Available Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day}`}
                      name="available_days"
                      value={day}
                      defaultChecked
                    />
                    <Label 
                      htmlFor={`day-${day}`}
                      className="capitalize"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Available Times</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIMES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`time-${time}`}
                      name="available_times"
                      value={time}
                      defaultChecked
                    />
                    <Label 
                      htmlFor={`time-${time}`}
                      className="capitalize"
                    >
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 