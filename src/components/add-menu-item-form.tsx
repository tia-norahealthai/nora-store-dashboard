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

interface AddMenuItemFormProps {
  restaurantId: string | null
}

export function AddMenuItemForm({ restaurantId }: AddMenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(restaurantId || '');
  const supabase = createClientComponentClient<Database>();

  // Fetch restaurants when component mounts
  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching restaurants:', error);
        return;
      }

      setRestaurants(data || []);
      if (!restaurantId && data?.[0]) {
        setSelectedRestaurant(data[0].id);
      }
    }

    fetchRestaurants();
  }, [restaurantId, supabase]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const newItem = {
      restaurant_id: selectedRestaurant,
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category'),
      image_url: formData.get('image_url'),
      status: 'active',
      type: formData.get('type'),
      cuisine_type: formData.get('cuisine_type'),
      dietary: (formData.get('dietary') as string)?.split(',').map(d => d.trim()) || [],
      allergens: (formData.get('allergens') as string)?.split(',').map(a => a.trim()) || [],
      ingredients: (formData.get('ingredients') as string)?.split(',').map(i => i.trim()) || [],
      preparation_time: parseInt(formData.get('preparation_time') as string),
      calories: parseInt(formData.get('calories') as string) || null,
      protein: parseFloat(formData.get('protein') as string) || null,
      carbohydrates: parseFloat(formData.get('carbohydrates') as string) || null,
      fat: parseFloat(formData.get('fat') as string) || null,
      fiber: parseFloat(formData.get('fiber') as string) || null,
      added_sugars: parseFloat(formData.get('added_sugars') as string) || null,
      processed_food: formData.get('processed_food') === 'true',
      dressing: formData.get('dressing') || null,
      food_benefits: (formData.get('food_benefits') as string)?.split(',').map(b => b.trim()) || [],
      healthy_score: parseInt(formData.get('healthy_score') as string) || null,
      availability: formData.get('availability') as string || 'available'
    };

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([newItem]);

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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 