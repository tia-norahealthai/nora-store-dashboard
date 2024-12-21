"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Store, Loader2, Mail, Phone, Globe, Clock } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { BusinessOwnerWrapper } from "@/components/business-owner-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { AddMenuItem } from '@/components/add-menu-item'

interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

type Step = 'basic' | 'hours' | 'cashback'

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [cashbackPercentage, setCashbackPercentage] = useState('5')
  const [error, setError] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurantName, setRestaurantName] = useState<string>('')
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  })
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [showMenuItemForm, setShowMenuItemForm] = useState(false)
  const [isSetupCompleted, setIsSetupCompleted] = useState(false)

  // Load the user's restaurant
  useEffect(() => {
    async function loadRestaurant() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('No user found')
          return
        }

        // First get the user's restaurant ID from restaurant_users table
        const { data: userRestaurant, error: userRestaurantError } = await supabase
          .from('restaurant_users')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (userRestaurantError) {
          console.error('Error fetching user restaurant:', userRestaurantError.message)
          setError('Error loading restaurant details')
          return
        }

        // If no restaurant association exists
        if (!userRestaurant) {
          console.log('No restaurant association found for user')
          setError('No restaurant found. Please contact support.')
          return
        }

        // Then get the restaurant details
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', userRestaurant.restaurant_id)
          .single()

        if (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError.message)
          setError('Error loading restaurant details')
          return
        }

        if (!restaurant) {
          console.log('No restaurant found with ID:', userRestaurant.restaurant_id)
          setError('Restaurant not found. Please contact support.')
          return
        }

        // Check if setup is completed
        const isCompleted = Boolean(
          restaurant.address &&
          restaurant.phone &&
          restaurant.business_hours &&
          restaurant.cashback_percentage !== null
        )

        setIsSetupCompleted(isCompleted)

        // Successfully found restaurant
        setRestaurantId(restaurant.id)
        setRestaurantName(restaurant.name || '')
        setAddress(restaurant.address || '')
        setPhone(restaurant.phone || '')
        setEmail(restaurant.email || '')
        setWebsite(restaurant.website || '')
        setLogoUrl(restaurant.logo_url || '')
        setCashbackPercentage(restaurant.cashback_percentage?.toString() || '5')
        
        // Set business hours with fallback to default values
        if (restaurant.business_hours) {
          setBusinessHours(prev => ({
            ...prev,
            ...restaurant.business_hours
          }))
        }
        
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error loading restaurant:', error)
        setError('An unexpected error occurred')
      }
    }

    loadRestaurant()
  }, [supabase])

  // Helper function to get step title
  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'basic':
        return 'Basic Information'
      case 'hours':
        return 'Business Hours'
      case 'cashback':
        return 'Cashback Settings'
      default:
        return ''
    }
  }

  // Helper function to render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={isLoading}
                  className="pl-9"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={isLoading}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of your restaurant's logo image
              </p>
            </div>
          </div>
        )

      case 'hours':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>Business Hours</Label>
            </div>
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-center">
                <Label className="capitalize">{day}</Label>
                <div className={hours.closed ? "opacity-50" : ""}>
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                    disabled={isLoading || hours.closed}
                  />
                </div>
                <div className={hours.closed ? "opacity-50" : ""}>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                    disabled={isLoading || hours.closed}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`closed-${day}`}
                    checked={hours.closed}
                    onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`closed-${day}`} className="text-sm text-muted-foreground">
                    Closed
                  </Label>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Set your restaurant's operating hours for each day of the week, or mark days as closed
            </p>
          </div>
        )

      case 'cashback':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cashback Percentage</Label>
              <Select
                value={cashbackPercentage}
                onValueChange={setCashbackPercentage}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select percentage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="2">2%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This percentage will be given back to customers as cashback on their orders.
              </p>
            </div>
          </div>
        )
    }
  }

  // Helper function to handle step navigation
  const handleNext = () => {
    switch (currentStep) {
      case 'basic':
        setCurrentStep('hours')
        break
      case 'hours':
        setCurrentStep('cashback')
        break
      case 'cashback':
        handleSubmit()
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'hours':
        setCurrentStep('basic')
        break
      case 'cashback':
        setCurrentStep('hours')
        break
    }
  }

  // Modified handleSubmit to show success message
  const handleSubmit = async () => {
    if (!restaurantId) {
      console.error('No restaurant ID available')
      setError('Unable to update restaurant. Please try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          address,
          phone,
          email,
          website,
          logo_url: logoUrl,
          business_hours: businessHours,
          cashback_percentage: parseFloat(cashbackPercentage)
        })
        .eq('id', restaurantId)

      if (updateError) {
        console.error('Error updating restaurant:', updateError)
        setError('Failed to update restaurant details. Please try again.')
        return
      }

      // Show success message
      toast.success('Setup completed!', {
        description: 'Your restaurant profile has been updated successfully.'
      })

      // Show menu item form instead of redirecting
      setShowMenuItemForm(true)
    } catch (err) {
      console.error('Error updating restaurant:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessHoursChange = (
    day: string,
    type: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }))
  }

  // Add skip handler
  const handleSkipMenuItemForm = () => {
    router.push('/dashboard')
    router.refresh()
  }

  if (isSetupCompleted) {
    return (
      <BusinessOwnerWrapper>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Add Menu Item</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-4 p-4 pt-0">
                <AddMenuItem
                  restaurantId={restaurantId!}
                  onSkip={handleSkipMenuItemForm}
                />
              </div>
            </div>
          </SidebarInset>
          <ChatSidebar />
        </SidebarProvider>
      </BusinessOwnerWrapper>
    )
  }

  return (
    <BusinessOwnerWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Onboarding</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0">
              {showMenuItemForm ? (
                <AddMenuItem
                  restaurantId={restaurantId!}
                  onSkip={handleSkipMenuItemForm}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Welcome to Nora!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-6 text-center mb-8">
                      <Store className="h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {restaurantName ? `Complete setup for ${restaurantName}` : 'Set up your business'}
                        </h2>
                        <p className="text-muted-foreground max-w-[600px]">
                          {getStepTitle(currentStep)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      {renderStepContent()}

                      <div className="flex justify-between pt-4">
                        {currentStep !== 'basic' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                          >
                            Back
                          </Button>
                        )}
                        <Button
                          type="button"
                          className={currentStep === 'basic' ? 'w-full' : 'ml-auto'}
                          onClick={handleNext}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : currentStep === 'cashback' ? (
                            'Complete Setup'
                          ) : (
                            'Next'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    </BusinessOwnerWrapper>
  )
} 