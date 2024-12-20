"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Store, DollarSign, UtensilsCrossed, AlertCircle } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

type MenuItemStep = 'basic' | 'details' | 'pricing'

interface AddFirstMenuItemProps {
  restaurantId: string
  onSkip: () => void
}

// Add required field indicator component
const RequiredIndicator = () => (
  <span className="text-destructive ml-1">*</span>
)

export function AddFirstMenuItem({ restaurantId, onSkip }: AddFirstMenuItemProps) {
  const [currentStep, setCurrentStep] = useState<MenuItemStep>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [allergens, setAllergens] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [preparationTime, setPreparationTime] = useState<number>(0)
  const [calories, setCalories] = useState<number>(0)
  const [protein, setProtein] = useState<number>(0)
  const [carbohydrates, setCarbohydrates] = useState<number>(0)
  const [fat, setFat] = useState<number>(0)
  const [fiber, setFiber] = useState<number>(0)
  const [type, setType] = useState<string>('')
  const [cuisineType, setCuisineType] = useState('')
  const [averageRating, setAverageRating] = useState<number>(0)
  const [addedSugars, setAddedSugars] = useState<number>(0)
  const [processedFood, setProcessedFood] = useState(false)
  const [dressing, setDressing] = useState('')
  const [foodBenefits, setFoodBenefits] = useState('')
  const [healthyScore, setHealthyScore] = useState<number>(0)
  const [availability, setAvailability] = useState(false)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const supabase = createClientComponentClient()
  const router = useRouter()

  // Helper function to get step title
  const getStepTitle = (step: MenuItemStep) => {
    switch (step) {
      case 'basic':
        return 'Basic Information'
      case 'details':
        return 'Item Details'
      case 'pricing':
        return 'Pricing'
      default:
        return ''
    }
  }

  // Helper function to handle step navigation
  const handleNext = () => {
    switch (currentStep) {
      case 'basic':
        if (!name.trim()) {
          setError('Please enter the item name')
          return
        }
        setCurrentStep('details')
        break
      case 'details':
        if (!description.trim()) {
          setError('Please enter the item description')
          return
        }
        setCurrentStep('pricing')
        break
      case 'pricing':
        if (!price.trim() || isNaN(parseFloat(price))) {
          setError('Please enter a valid price')
          return
        }
        handleSubmit()
        break
    }
    setError(null)
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('basic')
        break
      case 'pricing':
        setCurrentStep('details')
        break
    }
    setError(null)
  }

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  // Helper function to convert comma-separated string to array
  const stringToArray = (str: string): string[] => {
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }

  // Update handleSubmit to handle arrays correctly
  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!name.trim()) {
        setError('Item name is required')
        return
      }

      if (!description.trim()) {
        setError('Description is required')
        return
      }

      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        setError('Please enter a valid price')
        return
      }

      if (!type) {
        setError('Please select a type')
        return
      }

      if (!category) {
        setError('Please select a category')
        return
      }

      // Create time ranges array
      const timeRangesArray = availableTimes.map(time => {
        switch (time) {
          case 'morning':
            return '{"start": "06:00", "end": "11:59"}'
          case 'afternoon':
            return '{"start": "12:00", "end": "16:59"}'
          case 'evening':
            return '{"start": "17:00", "end": "23:59"}'
          default:
            return null
        }
      }).filter(Boolean)

      // Prepare the data with explicit type handling
      const menuItemData = {
        restaurant_id: restaurantId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        image_url: imageUrl.trim() || null,
        dietary: dietary.length > 0 ? dietary : [],
        allergens: allergens.length > 0 ? allergens : [],
        ingredients: ingredients.length > 0 ? ingredients : [],
        preparation_time: preparationTime > 0 ? preparationTime : null,
        calories: calories > 0 ? calories : null,
        protein: protein > 0 ? protein : null,
        carbohydrates: carbohydrates > 0 ? carbohydrates : null,
        fat: fat > 0 ? fat : null,
        fiber: fiber > 0 ? fiber : null,
        type,
        cuisine_type: cuisineType.trim() || null,
        average_rating: averageRating > 0 ? averageRating : null,
        added_sugars: addedSugars > 0 ? addedSugars : null,
        processed_food: processedFood,
        dressing: dressing.trim() || null,
        food_benefits: foodBenefits.trim() || null,
        healthy_score: healthyScore > 0 ? healthyScore : null,
        availability,
        available_days: availableDays.length > 0 ? availableDays : [],
        available_times: availableTimes.length > 0 ? availableTimes : [],
        time_ranges: timeRangesArray.length > 0 ? `{${timeRangesArray.join(',')}}` : '{}'
      }

      console.log('Submitting menu item data:', JSON.stringify(menuItemData, null, 2))

      try {
        // First, verify the restaurant exists and user has access
        const { data: restaurantCheck, error: restaurantCheckError } = await supabase
          .from('restaurant_users')
          .select('restaurant_id')
          .eq('restaurant_id', restaurantId)
          .single()

        if (restaurantCheckError) {
          throw new Error(`Failed to verify restaurant access: ${restaurantCheckError.message}`)
        }

        if (!restaurantCheck) {
          throw new Error('You do not have access to this restaurant')
        }

        console.log('Restaurant access verified:', restaurantCheck)

        // Create the menu item
        const { data, error: insertError } = await supabase
          .from('menu_items')
          .insert([menuItemData])
          .select()

        if (insertError) {
          throw new Error(`Failed to create menu item: ${insertError.message}`)
        }

        if (!data || data.length === 0) {
          throw new Error('No data returned from insert')
        }

        console.log('Menu item created successfully:', data[0])

        toast.success('Menu item added!', {
          description: 'Your first menu item has been created successfully.'
        })

        router.push('/dashboard')
        router.refresh()
      } catch (error) {
        console.error('Operation failed:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    } catch (err) {
      console.error('Form validation error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Item Name
                <RequiredIndicator />
              </Label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Type
                <RequiredIndicator />
              </Label>
              <Select
                value={type}
                onValueChange={setType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appetizer">Appetizer</SelectItem>
                  <SelectItem value="main">Main Course</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="side">Side Dish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category
                <RequiredIndicator />
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine_type">
                Cuisine Type
              </Label>
              <Input
                id="cuisine_type"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Italian, Mexican, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparation_time">
                Preparation Time (minutes)
              </Label>
              <Input
                id="preparation_time"
                type="number"
                min="0"
                value={preparationTime}
                onChange={(e) => setPreparationTime(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_days">
                Available Days
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={availableDays.includes(day)}
                      onCheckedChange={(checked) => {
                        setAvailableDays(prev =>
                          checked
                            ? [...prev, day]
                            : prev.filter(d => d !== day)
                        )
                      }}
                    />
                    <Label htmlFor={`day-${day}`} className="capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_times">
                Available Times
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['morning', 'afternoon', 'evening'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${time}`}
                      checked={availableTimes.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked && !availableTimes.includes(time)) {
                          setAvailableTimes([...availableTimes, time])
                        } else if (!checked) {
                          setAvailableTimes(availableTimes.filter(t => t !== time))
                        }
                      }}
                    />
                    <Label htmlFor={`time-${time}`} className="capitalize">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availability"
                  checked={availability}
                  onCheckedChange={(checked) => setAvailability(!!checked)}
                />
                <Label htmlFor="availability">Currently Available</Label>
              </div>
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Description
                <RequiredIndicator />
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Describe your menu item..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Nutritional Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbohydrates">Carbohydrates (g)</Label>
                  <Input
                    id="carbohydrates"
                    type="number"
                    min="0"
                    step="0.1"
                    value={carbohydrates}
                    onChange={(e) => setCarbohydrates(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fiber}
                    onChange={(e) => setFiber(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="added_sugars">Added Sugars (g)</Label>
                  <Input
                    id="added_sugars"
                    type="number"
                    min="0"
                    step="0.1"
                    value={addedSugars}
                    onChange={(e) => setAddedSugars(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="processed_food"
                  checked={processedFood}
                  onCheckedChange={(checked) => setProcessedFood(!!checked)}
                />
                <Label htmlFor="processed_food">Processed Food</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food_benefits">Health Benefits</Label>
              <Textarea
                id="food_benefits"
                value={foodBenefits}
                onChange={(e) => setFoodBenefits(e.target.value)}
                disabled={isLoading}
                placeholder="Enter the health benefits of this item..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthy_score">
                Health Score (0-100)
              </Label>
              <Input
                id="healthy_score"
                type="number"
                min="0"
                max="100"
                value={healthyScore}
                onChange={(e) => setHealthyScore(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={ingredients.join(', ')}
                onChange={(e) => setIngredients(stringToArray(e.target.value))}
                disabled={isLoading}
                placeholder="Enter ingredients, separated by commas..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary Information</Label>
              <Input
                id="dietary"
                value={dietary.join(', ')}
                onChange={(e) => setDietary(stringToArray(e.target.value))}
                disabled={isLoading}
                placeholder="e.g., vegetarian, vegan, gluten-free"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens</Label>
              <Input
                id="allergens"
                value={allergens.join(', ')}
                onChange={(e) => setAllergens(stringToArray(e.target.value))}
                disabled={isLoading}
                placeholder="e.g., nuts, dairy, gluten"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dressing">Dressing/Sauce</Label>
              <Input
                id="dressing"
                value={dressing}
                onChange={(e) => setDressing(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Ranch dressing, Marinara sauce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of your menu item's image (optional)
              </p>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price
                <RequiredIndicator />
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_rating">
                Average Rating (0-5)
              </Label>
              <Input
                id="average_rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={averageRating}
                onChange={(e) => setAverageRating(parseFloat(e.target.value) || 0)}
                disabled={isLoading}
                placeholder="0.0"
              />
            </div>
          </div>
        )
    }
  }

  // Update the form fields for array inputs
  const renderArrayInput = (
    id: string,
    label: string,
    value: string[],
    onChange: (value: string[]) => void,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value.join(', ')}
        onChange={(e) => onChange(stringToArray(e.target.value))}
        disabled={isLoading}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
    </div>
  )

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Add Your First Menu Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4">
            {currentStep !== 'basic' ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStep === 'pricing' ? 'Add Item' : 'Next'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 