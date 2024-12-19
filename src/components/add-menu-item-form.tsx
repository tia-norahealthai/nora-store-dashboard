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
import { Progress } from "@/components/ui/progress"

interface AddMenuItemFormProps {
  restaurantId: string | undefined
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TIMES = ['morning', 'afternoon', 'evening']
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free']
const ALLERGENS = ['dairy', 'nuts', 'eggs', 'soy', 'wheat', 'fish', 'shellfish']
const MEAL_TYPES = ['Meal', 'Snack', 'Drink']

const TOTAL_STEPS = 5;
const STEP_TITLES = [
  'Basic Information',
  'Availability',
  'Dietary Information',
  'Nutritional Information',
  'Health Information'
];

export function AddMenuItemForm({ restaurantId }: AddMenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(restaurantId || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient<Database>();

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)

      setIsAdmin(roles?.some(r => r.role === 'admin') ?? false)
    }

    checkAdminStatus()
  }, [supabase])

  // Fetch restaurants when component mounts
  useEffect(() => {
    async function loadRestaurants() {
      try {
        setIsLoading(true)
        
        // Get the current user's ID
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        let restaurantsData;

        if (isAdmin) {
          // Admin can see all restaurants
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .order('name')

          if (error) throw error
          restaurantsData = data
        } else {
          // Regular users can only see their restaurants
          const { data: userRestaurants, error: restaurantsError } = await supabase
            .from('restaurant_users')
            .select('restaurant_id')
            .eq('user_id', session.user.id)

          if (restaurantsError) throw restaurantsError

          const restaurantIds = userRestaurants.map(r => r.restaurant_id)

          // Get restaurant details
          const { data, error: detailsError } = await supabase
            .from('restaurants')
            .select('*')
            .in('id', restaurantIds)
            .order('name')

          if (detailsError) throw detailsError
          restaurantsData = data
        }
        
        setRestaurants(restaurantsData)
      } catch (error) {
        console.error('Error loading restaurants:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRestaurants()
  }, [supabase, isAdmin])

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

      // Get dietary preferences and allergens
      const dietary = DIETARY_OPTIONS.filter(option =>
        formData.get(`dietary-${option}`) === 'on'
      )

      const allergens = ALLERGENS.filter(allergen =>
        formData.get(`allergen-${allergen}`) === 'on'
      )

      // Get ingredients array
      const ingredients = formData.get('ingredients')?.toString().split(',').map(i => i.trim()) || []

      // Get food benefits array
      const food_benefits = formData.get('food_benefits')?.toString().split(',').map(b => b.trim()) || []

      const menuItemData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        type: formData.get('type') as string,
        restaurant_id: restaurantId || selectedRestaurant,
        preparation_time: parseInt(formData.get('preparation_time') as string),
        image_url: formData.get('image_url') as string,
        status: 'active',
        available_days,
        available_times,
        dietary,
        allergens,
        ingredients,
        cuisine_type: formData.get('cuisine_type') as string,
        calories: parseInt(formData.get('calories') as string) || null,
        protein: parseFloat(formData.get('protein') as string) || null,
        carbohydrates: parseFloat(formData.get('carbohydrates') as string) || null,
        fat: parseFloat(formData.get('fat') as string) || null,
        fiber: parseFloat(formData.get('fiber') as string) || null,
        added_sugars: parseFloat(formData.get('added_sugars') as string) || null,
        processed_food: formData.get('processed_food') === 'on',
        food_benefits,
        healthy_score: parseInt(formData.get('healthy_score') as string) || null,
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([menuItemData]);

      if (error) throw error;

      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {!restaurantId && (
              <div className="grid gap-2">
                <Label htmlFor="restaurant">Restaurant *</Label>
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
              <Label htmlFor="type">Type *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input id="cuisine_type" name="cuisine_type" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preparation_time">Preparation Time (minutes) *</Label>
              <Input id="preparation_time" name="preparation_time" type="number" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" name="image_url" type="url" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox id={`day-${day}`} name={`day-${day}`} />
                    <Label htmlFor={`day-${day}`} className="capitalize">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Available Times</Label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox id={`time-${time}`} name={`time-${time}`} />
                    <Label htmlFor={`time-${time}`} className="capitalize">{time}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Dietary Options</Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox id={`dietary-${option}`} name={`dietary-${option}`} />
                    <Label htmlFor={`dietary-${option}`} className="capitalize">{option}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Allergens</Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox id={`allergen-${allergen}`} name={`allergen-${allergen}`} />
                    <Label htmlFor={`allergen-${allergen}`} className="capitalize">{allergen}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
              <Textarea id="ingredients" name="ingredients" placeholder="Enter ingredients separated by commas" />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="processed_food" name="processed_food" />
                <Label htmlFor="processed_food">Contains Processed Food</Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="food_benefits">Health Benefits (comma-separated)</Label>
              <Textarea id="food_benefits" name="food_benefits" placeholder="Enter health benefits separated by commas" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="healthy_score">Health Score (0-100)</Label>
              <Input id="healthy_score" name="healthy_score" type="number" min="0" max="100" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Menu Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item - {STEP_TITLES[currentStep - 1]}</DialogTitle>
        </DialogHeader>
        <div className="mb-6">
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{STEP_TITLES[currentStep - 1]}</span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {renderStepContent()}
          
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Menu Item'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 