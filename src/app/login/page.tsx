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
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const { signIn, resetPassword, isLoading: authIsLoading } = useAuth()

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

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'your-email@example.com',
      password: 'your-password'
    })
    
    if (error) {
      console.error('Error signing up:', error.message)
    } else {
      console.log('Signup successful:', data)
    }
  }

  return (
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
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Enter your email and password to access your account
            </p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nora Store. All rights reserved.
      </p>
    </div>
  )
} 