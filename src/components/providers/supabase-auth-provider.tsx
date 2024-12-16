'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

interface UserWithRoles extends User {
  roles: string[];
}

interface AuthContextType {
  user: UserWithRoles | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  hasRole: () => false
})

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRoles | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const fetchUserRoles = async (userId: string) => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId)

    return roles?.map(r => r.roles.name) || []
  }

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const roles = await fetchUserRoles(session.user.id)
          setUser({ ...session.user, roles })
          
          if (event === 'SIGNED_IN') {
            const isBusinessOwner = roles.includes('business_owner')
            if (isBusinessOwner) {
              toast.success('Welcome back!', {
                description: 'You are now logged in to your business account.',
                duration: 4000,
                position: 'top-center',
              })
            }
            router.push('/')
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        setIsLoading(false)
      }
      
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role) || false
  }, [user])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        toast.error('Login failed', {
          description: error.message,
          position: 'top-center',
        })
        throw error
      }

      if (data.user) {
        const roles = await fetchUserRoles(data.user.id)
        if (roles.includes('business_owner')) {
          toast.success('Login successful!', {
            description: 'Welcome to your business dashboard.',
            position: 'top-center',
            duration: 4000,
          })
        }
        router.push('/')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Sign out failed', {
          description: error.message,
          position: 'top-center',
        })
        throw error
      }
      toast.success('Signed out successfully', {
        position: 'top-center',
      })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      signIn, 
      signOut, 
      resetPassword, 
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
} 