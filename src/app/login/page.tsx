'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/db"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

// Add form schema for signup
const signUpFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().optional(),
  restaurant_name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
})

type SignUpFormValues = z.infer<typeof signUpFormSchema>

// Add cashback options
const CASHBACK_OPTIONS = [
  { value: "20", label: "20% - Standard Plan" },
  { value: "30", label: "30% - Premium Plan" },
  { value: "40", label: "40% - Elite Plan" },
  { value: "50", label: "50% - VIP Plan" }
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const { signIn, resetPassword, isLoading: authIsLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const [showCashbackModal, setShowCashbackModal] = useState(false)
  const [selectedCashback, setSelectedCashback] = useState("20")
  const [pendingRestaurantData, setPendingRestaurantData] = useState<any>(null)
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      restaurant_name: "",
      address: "",
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setIsLoading(true)
    try {
      await signIn(email, password)
      toast.success('Logged in successfully')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await resetPassword(resetEmail)
      toast.success('Password reset link sent to your email')
      setIsResetDialogOpen(false)
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Failed to send reset password link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsLoading(true)
    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          }
        }
      })

      if (signUpError) throw signUpError

      // Store restaurant data temporarily and show cashback modal
      if (authData.user) {
        setPendingRestaurantData({
          name: data.restaurant_name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          business_hours: {
            monday: { open: "09:00", close: "22:00" },
            tuesday: { open: "09:00", close: "22:00" },
            wednesday: { open: "09:00", close: "22:00" },
            thursday: { open: "09:00", close: "22:00" },
            friday: { open: "09:00", close: "22:00" },
            saturday: { open: "09:00", close: "22:00" },
            sunday: { open: "09:00", close: "22:00" },
          }
        })
        setShowCashbackModal(true)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Failed to create account', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add function to handle cashback selection and restaurant creation
  const handleCashbackSelection = async () => {
    setIsLoading(true)
    try {
      const restaurantData = {
        ...pendingRestaurantData,
        cashback_percentage: parseInt(selectedCashback)
      }

      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert([restaurantData])

      if (restaurantError) throw restaurantError

      toast.success('Account created successfully', {
        description: 'Please check your email to verify your account.',
      })
      setShowCashbackModal(false)
      setIsSignUp(false)
      form.reset()
      setPendingRestaurantData(null)
    } catch (error) {
      console.error('Restaurant creation error:', error)
      toast.error('Failed to create restaurant', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Logo className="w-32 h-32" />
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Nora Store Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                The complete AI platform for your restaurant business
              </p>
            </div>
          </div>
          
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {isSignUp ? 'Create an Account' : 'Sign in'}
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                {isSignUp 
                  ? 'Enter your details to create your account'
                  : 'Enter your email and password to access your account'}
              </p>
            </CardHeader>
            <CardContent>
              {isSignUp ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="restaurant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter restaurant name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter restaurant address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                // Existing login form
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            className="px-0 font-normal text-sm"
                            type="button"
                          >
                            Forgot password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Reset password</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                  id="reset-email"
                                  type="email"
                                  placeholder="Enter your email"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="pl-10"
                                  required
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              )}
              
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  type="button"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nora Store. All rights reserved.
        </p>
      </div>

      {/* Add Cashback Selection Modal */}
      <Dialog open={showCashbackModal} onOpenChange={setShowCashbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Cashback Percentage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedCashback}
              onValueChange={setSelectedCashback}
              className="gap-4"
            >
              {CASHBACK_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="text-sm text-muted-foreground">
              Select the cashback percentage you want to offer to your customers. 
              Higher cashback rates can attract more customers but will affect your margins.
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCashbackSelection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating restaurant...
                </>
              ) : (
                'Confirm & Create Restaurant'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 