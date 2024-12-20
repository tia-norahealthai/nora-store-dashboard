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
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

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

interface FormErrors {
  [key: string]: boolean;
}

export function AddMenuItemForm({ restaurantId }: AddMenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(restaurantId || '');
  const [selectedType, setSelectedType] = useState<string>(MEAL_TYPES[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

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

  const validateStep = (step: number, formData: FormData): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    console.log('Validating step:', step);
    console.log('Form data:', Object.fromEntries(formData.entries()));
    console.log('Selected type:', selectedType);

    switch (step) {
      case 1:
        // Basic Information validation
        const name = formData.get('name')?.toString().trim();
        const description = formData.get('description')?.toString().trim();
        const price = formData.get('price')?.toString();
        const category = formData.get('category')?.toString().trim();
        const prepTime = formData.get('preparation_time')?.toString();

        console.log('Validating fields:', {
          name,
          description,
          price,
          category,
          selectedType,
          prepTime
        });

        // Check each field and set specific errors
        if (!name) {
          newErrors.name = true;
          isValid = false;
        }
        if (!description) {
          newErrors.description = true;
          isValid = false;
        }
        if (!price || parseFloat(price) <= 0) {
          newErrors.price = true;
          isValid = false;
        }
        if (!category) {
          newErrors.category = true;
          isValid = false;
        }
        if (!prepTime || parseInt(prepTime) <= 0) {
          newErrors.preparation_time = true;
          isValid = false;
        }

        break;

      case 2:
        // Availability validation - at least one day and time must be selected
        const selectedDays = DAYS.filter(day => formData.get(`day-${day}`) === 'on');
        const selectedTimes = TIMES.filter(time => formData.get(`time-${time}`) === 'on');
        
        if (selectedDays.length === 0) {
          newErrors.days = true;
          isValid = false;
        }
        if (selectedTimes.length === 0) {
          newErrors.times = true;
          isValid = false;
        }
        break;

      // Add validation for other steps if needed
    }

    console.log('Validation result:', { isValid, errors: newErrors });
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    console.log('Current step:', currentStep);
    const form = document.querySelector('form');
    if (!form) {
      console.error('Form element not found');
      return;
    }

    const formData = new FormData(form);
    if (validateStep(currentStep, formData)) {
      console.log('Validation passed, moving to next step');
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    } else {
      console.log('Validation failed');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

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
      const ingredients = formData.get('ingredients')?.toString().split(',').map(i => i.trim()).filter(Boolean) || []

      // Get food benefits array
      const food_benefits = formData.get('food_benefits')?.toString().split(',').map(b => b.trim()).filter(Boolean) || []

      // Validate required fields
      const name = formData.get('name')?.toString().trim()
      const price = formData.get('price')?.toString()
      const category = formData.get('category')?.toString().trim()
      const type = formData.get('type')?.toString()

      if (!name || !price || !category || !type || !restaurantId) {
        throw new Error('Please fill in all required fields')
      }

      // Validate price is a valid number
      const priceValue = parseFloat(price)
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Please enter a valid price')
      }

      // Prepare nutritional info with proper null handling
      const nutritionalInfo: Record<string, number | null> = {}
      const nutritionalFields = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'added_sugars']
      
      nutritionalFields.forEach(field => {
        const value = formData.get(field)?.toString()
        const numValue = value ? parseFloat(value) : null
        nutritionalInfo[field] = !isNaN(numValue as number) ? numValue : null
      })

      const menuItemData = {
        name,
        description: formData.get('description')?.toString().trim() || null,
        price: priceValue,
        category,
        type,
        restaurant_id: restaurantId,
        preparation_time: parseInt(formData.get('preparation_time')?.toString() || '0') || null,
        image_url: formData.get('image_url')?.toString().trim() || null,
        status: 'active' as const,
        available_days: available_days.length > 0 ? available_days : DAYS,
        available_times: available_times.length > 0 ? available_times : TIMES,
        dietary: dietary.length > 0 ? dietary : [],
        allergens: allergens.length > 0 ? allergens : [],
        ingredients,
        cuisine_type: formData.get('cuisine_type')?.toString().trim() || null,
        nutritional_info: nutritionalInfo,
        processed_food: formData.get('processed_food') === 'on',
        food_benefits,
        healthy_score: parseInt(formData.get('healthy_score')?.toString() || '0') || null,
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([menuItemData])

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Menu item has been added successfully",
      })
      setIsOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Error adding menu item:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add menu item',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
                  <SelectTrigger className={cn(errors.restaurant && "border-red-500")}>
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
                {errors.restaurant && (
                  <p className="text-sm text-red-500">Please select a restaurant</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name" 
                name="name" 
                required 
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">Name is required</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                className={cn(errors.description && "border-red-500")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">Description is required</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                step="0.01" 
                required 
                className={cn(errors.price && "border-red-500")}
              />
              {errors.price && (
                <p className="text-sm text-red-500">Please enter a valid price greater than 0</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Input 
                id="category" 
                name="category" 
                required 
                className={cn(errors.category && "border-red-500")}
              />
              {errors.category && (
                <p className="text-sm text-red-500">Category is required</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
                name="type" 
                required
              >
                <SelectTrigger className={cn(errors.type && "border-red-500")}>
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
              {errors.type && (
                <p className="text-sm text-red-500">Please select a type</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input id="cuisine_type" name="cuisine_type" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preparation_time">Preparation Time (minutes) *</Label>
              <Input 
                id="preparation_time" 
                name="preparation_time" 
                type="number" 
                required 
                className={cn(errors.preparation_time && "border-red-500")}
              />
              {errors.preparation_time && (
                <p className="text-sm text-red-500">Please enter a valid preparation time</p>
              )}
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
              <Label className={cn(errors.days && "text-red-500")}>Available Days *</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox id={`day-${day}`} name={`day-${day}`} />
                    <Label htmlFor={`day-${day}`} className="capitalize">{day}</Label>
                  </div>
                ))}
              </div>
              {errors.days && (
                <p className="text-sm text-red-500">Please select at least one day</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className={cn(errors.times && "text-red-500")}>Available Times *</Label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox id={`time-${time}`} name={`time-${time}`} />
                    <Label htmlFor={`time-${time}`} className="capitalize">{time}</Label>
                  </div>
                ))}
              </div>
              {errors.times && (
                <p className="text-sm text-red-500">Please select at least one time</p>
              )}
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