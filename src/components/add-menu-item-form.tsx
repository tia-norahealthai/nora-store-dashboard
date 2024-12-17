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
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category'),
      image_url: formData.get('image_url'),
      status: 'active',
      ingredients: (formData.get('ingredients') as string).split(',').map(i => i.trim()),
      preparation_time: parseInt(formData.get('preparation_time') as string),
      restaurant_id: selectedRestaurant
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
      <DialogContent className="sm:max-w-[425px]">
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ingredients">
              Ingredients (comma-separated)
            </Label>
            <Input id="ingredients" name="ingredients" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preparation_time">
              Preparation Time (minutes)
            </Label>
            <Input 
              id="preparation_time" 
              name="preparation_time" 
              type="number" 
              required 
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 